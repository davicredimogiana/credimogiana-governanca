using Governanca.Domain.Entities;

namespace Governanca.Application.Interfaces;

/// <summary>
/// Contrato para operações de persistência da fila de despacho de webhooks (Outbox Pattern).
/// </summary>
public interface IWebhookOutboxRepository
{
    /// <summary>
    /// Insere uma nova mensagem na fila com status 'pendente'.
    /// </summary>
    Task<WebhookOutbox> EnfileirarAsync(Guid? processamentoId, string payloadJson);

    /// <summary>
    /// Busca e bloqueia (SELECT FOR UPDATE SKIP LOCKED) até <paramref name="limite"/> mensagens
    /// prontas para processar (status 'pendente' ou 'erro' com proxima_tentativa no passado).
    /// Garante que múltiplas instâncias do Worker não processem a mesma mensagem.
    /// </summary>
    Task<IEnumerable<WebhookOutbox>> BuscarPendentesComLockAsync(int limite = 10);

    /// <summary>
    /// Marca a mensagem como 'processando' para sinalizar que está sendo tratada.
    /// </summary>
    Task MarcarComoProcessandoAsync(Guid id);

    /// <summary>
    /// Marca a mensagem como 'concluido' após envio bem-sucedido ao N8N.
    /// </summary>
    Task MarcarComoConcluídoAsync(Guid id);

    /// <summary>
    /// Registra uma falha, incrementa o contador de tentativas e agenda a próxima
    /// tentativa usando exponential backoff. Se tentativas >= max_tentativas, o status
    /// permanece 'erro' e a mensagem não será mais tentada automaticamente.
    /// </summary>
    Task RegistrarFalhaAsync(Guid id, string erroMensagem);
}
