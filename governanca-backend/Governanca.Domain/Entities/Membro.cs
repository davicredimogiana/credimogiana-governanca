namespace Governanca.Domain.Entities;

public class Membro
{
  public Guid Id { get; set; }
  public string Nome { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string Cargo { get; set; } = string.Empty;
  public string Tipo { get; set; } = "cooperado";
  public string? Foto { get; set; }
  public bool Ativo { get; set; }
}
