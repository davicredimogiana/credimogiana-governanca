namespace Governanca.Domain.Entities;

/// <summary>
/// Representa uma mensagem na fila de despacho para o webhook do N8N.
/// Implementa o padrão Transactional Outbox para garantir entrega confiável.
/// </summary>
public class WebhookOutbox
{
    public Guid Id { get; set; }

    /// <summary>Referência ao processamento de gravação que originou este despacho.</summary>
    public Guid? ProcessamentoId { get; set; }

    /// <summary>Payload JSON serializado que será enviado ao webhook do N8N.</summary>
    public string Payload { get; set; } = string.Empty;

    /// <summary>
    /// Status atual da mensagem.
    /// Valores possíveis: 'pendente', 'processando', 'concluido', 'erro'.
    /// </summary>
    public string Status { get; set; } = "pendente";

    /// <summary>Número de tentativas de envio já realizadas.</summary>
    public int Tentativas { get; set; }

    /// <summary>Número máximo de tentativas permitidas antes de abandonar.</summary>
    public int MaxTentativas { get; set; } = 5;

    /// <summary>Data/hora a partir da qual esta mensagem pode ser tentada novamente.</summary>
    public DateTime ProximaTentativa { get; set; } = DateTime.UtcNow;

    /// <summary>Mensagem do último erro ocorrido (N8N ou rede).</summary>
    public string? ErroMensagem { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
