using Dapper;
using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Governanca.Infrastructure.Data;

namespace Governanca.Infrastructure.Repositories;

public class DestinatarioRepository(IDbConnectionFactory connectionFactory) : IDestinatarioRepository
{
  private const string SqlBase = @"
select
    id as Id,
    nome as Nome,
    email as Email,
    cargo as Cargo,
    coalesce(grupo, 'geral') as Grupo,
    membro_id as MembroId,
    ativo as Ativo,
    coalesce(origem, 'manual') as Origem,
    created_at as CreatedAt,
    updated_at as UpdatedAt
from public.destinatarios
";

  public async Task<IEnumerable<DestinatarioEmail>> ListarAsync()
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    return await connection.QueryAsync<DestinatarioEmail>(SqlBase + "order by nome;");
  }

  public async Task<DestinatarioEmail?> ObterPorIdAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    return await connection.QuerySingleOrDefaultAsync<DestinatarioEmail>(SqlBase + "where id = @Id;", new { Id = id });
  }

  public async Task<DestinatarioEmail> CriarAsync(DestinatarioEmail destinatario)
  {
    const string sql = @"
insert into public.destinatarios (id, nome, email, cargo, grupo, membro_id, ativo, origem, created_at, updated_at)
values (gen_random_uuid(), @Nome, @Email, @Cargo, @Grupo, @MembroId, @Ativo, @Origem, now(), now())
returning id;
";
    using var connection = await connectionFactory.CreateConnectionAsync();
    var newId = await connection.ExecuteScalarAsync<Guid>(sql, new
    {
      destinatario.Nome,
      destinatario.Email,
      destinatario.Cargo,
      destinatario.Grupo,
      destinatario.MembroId,
      destinatario.Ativo,
      destinatario.Origem
    });
    return (await ObterPorIdAsync(newId))!;
  }

  public async Task<DestinatarioEmail?> AtualizarAsync(Guid id, DestinatarioEmail destinatario)
  {
    const string sql = @"
update public.destinatarios
set nome = @Nome,
    email = @Email,
    cargo = @Cargo,
    grupo = @Grupo,
    ativo = @Ativo,
    updated_at = now()
where id = @Id;
";
    using var connection = await connectionFactory.CreateConnectionAsync();
    var affected = await connection.ExecuteAsync(sql, new
    {
      Id = id,
      destinatario.Nome,
      destinatario.Email,
      destinatario.Cargo,
      destinatario.Grupo,
      destinatario.Ativo
    });
    return affected == 0 ? null : await ObterPorIdAsync(id);
  }

  public async Task<bool> ExcluirAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    var affected = await connection.ExecuteAsync("delete from public.destinatarios where id = @Id", new { Id = id });
    return affected > 0;
  }

  public async Task<int> ImportarLoteAsync(IEnumerable<DestinatarioEmail> destinatarios)
  {
    const string sql = @"
insert into public.destinatarios (id, nome, email, cargo, grupo, membro_id, ativo, origem, created_at, updated_at)
values (gen_random_uuid(), @Nome, @Email, @Cargo, @Grupo, @MembroId, @Ativo, @Origem, now(), now())
on conflict (email) do nothing;
";
    using var connection = await connectionFactory.CreateConnectionAsync();
    var count = 0;
    foreach (var dest in destinatarios)
    {
      count += await connection.ExecuteAsync(sql, new
      {
        dest.Nome,
        dest.Email,
        dest.Cargo,
        dest.Grupo,
        dest.MembroId,
        Ativo = true,
        dest.Origem
      });
    }
    return count;
  }
}
