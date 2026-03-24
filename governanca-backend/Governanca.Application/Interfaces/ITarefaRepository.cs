using Governanca.Domain.Entities;

namespace Governanca.Application.Interfaces;

public interface ITarefaRepository
{
  Task<IEnumerable<TarefaDelegada>> ListarAsync();
  Task<TarefaDelegada?> ObterPorIdAsync(Guid id);
  Task<TarefaDelegada> CriarAsync(TarefaDelegada tarefa);
  Task<TarefaDelegada?> AtualizarAsync(Guid id, TarefaDelegada tarefa);
  Task<bool> ExcluirAsync(Guid id);
}
