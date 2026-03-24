using Governanca.Domain.Entities;

namespace Governanca.Application.Interfaces;

public interface IReuniaoRepository
{
  Task<IEnumerable<Reuniao>> ListarAsync();
  Task<Reuniao?> ObterPorIdAsync(Guid id);
  Task<Reuniao> CriarAsync(Reuniao reuniao);
  Task<Reuniao?> AtualizarAsync(Guid id, Reuniao reuniao);
  Task<bool> ExcluirAsync(Guid id);
}
