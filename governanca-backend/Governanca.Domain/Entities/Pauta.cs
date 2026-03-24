namespace Governanca.Domain.Entities;

public class Pauta
{
  public Guid Id { get; set; }
  public Guid? ReuniaoId { get; set; }
  public Guid? ResponsavelId { get; set; }
  public string Titulo { get; set; } = string.Empty;
  public string? Subtitulo { get; set; }
  public string? Contexto { get; set; }
  public string? Observacoes { get; set; }
  public string Status { get; set; } = "rascunho";
  public int TempoPrevisto { get; set; } = 30;
  public DateTime CreatedAt { get; set; }
  public DateTime UpdatedAt { get; set; }

  // Relacionamentos
  public Membro? Responsavel { get; set; }
  public ReuniaoResumo? Reuniao { get; set; }
  public List<PautaObjetivo> Objetivos { get; set; } = [];
  public List<PautaDado> Dados { get; set; } = [];
  public List<PautaDiscussao> Discussoes { get; set; } = [];
  public List<PautaDeliberacao> Deliberacoes { get; set; } = [];
  public List<PautaEncaminhamento> Encaminhamentos { get; set; } = [];
  public List<PautaItemDetalhe> Itens { get; set; } = [];
}

public class ReuniaoResumo
{
  public Guid Id { get; set; }
  public string Titulo { get; set; } = string.Empty;
}

public class PautaObjetivo
{
  public Guid Id { get; set; }
  public Guid PautaId { get; set; }
  public string Texto { get; set; } = string.Empty;
  public int Ordem { get; set; }
}

public class PautaDado
{
  public Guid Id { get; set; }
  public Guid PautaId { get; set; }
  public string SecaoTitulo { get; set; } = string.Empty;
  public string Label { get; set; } = string.Empty;
  public string Valor { get; set; } = string.Empty;
  public int Ordem { get; set; }
}

public class PautaDiscussao
{
  public Guid Id { get; set; }
  public Guid PautaId { get; set; }
  public string Topico { get; set; } = string.Empty;
  public int Ordem { get; set; }
  public List<PautaDiscussaoPonto> Pontos { get; set; } = [];
}

public class PautaDiscussaoPonto
{
  public Guid Id { get; set; }
  public Guid DiscussaoId { get; set; }
  public string Texto { get; set; } = string.Empty;
  public int Ordem { get; set; }
}

public class PautaDeliberacao
{
  public Guid Id { get; set; }
  public Guid PautaId { get; set; }
  public string Texto { get; set; } = string.Empty;
  public int Ordem { get; set; }
}

public class PautaEncaminhamento
{
  public Guid Id { get; set; }
  public Guid PautaId { get; set; }
  public string Acao { get; set; } = string.Empty;
  public string Responsavel { get; set; } = string.Empty;
  public string Prazo { get; set; } = string.Empty;
  public int Ordem { get; set; }
}

public class PautaItemDetalhe
{
  public Guid Id { get; set; }
  public Guid PautaId { get; set; }
  public Guid? ResponsavelId { get; set; }
  public Membro? Responsavel { get; set; }
  public string Tema { get; set; } = string.Empty;
  public int Ordem { get; set; }
  public string? HoraInicio { get; set; }
  public string? HoraFim { get; set; }
}
