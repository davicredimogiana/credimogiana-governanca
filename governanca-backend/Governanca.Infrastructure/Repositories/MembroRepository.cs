using Dapper;
using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Governanca.Infrastructure.Data;

namespace Governanca.Infrastructure.Repositories;

public class MembroRepository(IDbConnectionFactory connectionFactory) : IMembroRepository
{
  public async Task<IEnumerable<Membro>> ListarAsync()
  {
    const string sql = @"
select
    id,
    nome,
    email,
    cargo,
    tipo,
    foto,
    ativo
from public.membros
order by nome;
";

    using var connection = await connectionFactory.CreateConnectionAsync();
    return await connection.QueryAsync<Membro>(sql);
  }

  public async Task<Membro?> ObterPorIdAsync(Guid id)
  {
    const string sql = @"
select
    id,
    nome,
    email,
    cargo,
    tipo,
    foto,
    ativo
from public.membros
where id = @Id;
";

    using var connection = await connectionFactory.CreateConnectionAsync();
    return await connection.QuerySingleOrDefaultAsync<Membro>(sql, new { Id = id });
  }

  public async Task<Membro> CriarAsync(Membro membro)
  {
    const string sql = @"
insert into public.membros
(
    id,
    nome,
    email,
    cargo,
    tipo,
    foto,
    ativo,
    created_at,
    updated_at
)
values
(
    @Id,
    @Nome,
    @Email,
    @Cargo,
    @Tipo,
    @Foto,
    @Ativo,
    now(),
    now()
);

select
    id,
    nome,
    email,
    cargo,
    tipo,
    foto,
    ativo
from public.membros
where id = @Id;
";

    var entity = new Membro
    {
      Id = membro.Id != Guid.Empty ? membro.Id : Guid.NewGuid(),
      Nome = membro.Nome?.Trim() ?? string.Empty,
      Email = membro.Email?.Trim() ?? string.Empty,
      Cargo = membro.Cargo?.Trim() ?? string.Empty,
      Tipo = membro.Tipo?.Trim() ?? string.Empty,
      Foto = string.IsNullOrWhiteSpace(membro.Foto) ? null : membro.Foto.Trim(),
      Ativo = membro.Ativo
    };

    using var connection = await connectionFactory.CreateConnectionAsync();
    return await connection.QuerySingleAsync<Membro>(sql, entity);
  }

  public async Task<Membro?> AtualizarAsync(Guid id, Membro membro)
  {
    const string sql = @"
update public.membros
set
    nome = @Nome,
    email = @Email,
    cargo = @Cargo,
    tipo = @Tipo,
    foto = @Foto,
    ativo = @Ativo,
    updated_at = now()
where id = @Id;

select
    id,
    nome,
    email,
    cargo,
    tipo,
    foto,
    ativo
from public.membros
where id = @Id;
";

    var entity = new
    {
      Id = id,
      Nome = membro.Nome?.Trim() ?? string.Empty,
      Email = membro.Email?.Trim() ?? string.Empty,
      Cargo = membro.Cargo?.Trim() ?? string.Empty,
      Tipo = membro.Tipo?.Trim() ?? string.Empty,
      Foto = string.IsNullOrWhiteSpace(membro.Foto) ? null : membro.Foto.Trim(),
      membro.Ativo
    };

    using var connection = await connectionFactory.CreateConnectionAsync();
    return await connection.QuerySingleOrDefaultAsync<Membro>(sql, entity);
  }

  public async Task<bool> ExcluirAsync(Guid id)
  {
    const string sql = @"
delete from public.membros
where id = @Id;
";

    using var connection = await connectionFactory.CreateConnectionAsync();
    var rows = await connection.ExecuteAsync(sql, new { Id = id });
    return rows > 0;
  }
}