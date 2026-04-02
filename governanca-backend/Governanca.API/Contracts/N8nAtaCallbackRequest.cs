namespace Governanca.API.Contracts;

public class N8NAtaCallbackRequest
{
    public string? ReuniaoId { get; set; }   // no seu payload isso parece ser o id do processamento antigo
    public string? Titulo { get; set; }
    public DateTime? Data { get; set; }
    public string? Resumo { get; set; }
    public string? AtaMarkdown { get; set; }
    public int TotalDecisoes { get; set; }
    public int TotalAcoes { get; set; }
    public int TotalRiscos { get; set; }
    public int TotalOportunidades { get; set; }
    public string? LinkDrive { get; set; }
    public string? LinkAuditoria { get; set; }
    public string? TomGeral { get; set; }
    public string? Urgencia { get; set; }
    public List<N8NDecisaoDto>? Decisoes { get; set; }
    public List<N8NAcaoDto>? Acoes { get; set; }
    public List<N8NRiscoDto>? Riscos { get; set; }
    public List<N8NOportunidadeDto>? Oportunidades { get; set; }
}