using Dapper;
using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Governanca.Infrastructure.Data;

namespace Governanca.Infrastructure.Repositories;

public class WebhookOutboxRepository(IDbConnectionFactory connectionFactory) : IWebhookOutboxRepository
{
    // ─── Inserção ─────────────────────────────────────────────────────────────

    public async Task<WebhookOutbox> EnfileirarAsync(Guid? processamentoId, string payloadJson)
    {
        const string sql = @"
            INSERT INTO public.webhook_outbox
                (processamento_id, payload, status, tentativas, max_tentativas, proxima_tentativa)
            VALUES
                (@ProcessamentoId, @Payload::jsonb, 'pendente', 0, 5, now())
            RETURNING *;
        ";
        using var connection = await connectionFactory.CreateConnectionAsync();
        var row = await connection.QuerySingleAsync<WebhookOutboxRow>(sql, new
        {
            ProcessamentoId = processamentoId,
            Payload = payloadJson
        });
        return Mapear(row);
    }

    // ─── Busca com lock (SKIP LOCKED — seguro para múltiplas instâncias) ──────

    public async Task<IEnumerable<WebhookOutbox>> BuscarPendentesComLockAsync(int limite = 10)
    {
        // FOR UPDATE SKIP LOCKED: garante que duas instâncias do Worker nunca
        // processem a mesma mensagem ao mesmo tempo.
        const string sql = @"
            SELECT *
            FROM public.webhook_outbox
            WHERE status IN ('pendente', 'erro')
              AND proxima_tentativa <= now()
              AND tentativas < max_tentativas
            ORDER BY proxima_tentativa ASC
            LIMIT @Limite
            FOR UPDATE SKIP LOCKED;
        ";
        using var connection = await connectionFactory.CreateConnectionAsync();
        var rows = await connection.QueryAsync<WebhookOutboxRow>(sql, new { Limite = limite });
        return rows.Select(Mapear);
    }

    // ─── Atualizações de status ───────────────────────────────────────────────

    public async Task MarcarComoProcessandoAsync(Guid id)
    {
        const string sql = @"
            UPDATE public.webhook_outbox
            SET status = 'processando', updated_at = now()
            WHERE id = @Id;
        ";
        using var connection = await connectionFactory.CreateConnectionAsync();
        await connection.ExecuteAsync(sql, new { Id = id });
    }

    public async Task MarcarComoConcluídoAsync(Guid id)
    {
        const string sql = @"
            UPDATE public.webhook_outbox
            SET status = 'concluido', updated_at = now()
            WHERE id = @Id;
        ";
        using var connection = await connectionFactory.CreateConnectionAsync();
        await connection.ExecuteAsync(sql, new { Id = id });
    }

    public async Task RegistrarFalhaAsync(Guid id, string erroMensagem)
    {
        // Exponential backoff: 1min, 2min, 4min, 8min, 16min (2^tentativas minutos)
        const string sql = @"
            UPDATE public.webhook_outbox
            SET
                status          = 'erro',
                tentativas      = tentativas + 1,
                erro_mensagem   = @ErroMensagem,
                proxima_tentativa = now() + (POWER(2, tentativas) * INTERVAL '1 minute'),
                updated_at      = now()
            WHERE id = @Id;
        ";
        using var connection = await connectionFactory.CreateConnectionAsync();
        await connection.ExecuteAsync(sql, new { Id = id, ErroMensagem = erroMensagem });
    }

    // ─── Mapeamento ───────────────────────────────────────────────────────────

    private static WebhookOutbox Mapear(WebhookOutboxRow row) => new()
    {
        Id               = row.Id,
        ProcessamentoId  = row.ProcessamentoId,
        Payload          = row.Payload,
        Status           = row.Status,
        Tentativas       = row.Tentativas,
        MaxTentativas    = row.MaxTentativas,
        ProximaTentativa = row.ProximaTentativa,
        ErroMensagem     = row.ErroMensagem,
        CreatedAt        = row.CreatedAt,
        UpdatedAt        = row.UpdatedAt,
    };

    private sealed class WebhookOutboxRow
    {
        public Guid Id { get; set; }
        public Guid? ProcessamentoId { get; set; }
        public string Payload { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int Tentativas { get; set; }
        public int MaxTentativas { get; set; }
        public DateTime ProximaTentativa { get; set; }
        public string? ErroMensagem { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
