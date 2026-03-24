using Dapper;
using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Governanca.Infrastructure.Data;

namespace Governanca.Infrastructure.Repositories;

public class AtaRepository : IAtaRepository
{
  private readonly IDbConnectionFactory _connectionFactory;

  public AtaRepository(IDbConnectionFactory connectionFactory)
  {
    _connectionFactory = connectionFactory;
  }

  public async Task<IEnumerable<Ata>> ListarAsync()
  {
    using var connection = await _connectionFactory.CreateConnectionAsync();

    var atas = (await connection.QueryAsync<AtaRow>(SqlAtasLista)).ToList();
    if (atas.Count == 0)
      return [];

    var ataIds = atas.Select(x => x.Id).ToArray();

    var decisoes = (await connection.QueryAsync<DecisaoRow>(SqlDecisoesPorAta, new { AtaIds = ataIds }))
        .GroupBy(x => x.AtaId)
        .ToDictionary(g => g.Key, g => g.Select(MapearDecisao).ToList());

    var acoes = (await connection.QueryAsync<AcaoRow>(SqlAcoesPorAta, new { AtaIds = ataIds }))
        .GroupBy(x => x.AtaId)
        .ToDictionary(g => g.Key, g => g.Select(MapearAcao).ToList());

    var riscos = (await connection.QueryAsync<RiscoRow>(SqlRiscosPorAta, new { AtaIds = ataIds }))
        .GroupBy(x => x.AtaId)
        .ToDictionary(g => g.Key, g => g.Select(MapearRisco).ToList());

    var oportunidades = (await connection.QueryAsync<OportunidadeRow>(SqlOportunidadesPorAta, new { AtaIds = ataIds }))
        .GroupBy(x => x.AtaId)
        .ToDictionary(g => g.Key, g => g.Select(MapearOportunidade).ToList());

    var envios = (await connection.QueryAsync<EnvioRow>(SqlEnviosPorAta, new { AtaIds = ataIds }))
        .GroupBy(x => x.AtaId)
        .ToDictionary(
            g => g.Key,
            g => g.Select(x => x.DestinatarioEmail)
                  .Where(x => !string.IsNullOrWhiteSpace(x))
                  .Distinct(StringComparer.OrdinalIgnoreCase)
                  .ToList()
        );

    return atas.Select(a => MapearAta(a, decisoes, acoes, riscos, oportunidades, envios)).ToList();
  }

  public async Task<Ata?> ObterPorIdAsync(Guid id)
  {
    using var connection = await _connectionFactory.CreateConnectionAsync();

    var ata = await connection.QuerySingleOrDefaultAsync<AtaRow>(SqlAtaPorId, new { Id = id });
    if (ata is null)
      return null;

    var decisoes = (await connection.QueryAsync<DecisaoRow>(SqlDecisoesPorAta, new { AtaIds = new[] { id } }))
        .GroupBy(x => x.AtaId)
        .ToDictionary(g => g.Key, g => g.Select(MapearDecisao).ToList());

    var acoes = (await connection.QueryAsync<AcaoRow>(SqlAcoesPorAta, new { AtaIds = new[] { id } }))
        .GroupBy(x => x.AtaId)
        .ToDictionary(g => g.Key, g => g.Select(MapearAcao).ToList());

    var riscos = (await connection.QueryAsync<RiscoRow>(SqlRiscosPorAta, new { AtaIds = new[] { id } }))
        .GroupBy(x => x.AtaId)
        .ToDictionary(g => g.Key, g => g.Select(MapearRisco).ToList());

    var oportunidades = (await connection.QueryAsync<OportunidadeRow>(SqlOportunidadesPorAta, new { AtaIds = new[] { id } }))
        .GroupBy(x => x.AtaId)
        .ToDictionary(g => g.Key, g => g.Select(MapearOportunidade).ToList());

    var envios = (await connection.QueryAsync<EnvioRow>(SqlEnviosPorAta, new { AtaIds = new[] { id } }))
        .GroupBy(x => x.AtaId)
        .ToDictionary(
            g => g.Key,
            g => g.Select(x => x.DestinatarioEmail)
                  .Where(x => !string.IsNullOrWhiteSpace(x))
                  .Distinct(StringComparer.OrdinalIgnoreCase)
                  .ToList()
        );

    return MapearAta(ata, decisoes, acoes, riscos, oportunidades, envios);
  }

