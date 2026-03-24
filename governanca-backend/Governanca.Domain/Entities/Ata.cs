namespace Governanca.Domain.Entities;

public class Ata
{
  public Guid Id { get; set; }
  public Guid ReuniaoId { get; set; }
  public string ConteudoMarkdown { get; set; } = string.Empty;
  public AnaliseIA Analise { get; set; } = new();
  public DateTime GeradaEm { get; set; }
  public List<string> EnviadaPara { get; set; } = [];
  public string Status { get; set; } = "rascunho";
}
