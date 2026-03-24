using Dapper;
using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Governanca.Infrastructure.Data;

namespace Governanca.Infrastructure.Repositories;

public class DashboardRepository(IDbConnectionFactory connectionFactory) : IDashboardRepository
{
  public async Task<EstatisticasDashboard> ObterResumoAsync()
  {
    const string sqlResumo = @"
select
    (select count(*) from public.reunioes) as ReunioesTotais,
    (
        select count(*)
        from public.reunioes
        where date_trunc('month', data) = date_trunc('month', current_date)
    ) as ReunioesEsteMes,
    (
        select count(*)
        from public.pautas
        where coalesce(status, '') in ('rascunho', 'pendente')
    ) as PautasPendentes,
    (
        select count(*)
        from public.tarefas_delegadas
        where coalesce(status, '') in ('pendente', 'em_andamento')
    ) as AcoesPendentes,
    (
        select count(*)
        from public.tarefas_delegadas
        where prazo < current_date
          and coalesce(status, '') not in ('concluida', 'concluído', 'concluida')
    ) as AcoesAtrasadas,
    0::numeric as ParticipacaoMedia;
";

    const string sqlProximaReuniao = @"
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
where r.data >= current_date
order by r.data asc, r.horario asc
limit 1;
";

    using var connection = await connectionFactory.CreateConnectionAsync();

    var resumo = await connection.QuerySingleAsync<EstatisticasDashboard>(sqlResumo);
    var proxima = await connection.QuerySingleOrDefaultAsync<ProximaReuniaoRow>(sqlProximaReuniao);

    if (proxima is not null)
    {
      resumo.ProximaReuniao = new Reuniao
      {
        Id = proxima.Id,
        Titulo = proxima.Titulo,
        Descricao = proxima.Descricao,
        Data = proxima.Data,
        Horario = proxima.Horario,
        Duracao = proxima.Duracao,
        Local = proxima.Local,
        Plataforma = proxima.Plataforma,
        Status = proxima.Status,
        Tipo = proxima.Tipo,
        CriadoEm = proxima.CriadoEm,
        CriadoPor = new Membro
        {
          Id = proxima.CriadoPorId ?? Guid.Empty,
          Nome = proxima.CriadoPorNome ?? string.Empty,
          Email = proxima.CriadoPorEmail ?? string.Empty,
          Cargo = proxima.CriadoPorCargo ?? string.Empty,
          Tipo = proxima.CriadoPorTipo ?? string.Empty,
          Foto = proxima.CriadoPorFoto,
          Ativo = proxima.CriadoPorAtivo ?? false
        },
        Participantes = [],
        Pautas = []
      };
    }

    return resumo;
  }

  private sealed class ProximaReuniaoRow
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
}