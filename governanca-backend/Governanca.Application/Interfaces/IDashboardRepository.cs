using Governanca.Domain.Entities;

namespace Governanca.Application.Interfaces;

public interface IDashboardRepository
{
  Task<EstatisticasDashboard> ObterResumoAsync();
}
