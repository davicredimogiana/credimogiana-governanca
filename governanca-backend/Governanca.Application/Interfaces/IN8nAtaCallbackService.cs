using Governanca.Application.Commands;

namespace Governanca.Application.Interfaces;

public interface IN8NAtaCallbackService
{
    Task<object> ProcessarAsync(ProcessarAtaN8NCommand request);
}