namespace Governanca.Application.Commands;

public class ProcessarAtaN8NCommand
{
    public Guid? ProcessamentoId { get; set; }
    public string? Resumo { get; set; }
    public string? AtaMarkdown { get; set; }
    public string? LinkDrive { get; set; }
    public string? LinkAuditoria { get; set; }
    public string? TomGeral { get; set; }
    public string? Urgencia { get; set; }
    public int TotalDecisoes { get; set; }
    public int TotalAcoes { get; set; }
    public int TotalRiscos { get; set; }
    public int TotalOportunidades { get; set; }
    public List<ProcessarAtaN8NDecisaoCommand>? Decisoes { get; set; }
    public List<ProcessarAtaN8NAcaoCommand>? Acoes { get; set; }
    public List<ProcessarAtaN8NRiscoCommand>? Riscos { get; set; }
    public List<ProcessarAtaN8NOportunidadeCommand>? Oportunidades { get; set; }
}