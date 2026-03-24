using Governanca.Domain.Entities;

namespace Governanca.Application.Interfaces;

public interface IEnvioEmailRepository
{
  Task<IEnumerable<EnvioEmail>> ListarAsync();
}
