namespace Governanca.Domain.Entities;

public class DestinatarioEmail
{
  public Guid Id { get; set; }
  public string Nome { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string? Cargo { get; set; }
  public string Grupo { get; set; } = "geral";
  public Guid? MembroId { get; set; }
  public bool Ativo { get; set; } = true;
  public string Origem { get; set; } = "manual";
  public DateTime CreatedAt { get; set; }
  public DateTime UpdatedAt { get; set; }
}
