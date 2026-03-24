using Dapper;
using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Governanca.Infrastructure.Data;

namespace Governanca.Infrastructure.Repositories;

public class ReuniaoRepository(IDbConnectionFactory connectionFactory) : IReuniaoRepository
{
  public async Task<IEnumerable<Reuniao>> ListarAsync()
  {
    using var connection = await connectionFactory.CreateConnectionAsync();

    var reunioes = (await connection.QueryAsync<ReuniaoRow>(SqlBaseLista)).ToList();
    if (reunioes.Count == 0)
      return [];

    var reuniaoIds = reunioes.Select(x => x.Id).ToArray();

    var pautas = (await connection.QueryAsync<PautaRow>(SqlPautasPorReuniao, new { ReuniaoIds = reuniaoIds }))
        .GroupBy(x => x.ReuniaoId)
        .ToDictionary(g => g.Key, g => g.Select(MapearPauta).ToList());

    var atas = (await connection.QueryAsync<AtaRow>(SqlAtasPorReuniao, new { ReuniaoIds = reuniaoIds }))
        .ToDictionary(x => x.ReuniaoId, MapearAta);

    return [.. reunioes.Select(r => MapearReuniao(r, pautas, atas))];
  }

  public async Task<Reuniao?> ObterPorIdAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();

    var reuniao = await connection.QuerySingleOrDefaultAsync<ReuniaoRow>(SqlBasePorId, new { Id = id });
    if (reuniao is null)
      return null;

    var pautas = (await connection.QueryAsync<PautaRow>(SqlPautasPorReuniao, new { ReuniaoIds = new[] { id } }))
        .GroupBy(x => x.ReuniaoId)
        .ToDictionary(g => g.Key, g => g.Select(MapearPauta).ToList());

    var atasRows = await connection.QueryAsync<AtaRow>(SqlAtasPorReuniao, new { ReuniaoIds = new[] { id } });
    var atas = atasRows.ToDictionary(x => x.ReuniaoId, MapearAta);

