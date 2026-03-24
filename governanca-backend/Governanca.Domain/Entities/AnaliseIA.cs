namespace Governanca.Domain.Entities;

public class AnaliseIA
{
  public string Resumo { get; set; } = string.Empty;
  public List<DecisaoIA> Decisoes { get; set; } = [];
  public List<AcaoIA> Acoes { get; set; } = [];
  public List<RiscoIA> Riscos { get; set; } = [];
  public List<OportunidadeIA> Oportunidades { get; set; } = [];
  public string SentimentoGeral { get; set; } = "neutro";
}

public class DecisaoIA
{
  public Guid Id { get; set; }
  public string Descricao { get; set; } = string.Empty;
  public string? Responsavel { get; set; }
  public string? Prazo { get; set; }
  public string Status { get; set; } = string.Empty;
}

public class AcaoIA
{
  public Guid Id { get; set; }
  public string Descricao { get; set; } = string.Empty;
  public string? Responsavel { get; set; }
  public string? Prazo { get; set; }
  public string Status { get; set; } = string.Empty;
}

public class RiscoIA
{
  public Guid Id { get; set; }
  public string Descricao { get; set; } = string.Empty;
  public string? Severidade { get; set; }
  public int Mencoes { get; set; }
}

public class OportunidadeIA
{
  public Guid Id { get; set; }
  public string Descricao { get; set; } = string.Empty;
  public string? Potencial { get; set; }
  public int Mencoes { get; set; }
}