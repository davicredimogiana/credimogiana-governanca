namespace Governanca.Domain.Entities;

public class Transcricao
{
  public Guid Id { get; set; }
  public Guid ReuniaoId { get; set; }
  public string TextoCompleto { get; set; } = string.Empty;
  public int DuracaoAudio { get; set; }
  public DateTime ProcessadoEm { get; set; }
  public string Status { get; set; } = "processando";
}