    return MapearReuniao(reuniao, pautas, atas);
  }

  public async Task<Reuniao> CriarAsync(Reuniao reuniao)
  {
    const string sql = @"
insert into public.reunioes
(
    id,
    titulo,
    descricao,
    data,
    horario,
    duracao,
    local,
    plataforma,
    status,
    tipo,
    criado_por,
    created_at,
    updated_at
)
values
(
    @Id,
    @Titulo,
    @Descricao,
    cast(@Data as date),
    cast(@Horario as time),
    @Duracao,
    @Local,
    @Plataforma,
    @Status,
    @Tipo,
    @CriadoPor,
    now(),
    now()
);
";

    var entity = new
    {
      Id = reuniao.Id != Guid.Empty ? reuniao.Id : Guid.NewGuid(),
      Titulo = reuniao.Titulo?.Trim() ?? string.Empty,
      Descricao = string.IsNullOrWhiteSpace(reuniao.Descricao) ? null : reuniao.Descricao.Trim(),
      reuniao.Data,
      reuniao.Horario,
      Duracao = reuniao.Duracao <= 0 ? 60 : reuniao.Duracao,
      Local = string.IsNullOrWhiteSpace(reuniao.Local) ? null : reuniao.Local.Trim(),
      Plataforma = string.IsNullOrWhiteSpace(reuniao.Plataforma) ? null : reuniao.Plataforma.Trim(),
      Status = string.IsNullOrWhiteSpace(reuniao.Status) ? "agendada" : reuniao.Status.Trim(),
      Tipo = string.IsNullOrWhiteSpace(reuniao.Tipo) ? "geral" : reuniao.Tipo.Trim(),
      CriadoPor = reuniao.CriadoPor?.Id == Guid.Empty ? (Guid?)null : reuniao.CriadoPor.Id
    };

    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync(sql, entity);

    return await ObterPorIdAsync(entity.Id)
        ?? throw new InvalidOperationException("Falha ao recarregar reunião criada.");
  }

  public async Task<Reuniao?> AtualizarAsync(Guid id, Reuniao reuniao)
  {
    const string sql = @"
update public.reunioes
set
    titulo = @Titulo,
    descricao = @Descricao,
    data = cast(@Data as date),
    horario = cast(@Horario as time),
    duracao = @Duracao,
    local = @Local,
    plataforma = @Plataforma,
    status = @Status,
    tipo = @Tipo,
    criado_por = @CriadoPor,
    updated_at = now()
where id = @Id;
";

    var entity = new
    {
      Id = id,
      Titulo = reuniao.Titulo?.Trim() ?? string.Empty,
      Descricao = string.IsNullOrWhiteSpace(reuniao.Descricao) ? null : reuniao.Descricao.Trim(),
      reuniao.Data,
      reuniao.Horario,
      Duracao = reuniao.Duracao <= 0 ? 60 : reuniao.Duracao,
      Local = string.IsNullOrWhiteSpace(reuniao.Local) ? null : reuniao.Local.Trim(),
      Plataforma = string.IsNullOrWhiteSpace(reuniao.Plataforma) ? null : reuniao.Plataforma.Trim(),
      Status = string.IsNullOrWhiteSpace(reuniao.Status) ? "agendada" : reuniao.Status.Trim(),
      Tipo = string.IsNullOrWhiteSpace(reuniao.Tipo) ? "geral" : reuniao.Tipo.Trim(),
      CriadoPor = reuniao.CriadoPor?.Id == Guid.Empty ? (Guid?)null : reuniao.CriadoPor.Id
    };

    using var connection = await connectionFactory.CreateConnectionAsync();
    var rows = await connection.ExecuteAsync(sql, entity);

    if (rows == 0)
      return null;

    return await ObterPorIdAsync(id);
  }

  public async Task<bool> ExcluirAsync(Guid id)
  {
    const string sql = @"
delete from public.reunioes
where id = @Id;
";

    using var connection = await connectionFactory.CreateConnectionAsync();
    var rows = await connection.ExecuteAsync(sql, new { Id = id });
    return rows > 0;
  }

  private static Reuniao MapearReuniao(
      ReuniaoRow row,
      IReadOnlyDictionary<Guid, List<PautaItem>> pautas,
      IReadOnlyDictionary<Guid, Ata> atas)
  {
    return new Reuniao
    {
      Id = row.Id,
      Titulo = row.Titulo,
      Descricao = row.Descricao,
      Data = row.Data,
      Horario = row.Horario,
      Duracao = row.Duracao,
      Local = row.Local,
      Plataforma = row.Plataforma,
      Status = row.Status,
      Tipo = row.Tipo,
      Participantes = [],
      Pautas = pautas.TryGetValue(row.Id, out var listaPautas) ? listaPautas : [],
      Transcricao = null,
      Ata = atas.TryGetValue(row.Id, out var ata) ? ata : null,
      CriadoEm = row.CriadoEm,
      CriadoPor = new Membro
      {
        Id = row.CriadoPorId ?? Guid.Empty,
        Nome = row.CriadoPorNome ?? string.Empty,
        Email = row.CriadoPorEmail ?? string.Empty,
        Cargo = row.CriadoPorCargo ?? string.Empty,
        Tipo = row.CriadoPorTipo ?? string.Empty,
        Foto = row.CriadoPorFoto,
        Ativo = row.CriadoPorAtivo ?? false
      }
    };
  }

  private static PautaItem MapearPauta(PautaRow row)
  {
    var descricao = row.Contexto;
    if (!string.IsNullOrWhiteSpace(row.Subtitulo))
    {
      descricao = string.IsNullOrWhiteSpace(descricao)
          ? row.Subtitulo
          : $"{row.Subtitulo}\n{descricao}";
    }

    return new PautaItem
    {
      Id = row.Id,
      Titulo = row.Titulo,
      Descricao = descricao ?? string.Empty,
      TempoPrevisto = row.TempoPrevisto,
      Status = row.Status,
      Observacoes = row.Observacoes,
      Anexos = [],
      Responsavel = row.ResponsavelId.HasValue
            ? new Membro
            {
              Id = row.ResponsavelId.Value,
              Nome = row.ResponsavelNome ?? string.Empty,
              Email = row.ResponsavelEmail ?? string.Empty,
              Cargo = row.ResponsavelCargo ?? string.Empty,
              Tipo = row.ResponsavelTipo ?? string.Empty,
              Foto = row.ResponsavelFoto,
              Ativo = row.ResponsavelAtivo ?? false
            }
            : null
    };
  }

  private static Ata MapearAta(AtaRow row)
  {
    return new Ata
    {
      Id = row.Id,
      ReuniaoId = row.ReuniaoId,
      ConteudoMarkdown = row.ConteudoMarkdown,
      Analise = new AnaliseIA(),
      GeradaEm = row.RecebidaEm ?? row.CreatedAt,
      EnviadaPara = [],
      Status = row.Status ?? string.Empty
    };
  }

  private const string SqlBaseLista = @"
