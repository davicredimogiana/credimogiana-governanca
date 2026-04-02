using Governanca.Domain.Entities;

namespace Governanca.Application.Commands;

public class CriarAtaCompletaCommand
{
    public Guid? ProcessamentoId { get; set; }
    public string ConteudoMarkdown { get; set; } = string.Empty;
    public string? ResumoExecutivo { get; set; }
    public string? LinkDrive { get; set; }
    public string? LinkAuditoria { get; set; }
    public string? TomGeral { get; set; }
    public string? Urgencia { get; set; }
    public int TotalDecisoes { get; set; }
    public int TotalAcoes { get; set; }
    public int TotalRiscos { get; set; }
    public int TotalOportunidades { get; set; }
    public List<DecisaoIA> Decisoes { get; set; } = [];
    public List<AcaoIA> Acoes { get; set; } = [];
    public List<RiscoIA> Riscos { get; set; } = [];
    public List<OportunidadeIA> Oportunidades { get; set; } = [];
}