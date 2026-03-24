using Dapper;
using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Governanca.Infrastructure.Data;

namespace Governanca.Infrastructure.Repositories;

public class PautaRepository(IDbConnectionFactory connectionFactory) : IPautaRepository
{
  public async Task<IEnumerable<Pauta>> ListarAsync()
  {
    const string sql = @"
select
    p.id as Id,
    p.reuniao_id as ReuniaoId,
    p.responsavel_id as ResponsavelId,
    p.titulo as Titulo,
    p.subtitulo as Subtitulo,
    p.contexto as Contexto,
    p.observacoes as Observacoes,
    p.status as Status,
    coalesce(p.tempo_previsto, 30) as TempoPrevisto,
    p.created_at as CreatedAt,
    p.updated_at as UpdatedAt,
    m.id as MembroId,
    m.nome as MembroNome,
    m.email as MembroEmail,
    m.cargo as MembroCargo,
    m.tipo as MembroTipo,
    m.foto as MembroFoto,
    m.ativo as MembroAtivo,
    r.id as ReuniaoResId,
    r.titulo as ReuniaoResTitulo
from public.pautas p
left join public.membros m on m.id = p.responsavel_id
left join public.reunioes r on r.id = p.reuniao_id
order by p.created_at desc;
";
    using var connection = await connectionFactory.CreateConnectionAsync();
    var rows = await connection.QueryAsync<PautaRow>(sql);
    return rows.Select(MapearSimples);
  }

