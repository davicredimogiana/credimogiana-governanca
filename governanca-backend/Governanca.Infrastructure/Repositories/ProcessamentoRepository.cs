using Dapper;
using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using System.Text.Json;

namespace Governanca.Infrastructure.Repositories;

public class ProcessamentoRepository(IDbConnectionFactory connectionFactory) : IProcessamentoRepository
{
  public async Task<IEnumerable<ProcessamentoGravacao>> ListarAsync(Guid? reuniaoId)
  {
    var sql = @"
select
    id as Id,
    reuniao_id as ReuniaoId,
    pauta_id as PautaId,
    nome_arquivo as NomeArquivo,
    object_key as ObjectKey,
    status as Status,
    etapa_atual as EtapaAtual,
    progresso as Progresso,
    link_drive as LinkDrive,
    link_arquivo_processado as LinkArquivoProcessado,
    erro_mensagem as ErroMensagem,
    participantes as Participantes,
    tarefas_marcadas as TarefasMarcadas,
    assinaturas::text as AssinaturasJson,
    created_at as CreatedAt,
    updated_at as UpdatedAt
from public.processamentos_gravacao
" + (reuniaoId.HasValue ? "where reuniao_id = @ReuniaoId " : "") + "order by created_at desc;";

    using var connection = await connectionFactory.CreateConnectionAsync();
    var rows = await connection.QueryAsync<ProcessamentoRow>(sql, reuniaoId.HasValue ? new { ReuniaoId = reuniaoId } : null);
    return rows.Select(Mapear);
  }

  public async Task<ProcessamentoGravacao?> ObterPorIdAsync(Guid id)
  {
    const string sql = @"
select
    id as Id,
    reuniao_id as ReuniaoId,
    pauta_id as PautaId,
    nome_arquivo as NomeArquivo,
    object_key as ObjectKey,
    status as Status,
    etapa_atual as EtapaAtual,
    progresso as Progresso,
    link_drive as LinkDrive,
    link_arquivo_processado as LinkArquivoProcessado,
    erro_mensagem as ErroMensagem,
    participantes as Participantes,
    tarefas_marcadas as TarefasMarcadas,
    assinaturas::text as AssinaturasJson,
    created_at as CreatedAt,
    updated_at as UpdatedAt
from public.processamentos_gravacao
where id = @Id;
";
    using var connection = await connectionFactory.CreateConnectionAsync();
    var row = await connection.QuerySingleOrDefaultAsync<ProcessamentoRow>(sql, new { Id = id });
    return row is null ? null : Mapear(row);
  }

  public async Task<ProcessamentoGravacao> CriarAsync(ProcessamentoGravacao processamento)
  {
    const string sql = @"
insert into public.processamentos_gravacao
    (id, reuniao_id, pauta_id, nome_arquivo, object_key, status, etapa_atual, progresso,
     link_drive, link_arquivo_processado, erro_mensagem, participantes, tarefas_marcadas, assinaturas, created_at, updated_at)
values
    (gen_random_uuid(), @ReuniaoId, @PautaId, @NomeArquivo, @ObjectKey, @Status, @EtapaAtual, @Progresso,
     @LinkDrive, @LinkArquivoProcessado, @ErroMensagem, @Participantes, @TarefasMarcadas, cast(@AssinaturasJson as jsonb), now(), now())
returning id;
";
    using var connection = await connectionFactory.CreateConnectionAsync();
    var newId = await connection.ExecuteScalarAsync<Guid>(sql, new
    {
      processamento.ReuniaoId,
      processamento.PautaId,
      processamento.NomeArquivo,
      processamento.ObjectKey,
      processamento.Status,
      processamento.EtapaAtual,
      processamento.Progresso,
      processamento.LinkDrive,
      processamento.LinkArquivoProcessado,
      processamento.ErroMensagem,
      Participantes = processamento.Participantes.ToArray(),
      TarefasMarcadas = processamento.TarefasMarcadas.ToArray(),
      AssinaturasJson = JsonSerializer.Serialize(processamento.Assinaturas)
    });
    return (await ObterPorIdAsync(newId))!;
  }

  public async Task<ProcessamentoGravacao?> AtualizarAsync(Guid id, ProcessamentoGravacao processamento)
  {
    const string sql = @"
update public.processamentos_gravacao
set status = @Status,
    etapa_atual = @EtapaAtual,
    progresso = @Progresso,
    object_key = @ObjectKey,
    link_drive = @LinkDrive,
    link_arquivo_processado = @LinkArquivoProcessado,
    erro_mensagem = @ErroMensagem,
    participantes = @Participantes,
    tarefas_marcadas = @TarefasMarcadas,
    assinaturas = cast(@AssinaturasJson as jsonb),
    updated_at = now()
where id = @Id;
";
    using var connection = await connectionFactory.CreateConnectionAsync();
    var affected = await connection.ExecuteAsync(sql, new
    {
      Id = id,
      processamento.Status,
      processamento.EtapaAtual,
      processamento.Progresso,
      processamento.ObjectKey,
      processamento.LinkDrive,
      processamento.LinkArquivoProcessado,
      processamento.ErroMensagem,
      Participantes = processamento.Participantes.ToArray(),
      TarefasMarcadas = processamento.TarefasMarcadas.ToArray(),
      AssinaturasJson = JsonSerializer.Serialize(processamento.Assinaturas)
    });
    return affected == 0 ? null : await ObterPorIdAsync(id);
  }

  public async Task<bool> ExcluirAsync(Guid id)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();
    var affected = await connection.ExecuteAsync(
      "delete from public.processamentos_gravacao where id = @Id", new { Id = id });
    return affected > 0;
  }

  private static ProcessamentoGravacao Mapear(ProcessamentoRow row)
  {
    List<AssinaturaProcessamento> assinaturas = [];
    if (!string.IsNullOrEmpty(row.AssinaturasJson))
    {
      try
      {
        assinaturas = JsonSerializer.Deserialize<List<AssinaturaProcessamento>>(row.AssinaturasJson,
          new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];
      }
      catch { /* ignora erros de desserialização */ }
    }
    return new ProcessamentoGravacao
    {
      Id = row.Id,
      ReuniaoId = row.ReuniaoId,
      PautaId = row.PautaId,
      NomeArquivo = row.NomeArquivo,
      ObjectKey = row.ObjectKey,
      Status = row.Status,
      EtapaAtual = row.EtapaAtual,
      Progresso = row.Progresso,
      LinkDrive = row.LinkDrive,
      LinkArquivoProcessado = row.LinkArquivoProcessado,
      ErroMensagem = row.ErroMensagem,
      Participantes = row.Participantes?.ToList() ?? [],
      TarefasMarcadas = row.TarefasMarcadas?.ToList() ?? [],
      Assinaturas = assinaturas,
      CreatedAt = row.CreatedAt,
      UpdatedAt = row.UpdatedAt
    };
  }

  private sealed class ProcessamentoRow
  {
    public Guid Id { get; set; }
    public Guid? ReuniaoId { get; set; }
    public Guid? PautaId { get; set; }
    public string NomeArquivo { get; set; } = string.Empty;
    public string? ObjectKey { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? EtapaAtual { get; set; }
    public int Progresso { get; set; }
    public string? LinkDrive { get; set; }
    public string? LinkArquivoProcessado { get; set; }
    public string? ErroMensagem { get; set; }
    public string[]? Participantes { get; set; }
    public Guid[]? TarefasMarcadas { get; set; }
    public string? AssinaturasJson { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
  }
}
