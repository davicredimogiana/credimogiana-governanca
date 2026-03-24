using Dapper;
using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Governanca.Infrastructure.Data;

namespace Governanca.Infrastructure.Repositories;

public class EnvioEmailRepository(IDbConnectionFactory connectionFactory) : IEnvioEmailRepository
{
  public async Task<IEnumerable<EnvioEmail>> ListarAsync()
  {
    const string sql = @"
select
    e.id as Id,
    e.ata_id as AtaId,
    e.destinatario_nome as DestinatarioNome,
    e.destinatario_email as DestinatarioEmail,
    e.destinatario_cargo as DestinatarioCargo,
    e.enviado_em as EnviadoEm,
    e.lido as Lido,
    e.lido_em as LidoEm,
    e.created_at as CreatedAt,
    a.resumo_executivo as AtaResumoExecutivo,
    r.titulo as ReuniaoTitulo,
    to_char(r.data, 'YYYY-MM-DD') as ReuniaoData
from public.envios_email e
left join public.atas a on a.id = e.ata_id
left join public.reunioes r on r.id = a.reuniao_id
order by e.enviado_em desc;
";
    using var connection = await connectionFactory.CreateConnectionAsync();
    return await connection.QueryAsync<EnvioEmail>(sql);
  }
}