  public async Task<Pauta?> ObterPorIdAsync(Guid id)
  {
    const string sqlPauta = @"
select
    p.id as Id,
    p.reuniao_id as ReuniaoId,
    p.responsavel_id as ResponsavelId,
    p.titulo as Titulo,
    p.subtitulo as Subtitulo,
    p.contexto as Contexto,
    p.observacoes as Observacoes,
    p.status as Status,
    coalesce(p.tempo_previsto, 30) as TempoPrevisto,
    p.created_at as CreatedAt,
    p.updated_at as UpdatedAt,
    m.id as MembroId,
    m.nome as MembroNome,
    m.email as MembroEmail,
    m.cargo as MembroCargo,
    m.tipo as MembroTipo,
    m.foto as MembroFoto,
    m.ativo as MembroAtivo,
    r.id as ReuniaoResId,
    r.titulo as ReuniaoResTitulo
from public.pautas p
left join public.membros m on m.id = p.responsavel_id
left join public.reunioes r on r.id = p.reuniao_id
where p.id = @Id;
";
    using var connection = await connectionFactory.CreateConnectionAsync();
    var row = await connection.QuerySingleOrDefaultAsync<PautaRow>(sqlPauta, new { Id = id });
    if (row is null) return null;

    var pauta = MapearSimples(row);

    // Objetivos
    var objetivos = await connection.QueryAsync<PautaObjetivo>(
      "select id as Id, pauta_id as PautaId, texto as Texto, ordem as Ordem from public.pauta_objetivos where pauta_id = @Id order by ordem",
      new { Id = id });
    pauta.Objetivos = objetivos.ToList();

    // Dados
    var dados = await connection.QueryAsync<PautaDado>(
      "select id as Id, pauta_id as PautaId, secao_titulo as SecaoTitulo, label as Label, valor as Valor, ordem as Ordem from public.pauta_dados where pauta_id = @Id order by ordem",
      new { Id = id });
    pauta.Dados = dados.ToList();

    // Discussões + pontos
    var discussoes = await connection.QueryAsync<PautaDiscussao>(
      "select id as Id, pauta_id as PautaId, topico as Topico, ordem as Ordem from public.pauta_discussoes where pauta_id = @Id order by ordem",
      new { Id = id });
    var discList = discussoes.ToList();
    if (discList.Count > 0)
    {
      var discIds = discList.Select(d => d.Id).ToArray();
      var pontos = await connection.QueryAsync<PautaDiscussaoPonto>(
        "select id as Id, discussao_id as DiscussaoId, texto as Texto, ordem as Ordem from public.pauta_discussao_pontos where discussao_id = any(@Ids) order by ordem",
        new { Ids = discIds });
      var pontosPorDisc = pontos.GroupBy(p => p.DiscussaoId).ToDictionary(g => g.Key, g => g.ToList());
      foreach (var disc in discList)
        disc.Pontos = pontosPorDisc.TryGetValue(disc.Id, out var pts) ? pts : [];
    }
    pauta.Discussoes = discList;

    // Deliberações
    var deliberacoes = await connection.QueryAsync<PautaDeliberacao>(
      "select id as Id, pauta_id as PautaId, texto as Texto, ordem as Ordem from public.pauta_deliberacoes where pauta_id = @Id order by ordem",
      new { Id = id });
    pauta.Deliberacoes = deliberacoes.ToList();

    // Encaminhamentos
    var encaminhamentos = await connection.QueryAsync<PautaEncaminhamento>(
      "select id as Id, pauta_id as PautaId, acao as Acao, responsavel as Responsavel, prazo as Prazo, ordem as Ordem from public.pauta_encaminhamentos where pauta_id = @Id order by ordem",
      new { Id = id });
    pauta.Encaminhamentos = encaminhamentos.ToList();

    // Itens
    var itens = await connection.QueryAsync<PautaItemRow>(
      @"select pi.id as Id, pi.pauta_id as PautaId, pi.responsavel_id as ResponsavelId, pi.tema as Tema, pi.ordem as Ordem,
               to_char(pi.hora_inicio, 'HH24:MI') as HoraInicio, to_char(pi.hora_fim, 'HH24:MI') as HoraFim,
               m.id as MembroId, m.nome as MembroNome, m.email as MembroEmail, m.cargo as MembroCargo, m.tipo as MembroTipo, m.foto as MembroFoto, m.ativo as MembroAtivo
        from public.pauta_itens pi
        left join public.membros m on m.id = pi.responsavel_id
        where pi.pauta_id = @Id order by pi.ordem",
      new { Id = id });
    pauta.Itens = itens.Select(i => new PautaItemDetalhe
    {
      Id = i.Id,
      PautaId = i.PautaId,
      ResponsavelId = i.ResponsavelId,
      Tema = i.Tema,
      Ordem = i.Ordem,
      HoraInicio = i.HoraInicio,
      HoraFim = i.HoraFim,
      Responsavel = i.MembroId.HasValue ? new Membro
      {
        Id = i.MembroId.Value,
        Nome = i.MembroNome ?? string.Empty,
        Email = i.MembroEmail ?? string.Empty,
        Cargo = i.MembroCargo ?? string.Empty,
        Tipo = i.MembroTipo ?? string.Empty,
        Foto = i.MembroFoto,
        Ativo = i.MembroAtivo ?? false
      } : null
    }).ToList();

    return pauta;
  }

  public async Task<Pauta> CriarAsync(Pauta pauta)
  {
    const string sql = @"
insert into public.pautas (id, reuniao_id, responsavel_id, titulo, subtitulo, contexto, observacoes, status, tempo_previsto, created_at, updated_at)
values (gen_random_uuid(), @ReuniaoId, @ResponsavelId, @Titulo, @Subtitulo, @Contexto, @Observacoes, @Status, @TempoPrevisto, now(), now())
returning id;
";
    using var connection = await connectionFactory.CreateConnectionAsync();
    var newId = await connection.ExecuteScalarAsync<Guid>(sql, new
    {
      pauta.ReuniaoId,
      pauta.ResponsavelId,
      pauta.Titulo,
      pauta.Subtitulo,
      pauta.Contexto,
      pauta.Observacoes,
      pauta.Status,
      pauta.TempoPrevisto
    });
    return (await ObterPorIdAsync(newId))!;
  }

