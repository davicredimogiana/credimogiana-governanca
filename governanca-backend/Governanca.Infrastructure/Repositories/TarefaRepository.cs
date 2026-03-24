using Dapper;
using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Governanca.Infrastructure.Data;

namespace Governanca.Infrastructure.Repositories;

public class TarefaRepository(IDbConnectionFactory connectionFactory) : ITarefaRepository
{
  private const string SqlBase = @"
select
    t.id as Id,
    t.reuniao_id as ReuniaoId,
    coalesce(r.titulo, '') as ReuniaoTitulo,
    coalesce(to_char(r.data, 'YYYY-MM-DD'), '') as ReuniaoData,
    t.descricao as Descricao,
    coalesce(to_char(t.prazo, 'YYYY-MM-DD'), '') as Prazo,
    t.status as Status,
    t.observacoes as Observacoes,
    t.concluida_em as ConcluidaEm,
    rm.id as ResponsavelId,
    rm.nome as ResponsavelNome,
    rm.email as ResponsavelEmail,
    rm.cargo as ResponsavelCargo,
    rm.tipo as ResponsavelTipo,
    rm.foto as ResponsavelFoto,
    rm.ativo as ResponsavelAtivo,
    am.id as AtualizadoPorId,
    am.nome as AtualizadoPorNome,
    am.email as AtualizadoPorEmail,
    am.cargo as AtualizadoPorCargo,
    am.tipo as AtualizadoPorTipo,
    am.foto as AtualizadoPorFoto,
    am.ativo as AtualizadoPorAtivo
from public.tarefas_delegadas t
left join public.reunioes r on r.id = t.reuniao_id
inner join public.membros rm on rm.id = t.responsavel_id
left join public.membros am on am.id = t.atualizado_por
";

  public async Task<IEnumerable<TarefaDelegada>> ListarAsync()
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    var rows = await connection.QueryAsync<TarefaRow>(SqlBase + @"
order by
    case when lower(coalesce(t.status, '')) in ('pendente', 'em_andamento') then 0 else 1 end,
    t.prazo asc, t.created_at desc;");
    return rows.Select(Mapear);
  }

  public async Task<TarefaDelegada?> ObterPorIdAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    var row = await connection.QuerySingleOrDefaultAsync<TarefaRow>(SqlBase + "where t.id = @Id;", new { Id = id });
    return row is null ? null : Mapear(row);
  }

  public async Task<TarefaDelegada> CriarAsync(TarefaDelegada tarefa)
  {
    const string sql = @"
insert into public.tarefas_delegadas (id, reuniao_id, responsavel_id, descricao, prazo, status, observacoes, created_at, updated_at)
values (gen_random_uuid(), @ReuniaoId, @ResponsavelId, @Descricao, cast(@Prazo as date), @Status, @Observacoes, now(), now())
returning id;";
    using var connection = await connectionFactory.CreateConnectionAsync();
    var newId = await connection.ExecuteScalarAsync<Guid>(sql, new
    {
      tarefa.ReuniaoId,
      ResponsavelId = tarefa.Responsavel.Id,
      tarefa.Descricao,
      tarefa.Prazo,
      tarefa.Status,
      tarefa.Observacoes
    });
    return (await ObterPorIdAsync(newId))!;
  }

  public async Task<TarefaDelegada?> AtualizarAsync(Guid id, TarefaDelegada tarefa)
  {
    const string sql = @"
update public.tarefas_delegadas
set responsavel_id = @ResponsavelId,
    descricao = @Descricao,
    prazo = cast(@Prazo as date),
    status = @Status,
    observacoes = @Observacoes,
    concluida_em = @ConcluidaEm,
    updated_at = now()
where id = @Id;";
    using var connection = await connectionFactory.CreateConnectionAsync();
    var affected = await connection.ExecuteAsync(sql, new
    {
      Id = id,
      ResponsavelId = tarefa.Responsavel.Id,
      tarefa.Descricao,
      tarefa.Prazo,
      tarefa.Status,
      tarefa.Observacoes,
      tarefa.ConcluidaEm
    });
    return affected == 0 ? null : await ObterPorIdAsync(id);
  }

  public async Task<bool> ExcluirAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    var affected = await connection.ExecuteAsync("delete from public.tarefas_delegadas where id = @Id", new { Id = id });
    return affected > 0;
  }

  private static TarefaDelegada Mapear(TarefaRow row)
  {
    return new TarefaDelegada
    {
      Id = row.Id,
      ReuniaoId = row.ReuniaoId,
      ReuniaoTitulo = row.ReuniaoTitulo,
      ReuniaoData = row.ReuniaoData,
      Descricao = row.Descricao,
      Prazo = row.Prazo,
      Status = row.Status,
      Observacoes = row.Observacoes,
      ConcluidaEm = row.ConcluidaEm,
      Responsavel = new Membro
      {
        Id = row.ResponsavelId,
        Nome = row.ResponsavelNome,
        Email = row.ResponsavelEmail,
        Cargo = row.ResponsavelCargo,
        Tipo = row.ResponsavelTipo,
        Foto = row.ResponsavelFoto,
        Ativo = row.ResponsavelAtivo
      },
      AtualizadoPor = row.AtualizadoPorId.HasValue
            ? new Membro
            {
              Id = row.AtualizadoPorId.Value,
              Nome = row.AtualizadoPorNome ?? string.Empty,
              Email = row.AtualizadoPorEmail ?? string.Empty,
              Cargo = row.AtualizadoPorCargo ?? string.Empty,
              Tipo = row.AtualizadoPorTipo ?? string.Empty,
              Foto = row.AtualizadoPorFoto,
              Ativo = row.AtualizadoPorAtivo ?? false
            }
            : null
    };
  }

  private sealed class TarefaRow
  {
    public Guid Id { get; set; }
    public Guid ReuniaoId { get; set; }
    public string ReuniaoTitulo { get; set; } = string.Empty;
    public string ReuniaoData { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Prazo { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Observacoes { get; set; }
    public DateTime? ConcluidaEm { get; set; }
    public Guid ResponsavelId { get; set; }
    public string ResponsavelNome { get; set; } = string.Empty;
    public string ResponsavelEmail { get; set; } = string.Empty;
    public string ResponsavelCargo { get; set; } = string.Empty;
    public string ResponsavelTipo { get; set; } = string.Empty;
    public string? ResponsavelFoto { get; set; }
    public bool ResponsavelAtivo { get; set; }
    public Guid? AtualizadoPorId { get; set; }
    public string? AtualizadoPorNome { get; set; }
    public string? AtualizadoPorEmail { get; set; }
    public string? AtualizadoPorCargo { get; set; }
    public string? AtualizadoPorTipo { get; set; }
    public string? AtualizadoPorFoto { get; set; }
    public bool? AtualizadoPorAtivo { get; set; }
  }
}
