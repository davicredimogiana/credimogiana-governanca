using Governanca.Domain.Entities;

namespace Governanca.Application.Interfaces;

public interface IPautaRepository
{
  Task<IEnumerable<Pauta>> ListarAsync();
  Task<Pauta?> ObterPorIdAsync(Guid id);
  Task<Pauta> CriarAsync(Pauta pauta);
  Task<Pauta?> AtualizarAsync(Guid id, Pauta pauta);
  Task<bool> ExcluirAsync(Guid id);
  Task<bool> AtualizarStatusAsync(Guid id, string status);

  // Sub-recursos
  Task<PautaObjetivo> AdicionarObjetivoAsync(Guid pautaId, string texto, int ordem);
  Task AtualizarObjetivoAsync(Guid id, string texto);
  Task ExcluirObjetivoAsync(Guid id);

  Task<PautaDado> AdicionarDadoAsync(Guid pautaId, PautaDado dado);
  Task AtualizarDadoAsync(Guid id, PautaDado dado);
  Task ExcluirDadoAsync(Guid id);

  Task<PautaDiscussao> AdicionarDiscussaoAsync(Guid pautaId, string topico, int ordem);
  Task AtualizarDiscussaoAsync(Guid id, string topico);
  Task ExcluirDiscussaoAsync(Guid id);

  Task<PautaDiscussaoPonto> AdicionarPontoDiscussaoAsync(Guid discussaoId, string texto, int ordem);
  Task AtualizarPontoDiscussaoAsync(Guid id, string texto);
  Task ExcluirPontoDiscussaoAsync(Guid id);

  Task<PautaDeliberacao> AdicionarDeliberacaoAsync(Guid pautaId, string texto, int ordem);
  Task AtualizarDeliberacaoAsync(Guid id, string texto);
  Task ExcluirDeliberacaoAsync(Guid id);

  Task<PautaEncaminhamento> AdicionarEncaminhamentoAsync(Guid pautaId, PautaEncaminhamento encaminhamento);
  Task AtualizarEncaminhamentoAsync(Guid id, PautaEncaminhamento encaminhamento);
  Task ExcluirEncaminhamentoAsync(Guid id);

  // Itens
  Task<PautaItemDetalhe> AdicionarItemAsync(Guid pautaId, PautaItemDetalhe item);
  Task AtualizarItemAsync(Guid id, PautaItemDetalhe item);
  Task ExcluirItemAsync(Guid id);
}
