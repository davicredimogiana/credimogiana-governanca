namespace Governanca.API.Contracts;

public class N8NDecisaoDto
{
    public string Descricao { get; set; } = string.Empty;
    public string? Responsavel { get; set; }
    public string? Prazo { get; set; }
}