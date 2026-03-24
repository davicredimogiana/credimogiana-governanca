namespace Governanca.Domain.Entities;

public class EstatisticasDashboard
{
  public int ReunioesTotais { get; set; }
  public int ReunioesEsteMes { get; set; }
  public int PautasPendentes { get; set; }
  public int AcoesPendentes { get; set; }
  public int AcoesAtrasadas { get; set; }
  public decimal ParticipacaoMedia { get; set; }
  public Reuniao? ProximaReuniao { get; set; }
}
