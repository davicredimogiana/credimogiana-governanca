namespace Governanca.Domain.Entities;

public class ProcessamentoGravacao
{
  public Guid Id { get; set; }
  public Guid? ReuniaoId { get; set; }
  public Guid? PautaId { get; set; }
  public string NomeArquivo { get; set; } = string.Empty;
  public string Status { get; set; } = "enviando";
  public string? EtapaAtual { get; set; }
  public int Progresso { get; set; }
  public string? LinkDrive { get; set; }
  public string? LinkArquivoProcessado { get; set; }
  public string? ErroMensagem { get; set; }
  public List<string> Participantes { get; set; } = [];
  public List<Guid> TarefasMarcadas { get; set; } = [];
  public List<AssinaturaProcessamento> Assinaturas { get; set; } = [];
  public DateTime CreatedAt { get; set; }
  public DateTime UpdatedAt { get; set; }
}

public class AssinaturaProcessamento
{
  public string Nome { get; set; } = string.Empty;
  public string Imagem { get; set; } = string.Empty;
  public string Hora { get; set; } = string.Empty;
}
