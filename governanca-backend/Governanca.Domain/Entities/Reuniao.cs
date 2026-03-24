namespace Governanca.Domain.Entities;

public class Reuniao
{
  public Guid Id { get; set; }
  public string Titulo { get; set; } = string.Empty;
  public string? Descricao { get; set; }
  public string Data { get; set; } = string.Empty;
  public string Horario { get; set; } = string.Empty;
  public int Duracao { get; set; }
  public string? Local { get; set; }
  public string? Plataforma { get; set; }
  public string Status { get; set; } = "agendada";
  public string Tipo { get; set; } = "geral";
  public List<Membro> Participantes { get; set; } = [];
  public List<PautaItem> Pautas { get; set; } = [];
  public Transcricao? Transcricao { get; set; }
  public Ata? Ata { get; set; }
  public Membro CriadoPor { get; set; } = new();
  public DateTime CriadoEm { get; set; }
}
