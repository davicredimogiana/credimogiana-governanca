using Governanca.Domain.Entities;

namespace Governanca.Application.Interfaces;

public interface IAtaRepository
{
  Task<IEnumerable<Ata>> ListarAsync();
  Task<Ata?> ObterPorIdAsync(Guid id);
  Task<bool> ExcluirAsync(Guid id);
}