  private static Ata MapearAta(
      AtaRow row,
      IReadOnlyDictionary<Guid, List<DecisaoIA>> decisoes,
      IReadOnlyDictionary<Guid, List<AcaoIA>> acoes,
      IReadOnlyDictionary<Guid, List<RiscoIA>> riscos,
      IReadOnlyDictionary<Guid, List<OportunidadeIA>> oportunidades,
      IReadOnlyDictionary<Guid, List<string>> envios)
  {
    return new Ata
    {
      Id = row.Id,
      ReuniaoId = row.ReuniaoId,
      ConteudoMarkdown = row.ConteudoMarkdown,
      GeradaEm = row.RecebidaEm ?? row.CreatedAt,
      Status = string.IsNullOrWhiteSpace(row.Status) ? "recebida" : row.Status,
      EnviadaPara = envios.TryGetValue(row.Id, out var enviados) ? enviados : [],
      Analise = new AnaliseIA
      {
        Resumo = row.ResumoExecutivo ?? string.Empty,
        Decisoes = decisoes.TryGetValue(row.Id, out var listaDecisoes) ? listaDecisoes : [],
        Acoes = acoes.TryGetValue(row.Id, out var listaAcoes) ? listaAcoes : [],
        Riscos = riscos.TryGetValue(row.Id, out var listaRiscos) ? listaRiscos : [],
        Oportunidades = oportunidades.TryGetValue(row.Id, out var listaOportunidades) ? listaOportunidades : [],
        SentimentoGeral = string.IsNullOrWhiteSpace(row.TomGeral) ? "neutro" : row.TomGeral!
      }
    };
  }

  private static DecisaoIA MapearDecisao(DecisaoRow row)
  {
    return new DecisaoIA
    {
      Id = row.Id,
      Descricao = row.Descricao,
      Responsavel = row.Responsavel,
      Prazo = row.Prazo,
      Status = string.IsNullOrWhiteSpace(row.Status) ? "pendente" : row.Status!
    };
  }

  private static AcaoIA MapearAcao(AcaoRow row)
  {
    return new AcaoIA
    {
      Id = row.Id,
      Descricao = row.Descricao,
      Responsavel = row.Responsavel,
      Prazo = row.Prazo,
      Status = string.IsNullOrWhiteSpace(row.Status) ? "pendente" : row.Status!
    };
  }

  private static RiscoIA MapearRisco(RiscoRow row)
  {
    return new RiscoIA
    {
      Id = row.Id,
      Descricao = row.Descricao,
      Severidade = row.Severidade,
      Mencoes = row.Mencoes
    };
  }

  private static OportunidadeIA MapearOportunidade(OportunidadeRow row)
  {
    return new OportunidadeIA
    {
      Id = row.Id,
      Descricao = row.Descricao,
      Potencial = row.Potencial,
      Mencoes = row.Mencoes
    };
  }

  private const string SqlAtasLista = @"
select
    a.id as Id,
    a.reuniao_id as ReuniaoId,
    a.conteudo_markdown as ConteudoMarkdown,
    a.resumo_executivo as ResumoExecutivo,
    a.tom_geral as TomGeral,
    a.urgencia as Urgencia,
    a.status as Status,
    a.recebida_em as RecebidaEm,
    a.created_at as CreatedAt
from public.atas a
order by coalesce(a.recebida_em, a.created_at) desc;
";

  private const string SqlAtaPorId = @"
select
    a.id as Id,
    a.reuniao_id as ReuniaoId,
    a.conteudo_markdown as ConteudoMarkdown,
    a.resumo_executivo as ResumoExecutivo,
    a.tom_geral as TomGeral,
    a.urgencia as Urgencia,
    a.status as Status,
    a.recebida_em as RecebidaEm,
    a.created_at as CreatedAt
from public.atas a
where a.id = @Id;
";

