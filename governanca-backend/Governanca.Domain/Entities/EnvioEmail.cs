namespace Governanca.Domain.Entities;

public class EnvioEmail
{
  public Guid Id { get; set; }
  public Guid? AtaId { get; set; }
  public string DestinatarioNome { get; set; } = string.Empty;
  public string DestinatarioEmail { get; set; } = string.Empty;
  public string? DestinatarioCargo { get; set; }
  public DateTime? EnviadoEm { get; set; }
  public bool Lido { get; set; }
  public DateTime? LidoEm { get; set; }
  public DateTime CreatedAt { get; set; }

  // Relacionamentos opcionais para enriquecimento
  public string? AtaResumoExecutivo { get; set; }
  public string? ReuniaoTitulo { get; set; }
  public string? ReuniaoData { get; set; }
}
