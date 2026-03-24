using System.Text.Json;
using Dapper;
using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Governanca.Infrastructure.Data;

namespace Governanca.Infrastructure.Repositories;

public class ConfiguracaoRepository : IConfiguracaoRepository
{
  private readonly IDbConnectionFactory _connectionFactory;

  public ConfiguracaoRepository(IDbConnectionFactory connectionFactory)
  {
    _connectionFactory = connectionFactory;
  }

  public async Task<ConfiguracoesSistema> ObterAsync()
  {
    const string sql = @"
select valor
from public.configuracoes
where chave = 'envio_automatico_atas'
limit 1;
";

    using var connection = await _connectionFactory.CreateConnectionAsync();
    var json = await connection.QuerySingleOrDefaultAsync<string?>(sql);

    if (string.IsNullOrWhiteSpace(json))
    {
      return new ConfiguracoesSistema
      {
        EnviarEmailAutomatico = false
      };
    }

    try
    {
      var payload = JsonSerializer.Deserialize<ConfiguracaoAtivoPayload>(json);

      return new ConfiguracoesSistema
      {
        EnviarEmailAutomatico = payload?.Ativo ?? false
      };
    }
    catch
    {
      return new ConfiguracoesSistema
      {
        EnviarEmailAutomatico = false
      };
    }
  }

  public async Task<ConfiguracoesSistema> AtualizarAsync(ConfiguracoesSistema configuracoes)
  {
    const string sql = @"
insert into public.configuracoes (id, chave, valor, created_at, updated_at)
values (
    gen_random_uuid(),
    'envio_automatico_atas',
    cast(@Valor as jsonb),
    now(),
    now()
)
on conflict (chave)
do update set
    valor = cast(@Valor as jsonb),
    updated_at = now();
";

    var payload = new ConfiguracaoAtivoPayload
    {
      Ativo = configuracoes.EnviarEmailAutomatico
    };

    var valorJson = JsonSerializer.Serialize(payload);

    using var connection = await _connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync(sql, new { Valor = valorJson });

    return await ObterAsync();
  }

  private sealed class ConfiguracaoAtivoPayload
  {
    public bool Ativo { get; set; }
  }
}