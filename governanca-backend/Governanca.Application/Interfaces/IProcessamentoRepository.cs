using Governanca.Domain.Entities;

namespace Governanca.Application.Interfaces;

public interface IProcessamentoRepository
{
  Task<IEnumerable<ProcessamentoGravacao>> ListarAsync(Guid? reuniaoId = null);
  Task<ProcessamentoGravacao?> ObterPorIdAsync(Guid id);
  Task<ProcessamentoGravacao> CriarAsync(ProcessamentoGravacao processamento);
  Task<ProcessamentoGravacao?> AtualizarAsync(Guid id, ProcessamentoGravacao processamento);
  Task<bool> ExcluirAsync(Guid id);
}
