using Governanca.Application.Commands;

namespace Governanca.Application.Interfaces;

public interface IAtaWriteRepository
{
    Task<Guid> CriarAtaCompletaAsync(CriarAtaCompletaCommand command);
}