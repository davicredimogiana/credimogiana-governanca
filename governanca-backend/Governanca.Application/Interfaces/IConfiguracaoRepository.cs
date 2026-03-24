using Governanca.Domain.Entities;

namespace Governanca.Application.Interfaces;

public interface IConfiguracaoRepository
{
  Task<ConfiguracoesSistema> ObterAsync();
  Task<ConfiguracoesSistema> AtualizarAsync(ConfiguracoesSistema configuracoes);
}
