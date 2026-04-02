namespace Governanca.API.Contracts;

public class N8NRiscoDto
{
    public string Descricao { get; set; } = string.Empty;
    public string? Severidade { get; set; }
    public int? Mencoes { get; set; }
}