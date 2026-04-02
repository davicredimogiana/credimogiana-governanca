namespace Governanca.Application.Commands;

public class ProcessarAtaN8NDecisaoCommand
{
    public string Descricao { get; set; } = string.Empty;
    public string? Responsavel { get; set; }
    public string? Prazo { get; set; }
}