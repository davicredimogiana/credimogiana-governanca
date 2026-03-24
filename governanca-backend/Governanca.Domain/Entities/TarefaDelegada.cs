namespace Governanca.Domain.Entities;

public class TarefaDelegada
{
  public Guid Id { get; set; }
  public Guid ReuniaoId { get; set; }
  public string ReuniaoTitulo { get; set; } = string.Empty;
  public string ReuniaoData { get; set; } = string.Empty;
  public string Descricao { get; set; } = string.Empty;
  public Membro Responsavel { get; set; } = new();
  public string Prazo { get; set; } = string.Empty;
  public string Status { get; set; } = "pendente";
  public string? Observacoes { get; set; }
  public DateTime? ConcluidaEm { get; set; }
  public Membro? AtualizadoPor { get; set; }
}