  public async Task<Pauta?> AtualizarAsync(Guid id, Pauta pauta)
  {
    const string sql = @"
update public.pautas
set reuniao_id = @ReuniaoId,
    responsavel_id = @ResponsavelId,
    titulo = @Titulo,
    subtitulo = @Subtitulo,
    contexto = @Contexto,
    observacoes = @Observacoes,
    status = @Status,
    tempo_previsto = @TempoPrevisto,
    updated_at = now()
where id = @Id;
";
    using var connection = await connectionFactory.CreateConnectionAsync();
    var affected = await connection.ExecuteAsync(sql, new
    {
      Id = id,
      pauta.ReuniaoId,
      pauta.ResponsavelId,
      pauta.Titulo,
      pauta.Subtitulo,
      pauta.Contexto,
      pauta.Observacoes,
      pauta.Status,
      pauta.TempoPrevisto
    });
    return affected == 0 ? null : await ObterPorIdAsync(id);
  }

  public async Task<bool> ExcluirAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    // Cascade manual para sub-tabelas
    await connection.ExecuteAsync("delete from public.pauta_deliberacoes where pauta_id = @Id", new { Id = id });
    await connection.ExecuteAsync("delete from public.pauta_encaminhamentos where pauta_id = @Id", new { Id = id });
    await connection.ExecuteAsync("delete from public.pauta_objetivos where pauta_id = @Id", new { Id = id });
    await connection.ExecuteAsync("delete from public.pauta_dados where pauta_id = @Id", new { Id = id });
    // Pontos de discussão
    var discIds = (await connection.QueryAsync<Guid>("select id from public.pauta_discussoes where pauta_id = @Id", new { Id = id })).ToArray();
    if (discIds.Length > 0)
      await connection.ExecuteAsync("delete from public.pauta_discussao_pontos where discussao_id = any(@Ids)", new { Ids = discIds });
    await connection.ExecuteAsync("delete from public.pauta_discussoes where pauta_id = @Id", new { Id = id });
    await connection.ExecuteAsync("delete from public.pauta_itens where pauta_id = @Id", new { Id = id });
    var affected = await connection.ExecuteAsync("delete from public.pautas where id = @Id", new { Id = id });
    return affected > 0;
  }

  public async Task<bool> AtualizarStatusAsync(Guid id, string status)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    var affected = await connection.ExecuteAsync(
      "update public.pautas set status = @Status, updated_at = now() where id = @Id",
      new { Id = id, Status = status });
    return affected > 0;
  }

  // ---- Sub-recursos ----

  // ---- Sub-recursos: Itens ----
  public async Task<PautaItemDetalhe> AdicionarItemAsync(Guid pautaId, PautaItemDetalhe item)
  {
    item.Id = Guid.NewGuid();
    item.PautaId = pautaId;
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync(
      "insert into public.pauta_itens (id, pauta_id, responsavel_id, tema, ordem, hora_inicio, hora_fim, created_at) values (@Id, @PautaId, @ResponsavelId, @Tema, @Ordem, @HoraInicio::time, @HoraFim::time, now())",
      new { item.Id, item.PautaId, item.ResponsavelId, item.Tema, item.Ordem, item.HoraInicio, item.HoraFim });
    return item;
  }

  public async Task AtualizarItemAsync(Guid id, PautaItemDetalhe item)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync(
      "update public.pauta_itens set tema = @Tema, responsavel_id = @ResponsavelId, hora_inicio = @HoraInicio::time, hora_fim = @HoraFim::time where id = @Id",
      new { item.Tema, item.ResponsavelId, item.HoraInicio, item.HoraFim, Id = id });
  }

  public async Task ExcluirItemAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync("delete from public.pauta_itens where id = @Id", new { Id = id });
  }

  public async Task<PautaObjetivo> AdicionarObjetivoAsync(Guid pautaId, string texto, int ordem)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    var id = await connection.ExecuteScalarAsync<Guid>(
      "insert into public.pauta_objetivos (id, pauta_id, texto, ordem, created_at) values (gen_random_uuid(), @PautaId, @Texto, @Ordem, now()) returning id",
      new { PautaId = pautaId, Texto = texto, Ordem = ordem });
    return new PautaObjetivo { Id = id, PautaId = pautaId, Texto = texto, Ordem = ordem };
  }

  public async Task AtualizarObjetivoAsync(Guid id, string texto)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync("update public.pauta_objetivos set texto = @Texto where id = @Id", new { Id = id, Texto = texto });
  }

  public async Task ExcluirObjetivoAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync("delete from public.pauta_objetivos where id = @Id", new { Id = id });
  }

  public async Task<PautaDado> AdicionarDadoAsync(Guid pautaId, PautaDado dado)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    var id = await connection.ExecuteScalarAsync<Guid>(
      "insert into public.pauta_dados (id, pauta_id, secao_titulo, label, valor, ordem, created_at) values (gen_random_uuid(), @PautaId, @SecaoTitulo, @Label, @Valor, @Ordem, now()) returning id",
      new { PautaId = pautaId, dado.SecaoTitulo, dado.Label, dado.Valor, dado.Ordem });
    dado.Id = id;
    dado.PautaId = pautaId;
    return dado;
  }

  public async Task AtualizarDadoAsync(Guid id, PautaDado dado)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync(
      "update public.pauta_dados set secao_titulo = @SecaoTitulo, label = @Label, valor = @Valor, ordem = @Ordem where id = @Id",
      new { Id = id, dado.SecaoTitulo, dado.Label, dado.Valor, dado.Ordem });
  }

  public async Task ExcluirDadoAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync("delete from public.pauta_dados where id = @Id", new { Id = id });
  }

  public async Task<PautaDiscussao> AdicionarDiscussaoAsync(Guid pautaId, string topico, int ordem)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    var id = await connection.ExecuteScalarAsync<Guid>(
      "insert into public.pauta_discussoes (id, pauta_id, topico, ordem, created_at) values (gen_random_uuid(), @PautaId, @Topico, @Ordem, now()) returning id",
      new { PautaId = pautaId, Topico = topico, Ordem = ordem });
    return new PautaDiscussao { Id = id, PautaId = pautaId, Topico = topico, Ordem = ordem };
  }

  public async Task AtualizarDiscussaoAsync(Guid id, string topico)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync("update public.pauta_discussoes set topico = @Topico where id = @Id", new { Id = id, Topico = topico });
  }

  public async Task ExcluirDiscussaoAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync("delete from public.pauta_discussao_pontos where discussao_id = @Id", new { Id = id });
    await connection.ExecuteAsync("delete from public.pauta_discussoes where id = @Id", new { Id = id });
  }

  public async Task<PautaDiscussaoPonto> AdicionarPontoDiscussaoAsync(Guid discussaoId, string texto, int ordem)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    var id = await connection.ExecuteScalarAsync<Guid>(
      "insert into public.pauta_discussao_pontos (id, discussao_id, texto, ordem, created_at) values (gen_random_uuid(), @DiscussaoId, @Texto, @Ordem, now()) returning id",
      new { DiscussaoId = discussaoId, Texto = texto, Ordem = ordem });
    return new PautaDiscussaoPonto { Id = id, DiscussaoId = discussaoId, Texto = texto, Ordem = ordem };
  }

  public async Task AtualizarPontoDiscussaoAsync(Guid id, string texto)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync("update public.pauta_discussao_pontos set texto = @Texto where id = @Id", new { Id = id, Texto = texto });
  }

  public async Task ExcluirPontoDiscussaoAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync("delete from public.pauta_discussao_pontos where id = @Id", new { Id = id });
  }

  public async Task<PautaDeliberacao> AdicionarDeliberacaoAsync(Guid pautaId, string texto, int ordem)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    var id = await connection.ExecuteScalarAsync<Guid>(
      "insert into public.pauta_deliberacoes (id, pauta_id, texto, ordem, created_at) values (gen_random_uuid(), @PautaId, @Texto, @Ordem, now()) returning id",
      new { PautaId = pautaId, Texto = texto, Ordem = ordem });
    return new PautaDeliberacao { Id = id, PautaId = pautaId, Texto = texto, Ordem = ordem };
  }

  public async Task AtualizarDeliberacaoAsync(Guid id, string texto)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync("update public.pauta_deliberacoes set texto = @Texto where id = @Id", new { Id = id, Texto = texto });
  }

  public async Task ExcluirDeliberacaoAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync("delete from public.pauta_deliberacoes where id = @Id", new { Id = id });
  }

  public async Task<PautaEncaminhamento> AdicionarEncaminhamentoAsync(Guid pautaId, PautaEncaminhamento encaminhamento)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    var id = await connection.ExecuteScalarAsync<Guid>(
      "insert into public.pauta_encaminhamentos (id, pauta_id, acao, responsavel, prazo, ordem, created_at) values (gen_random_uuid(), @PautaId, @Acao, @Responsavel, @Prazo, @Ordem, now()) returning id",
      new { PautaId = pautaId, encaminhamento.Acao, encaminhamento.Responsavel, encaminhamento.Prazo, encaminhamento.Ordem });
    encaminhamento.Id = id;
    encaminhamento.PautaId = pautaId;
    return encaminhamento;
  }

  public async Task AtualizarEncaminhamentoAsync(Guid id, PautaEncaminhamento encaminhamento)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync(
      "update public.pauta_encaminhamentos set acao = @Acao, responsavel = @Responsavel, prazo = @Prazo, ordem = @Ordem where id = @Id",
      new { Id = id, encaminhamento.Acao, encaminhamento.Responsavel, encaminhamento.Prazo, encaminhamento.Ordem });
  }

  public async Task ExcluirEncaminhamentoAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync("delete from public.pauta_encaminhamentos where id = @Id", new { Id = id });
  }

  // ---- Mapeamento ----

  private static Pauta MapearSimples(PautaRow row)
  {
    return new Pauta
    {
      Id = row.Id,
      ReuniaoId = row.ReuniaoId,
      ResponsavelId = row.ResponsavelId,
      Titulo = row.Titulo,
      Subtitulo = row.Subtitulo,
      Contexto = row.Contexto,
      Observacoes = row.Observacoes,
      Status = row.Status,
      TempoPrevisto = row.TempoPrevisto,
      CreatedAt = row.CreatedAt,
      UpdatedAt = row.UpdatedAt,
      Responsavel = row.MembroId.HasValue ? new Membro
      {
        Id = row.MembroId.Value,
        Nome = row.MembroNome ?? string.Empty,
        Email = row.MembroEmail ?? string.Empty,
        Cargo = row.MembroCargo ?? string.Empty,
        Tipo = row.MembroTipo ?? string.Empty,
        Foto = row.MembroFoto,
        Ativo = row.MembroAtivo ?? false
      } : null,
      Reuniao = row.ReuniaoResId.HasValue ? new ReuniaoResumo
      {
        Id = row.ReuniaoResId.Value,
        Titulo = row.ReuniaoResTitulo ?? string.Empty
      } : null
    };
  }

  private sealed class PautaRow
  {
    public Guid Id { get; set; }
    public Guid? ReuniaoId { get; set; }
    public Guid? ResponsavelId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Subtitulo { get; set; }
    public string? Contexto { get; set; }
    public string? Observacoes { get; set; }
    public string Status { get; set; } = "rascunho";
    public int TempoPrevisto { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? MembroId { get; set; }
    public string? MembroNome { get; set; }
    public string? MembroEmail { get; set; }
    public string? MembroCargo { get; set; }
    public string? MembroTipo { get; set; }
    public string? MembroFoto { get; set; }
    public bool? MembroAtivo { get; set; }
    public Guid? ReuniaoResId { get; set; }
    public string? ReuniaoResTitulo { get; set; }
  }

  private sealed class PautaItemRow
  {
    public Guid Id { get; set; }
    public Guid PautaId { get; set; }
    public Guid? ResponsavelId { get; set; }
    public string Tema { get; set; } = string.Empty;
    public int Ordem { get; set; }
    public string? HoraInicio { get; set; }
    public string? HoraFim { get; set; }
    public Guid? MembroId { get; set; }
    public string? MembroNome { get; set; }
    public string? MembroEmail { get; set; }
    public string? MembroCargo { get; set; }
    public string? MembroTipo { get; set; }
    public string? MembroFoto { get; set; }
    public bool? MembroAtivo { get; set; }
  }
}
