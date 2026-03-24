using Governanca.Domain.Entities;

namespace Governanca.Application.Interfaces;

public interface IDestinatarioRepository
{
  Task<IEnumerable<DestinatarioEmail>> ListarAsync();
  Task<DestinatarioEmail?> ObterPorIdAsync(Guid id);
  Task<DestinatarioEmail> CriarAsync(DestinatarioEmail destinatario);
  Task<DestinatarioEmail?> AtualizarAsync(Guid id, DestinatarioEmail destinatario);
  Task<bool> ExcluirAsync(Guid id);
  Task<int> ImportarLoteAsync(IEnumerable<DestinatarioEmail> destinatarios);
}
