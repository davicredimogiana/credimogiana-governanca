namespace Governanca.Domain.Entities;

public class PautaItem
{
  public Guid Id { get; set; }
  public string Titulo { get; set; } = string.Empty;
  public string Descricao { get; set; } = string.Empty;
  public Guid? ResponsavelId { get; set; }
  public Membro? Responsavel { get; set; }
  public int TempoPrevisto { get; set; }
  public string Status { get; set; } = "pendente";
  public string? Observacoes { get; set; }
  public List<string> Anexos { get; set; } = [];
}