select
    r.id as Id,
    r.titulo as Titulo,
    r.descricao as Descricao,
    to_char(r.data, 'YYYY-MM-DD') as Data,
    to_char(r.horario, 'HH24:MI') as Horario,
    r.duracao as Duracao,
    r.local as Local,
    r.plataforma as Plataforma,
    r.status as Status,
    r.tipo as Tipo,
    r.created_at as CriadoEm,

    m.id as CriadoPorId,
    m.nome as CriadoPorNome,
    m.email as CriadoPorEmail,
    m.cargo as CriadoPorCargo,
    m.tipo as CriadoPorTipo,
    m.foto as CriadoPorFoto,
    m.ativo as CriadoPorAtivo

from public.reunioes r
left join public.membros m on m.id = r.criado_por
order by r.data desc, r.horario desc, r.created_at desc;
";

  private const string SqlBasePorId = @"
select
    r.id as Id,
    r.titulo as Titulo,
    r.descricao as Descricao,
    to_char(r.data, 'YYYY-MM-DD') as Data,
    to_char(r.horario, 'HH24:MI') as Horario,
    r.duracao as Duracao,
    r.local as Local,
    r.plataforma as Plataforma,
    r.status as Status,
    r.tipo as Tipo,
    r.created_at as CriadoEm,

    m.id as CriadoPorId,
    m.nome as CriadoPorNome,
    m.email as CriadoPorEmail,
    m.cargo as CriadoPorCargo,
    m.tipo as CriadoPorTipo,
    m.foto as CriadoPorFoto,
    m.ativo as CriadoPorAtivo

from public.reunioes r
left join public.membros m on m.id = r.criado_por
where r.id = @Id;
";

  private const string SqlPautasPorReuniao = @"
select
    p.id as Id,
    p.reuniao_id as ReuniaoId,
    p.titulo as Titulo,
    p.subtitulo as Subtitulo,
    p.contexto as Contexto,
    p.observacoes as Observacoes,
    p.status as Status,
    coalesce(p.tempo_previsto, 0) as TempoPrevisto,

    m.id as ResponsavelId,
    m.nome as ResponsavelNome,
    m.email as ResponsavelEmail,
    m.cargo as ResponsavelCargo,
    m.tipo as ResponsavelTipo,
    m.foto as ResponsavelFoto,
    m.ativo as ResponsavelAtivo

from public.pautas p
left join public.membros m on m.id = p.responsavel_id
where p.reuniao_id = any(@ReuniaoIds)
order by p.created_at asc;
";

  private const string SqlAtasPorReuniao = @"
select
    a.id as Id,
    a.reuniao_id as ReuniaoId,
    a.conteudo_markdown as ConteudoMarkdown,
    a.status as Status,
    a.recebida_em as RecebidaEm,
    a.created_at as CreatedAt
from public.atas a
where a.reuniao_id = any(@ReuniaoIds);
";

  private sealed class ReuniaoRow
  {
    public Guid Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Data { get; set; } = string.Empty;
    public string Horario { get; set; } = string.Empty;
    public int Duracao { get; set; }
    public string? Local { get; set; }
    public string? Plataforma { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; }

    public Guid? CriadoPorId { get; set; }
    public string? CriadoPorNome { get; set; }
    public string? CriadoPorEmail { get; set; }
    public string? CriadoPorCargo { get; set; }
    public string? CriadoPorTipo { get; set; }
    public string? CriadoPorFoto { get; set; }
    public bool? CriadoPorAtivo { get; set; }
  }

  private sealed class PautaRow
  {
    public Guid Id { get; set; }
    public Guid ReuniaoId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Subtitulo { get; set; }
    public string? Contexto { get; set; }
    public string? Observacoes { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TempoPrevisto { get; set; }

    public Guid? ResponsavelId { get; set; }
    public string? ResponsavelNome { get; set; }
    public string? ResponsavelEmail { get; set; }
    public string? ResponsavelCargo { get; set; }
    public string? ResponsavelTipo { get; set; }
    public string? ResponsavelFoto { get; set; }
    public bool? ResponsavelAtivo { get; set; }
  }

  private sealed class AtaRow
  {
    public Guid Id { get; set; }
    public Guid ReuniaoId { get; set; }
    public string ConteudoMarkdown { get; set; } = string.Empty;
    public string? Status { get; set; }
    public DateTime? RecebidaEm { get; set; }
    public DateTime CreatedAt { get; set; }
  }
}