using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;

namespace Governanca.API.Workers;

/// <summary>
/// Worker em segundo plano responsável por despachar mensagens da fila <c>webhook_outbox</c>
/// para o webhook do N8N de forma confiável, com retry automático e controle de idempotência.
///
/// Estratégia:
///   - Polling a cada <see cref="PollingInterval"/> segundos.
///   - Usa SELECT FOR UPDATE SKIP LOCKED para evitar processamento duplicado em
///     ambientes com múltiplas réplicas do backend.
///   - Exponential backoff nas falhas: 1min, 2min, 4min, 8min, 16min.
///   - Após atingir max_tentativas, a mensagem fica com status 'erro' para
///     análise manual sem bloquear a fila.
/// </summary>
public class N8NDispatcherWorker(IServiceScopeFactory scopeFactory, ILogger<N8NDispatcherWorker> logger, IHttpClientFactory httpClientFactory) : BackgroundService
{
    private static readonly TimeSpan PollingInterval = TimeSpan.FromSeconds(15);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("[N8N Worker] Iniciado. Polling a cada {Interval}s.", PollingInterval.TotalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessarFilaAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // Erro inesperado no loop principal — loga e continua para auto-recuperação
                logger.LogError(ex, "[N8N Worker] Erro inesperado no loop principal. Retomando em {Interval}s.", PollingInterval.TotalSeconds);
            }

            await Task.Delay(PollingInterval, stoppingToken);
        }

        logger.LogInformation("[N8N Worker] Encerrado.");
    }

    private async Task ProcessarFilaAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var outboxRepo = scope.ServiceProvider.GetRequiredService<IWebhookOutboxRepository>();
        var configuracaoRepo = scope.ServiceProvider.GetRequiredService<IConfiguracaoRepository>();

        // ── 1. Buscar URL do webhook nas configurações ────────────────────────
        var cfg = await configuracaoRepo.ObterAsync();
        var webhookUrl = cfg.WebhookN8nReceberAtas;

        if (string.IsNullOrWhiteSpace(webhookUrl))
        {
            logger.LogDebug("[N8N Worker] Webhook não configurado. Nenhuma mensagem será despachada.");
            return;
        }

        // ── 2. Buscar mensagens pendentes com lock (SKIP LOCKED) ──────────────
        var mensagens = (await outboxRepo.BuscarPendentesComLockAsync(limite: 10)).ToList();

        if (mensagens.Count == 0)
        {
            logger.LogDebug("[N8N Worker] Nenhuma mensagem pendente na fila.");
            return;
        }

        logger.LogInformation("[N8N Worker] {Count} mensagem(ns) encontrada(s) para despacho.", mensagens.Count);

        var httpClient = httpClientFactory.CreateClient("N8N");

        foreach (var mensagem in mensagens)
        {
            if (ct.IsCancellationRequested) break;
            await DespacharMensagemAsync(outboxRepo, httpClient, webhookUrl, mensagem);
        }
    }

    private async Task DespacharMensagemAsync(
        IWebhookOutboxRepository outboxRepo,
        HttpClient httpClient,
        string webhookUrl,
        WebhookOutbox mensagem)
    {
        // ── 3. Marcar como 'processando' antes de tentar ──────────────────────
        await outboxRepo.MarcarComoProcessandoAsync(mensagem.Id);

        logger.LogInformation(
            "[N8N Worker] Despachando mensagem {Id} (processamento: {ProcessamentoId}, tentativa: {Tentativa}).",
            mensagem.Id, mensagem.ProcessamentoId, mensagem.Tentativas + 1);

        try
        {
            var content = new StringContent(mensagem.Payload, System.Text.Encoding.UTF8, "application/json");
            var response = await httpClient.PostAsync(webhookUrl, content);

            if (response.IsSuccessStatusCode)
            {
                await outboxRepo.MarcarComoConcluídoAsync(mensagem.Id);
                logger.LogInformation(
                    "[N8N Worker] Mensagem {Id} despachada com sucesso (HTTP {Status}).",
                    mensagem.Id, (int)response.StatusCode);
            }
            else
            {
                var body = await response.Content.ReadAsStringAsync();
                var erro = $"HTTP {(int)response.StatusCode}: {body}";
                await outboxRepo.RegistrarFalhaAsync(mensagem.Id, erro);
                logger.LogWarning(
                    "[N8N Worker] Mensagem {Id} falhou (tentativa {Tentativa}/{Max}): {Erro}",
                    mensagem.Id, mensagem.Tentativas + 1, mensagem.MaxTentativas, erro);
            }
        }
        catch (Exception ex)
        {
            await outboxRepo.RegistrarFalhaAsync(mensagem.Id, ex.Message);
            logger.LogWarning(
                "[N8N Worker] Mensagem {Id} falhou com exceção (tentativa {Tentativa}/{Max}): {Erro}",
                mensagem.Id, mensagem.Tentativas + 1, mensagem.MaxTentativas, ex.Message);
        }
    }
}