  private const string SqlDecisoesPorAta = @"
select
    d.id as Id,
    d.ata_id as AtaId,
    d.descricao as Descricao,
    d.responsavel as Responsavel,
    d.prazo as Prazo,
    d.status as Status
from public.decisoes_ia d
where d.ata_id = any(@AtaIds)
order by d.created_at asc;
";

  private const string SqlAcoesPorAta = @"
select
    a.id as Id,
    a.ata_id as AtaId,
    a.descricao as Descricao,
    a.responsavel as Responsavel,
    a.prazo as Prazo,
    a.status as Status
from public.acoes_ia a
where a.ata_id = any(@AtaIds)
order by a.created_at asc;
";

  private const string SqlRiscosPorAta = @"
select
    r.id as Id,
    r.ata_id as AtaId,
    r.descricao as Descricao,
    r.severidade as Severidade,
    coalesce(r.mencoes, 0) as Mencoes
from public.riscos_ia r
where r.ata_id = any(@AtaIds)
order by r.created_at asc;
";

  private const string SqlOportunidadesPorAta = @"
select
    o.id as Id,
    o.ata_id as AtaId,
    o.descricao as Descricao,
    o.potencial as Potencial,
    coalesce(o.mencoes, 0) as Mencoes
from public.oportunidades_ia o
where o.ata_id = any(@AtaIds)
order by o.created_at asc;
";

  private const string SqlEnviosPorAta = @"
select
    e.ata_id as AtaId,
    e.destinatario_email as DestinatarioEmail
from public.envios_email e
where e.ata_id = any(@AtaIds)
order by e.enviado_em asc;
";

  private sealed class AtaRow
  {
    public Guid Id { get; set; }
    public Guid ReuniaoId { get; set; }
    public string ConteudoMarkdown { get; set; } = string.Empty;
    public string? ResumoExecutivo { get; set; }
    public string? TomGeral { get; set; }
    public string? Urgencia { get; set; }
    public string? Status { get; set; }
    public DateTime? RecebidaEm { get; set; }
    public DateTime CreatedAt { get; set; }
  }

  private sealed class DecisaoRow
  {
    public Guid Id { get; set; }
    public Guid AtaId { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public string? Responsavel { get; set; }
    public string? Prazo { get; set; }
    public string? Status { get; set; }
  }

  private sealed class AcaoRow
  {
    public Guid Id { get; set; }
    public Guid AtaId { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public string? Responsavel { get; set; }
    public string? Prazo { get; set; }
    public string? Status { get; set; }
  }

  private sealed class RiscoRow
  {
    public Guid Id { get; set; }
    public Guid AtaId { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public string? Severidade { get; set; }
    public int Mencoes { get; set; }
  }

  private sealed class OportunidadeRow
  {
    public Guid Id { get; set; }
    public Guid AtaId { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public string? Potencial { get; set; }
    public int Mencoes { get; set; }
  }

  private sealed class EnvioRow
  {
    public Guid AtaId { get; set; }
    public string DestinatarioEmail { get; set; } = string.Empty;
  }

  public async Task<bool> ExcluirAsync(Guid id)
  {
    using var connection = await _connectionFactory.CreateConnectionAsync();
    await connection.ExecuteAsync("delete from public.decisoes_ia where ata_id = @Id", new { Id = id });
    await connection.ExecuteAsync("delete from public.acoes_ia where ata_id = @Id", new { Id = id });
    await connection.ExecuteAsync("delete from public.riscos_ia where ata_id = @Id", new { Id = id });
    await connection.ExecuteAsync("delete from public.oportunidades_ia where ata_id = @Id", new { Id = id });
    await connection.ExecuteAsync("delete from public.envios_email where ata_id = @Id", new { Id = id });
    var affected = await connection.ExecuteAsync("delete from public.atas where id = @Id", new { Id = id });
    return affected > 0;
  }
}