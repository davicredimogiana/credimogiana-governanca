using Dapper;
using Governanca.Application.Commands;
using Governanca.Application.Interfaces;

namespace Governanca.Infrastructure.Repositories;

public class AtaWriteRepository(IDbConnectionFactory connectionFactory) : IAtaWriteRepository
{
    public async Task<Guid> CriarAtaCompletaAsync(CriarAtaCompletaCommand command)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            const string insertAta = @"
                insert into public.atas
                    (id, reuniao_id, conteudo_markdown, resumo_executivo, link_drive, link_auditoria,
                     tom_geral, urgencia, total_decisoes, total_acoes, total_riscos, total_oportunidades,
                     status, recebida_em, created_at, updated_at)
                values
                    (gen_random_uuid(), @ReuniaoId, @ConteudoMarkdown, @ResumoExecutivo, @LinkDrive, @LinkAuditoria,
                     @TomGeral, @Urgencia, @TotalDecisoes, @TotalAcoes, @TotalRiscos, @TotalOportunidades,
                     'recebida', now(), now(), now())
                returning id;
            ";

            var ataId = await connection.ExecuteScalarAsync<Guid>(insertAta, new
            {
                ReuniaoId = command.ProcessamentoId,
                command.ConteudoMarkdown,
                command.ResumoExecutivo,
                command.LinkDrive,
                command.LinkAuditoria,
                command.TomGeral,
                command.Urgencia,
                command.TotalDecisoes,
                command.TotalAcoes,
                command.TotalRiscos,
                command.TotalOportunidades
            }, transaction);

            if (command.Decisoes.Count > 0)
            {
                const string sql = @"
                    insert into public.decisoes_ia
                    (id, ata_id, descricao, responsavel, prazo, status, created_at)
                    values
                    (gen_random_uuid(), @AtaId, @Descricao, @Responsavel, @Prazo, @Status, now());
                ";

                foreach (var item in command.Decisoes)
                {
                    await connection.ExecuteAsync(sql, new
                    {
                        AtaId = ataId,
                        item.Descricao,
                        item.Responsavel,
                        item.Prazo,
                        item.Status
                    }, transaction);
                }
            }

            if (command.Acoes.Count > 0)
            {
                const string sql = @"
                    insert into public.acoes_ia
                    (id, ata_id, descricao, responsavel, prazo, status, created_at)
                    values
                    (gen_random_uuid(), @AtaId, @Descricao, @Responsavel, @Prazo, @Status, now());
                ";

                foreach (var item in command.Acoes)
                {
                    await connection.ExecuteAsync(sql, new
                    {
                        AtaId = ataId,
                        item.Descricao,
                        item.Responsavel,
                        item.Prazo,
                        item.Status
                    }, transaction);
                }
            }

            if (command.Riscos.Count > 0)
            {
                const string sql = @"
                    insert into public.riscos_ia
                    (id, ata_id, descricao, severidade, mencoes, created_at)
                    values
                    (gen_random_uuid(), @AtaId, @Descricao, @Severidade, @Mencoes, now());
                ";

                foreach (var item in command.Riscos)
                {
                    await connection.ExecuteAsync(sql, new
                    {
                        AtaId = ataId,
                        item.Descricao,
                        item.Severidade,
                        item.Mencoes
                    }, transaction);
                }
            }

            if (command.Oportunidades.Count > 0)
            {
                const string sql = @"
                    insert into public.oportunidades_ia
                    (id, ata_id, descricao, potencial, mencoes, created_at)
                    values
                    (gen_random_uuid(), @AtaId, @Descricao, @Potencial, @Mencoes, now());
                ";

                foreach (var item in command.Oportunidades)
                {
                    await connection.ExecuteAsync(sql, new
                    {
                        AtaId = ataId,
                        item.Descricao,
                        item.Potencial,
                        item.Mencoes
                    }, transaction);
                }
            }

            transaction.Commit();
            return ataId;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}