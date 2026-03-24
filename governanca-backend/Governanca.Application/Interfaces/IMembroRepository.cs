using Governanca.Domain.Entities;

namespace Governanca.Application.Interfaces;

public interface IMembroRepository
{
  Task<IEnumerable<Membro>> ListarAsync();
  Task<Membro?> ObterPorIdAsync(Guid id);
  Task<Membro> CriarAsync(Membro membro);
  Task<Membro?> AtualizarAsync(Guid id, Membro membro);
  Task<bool> ExcluirAsync(Guid id);
}
