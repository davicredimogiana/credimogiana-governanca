using System.Text.Json;
using Dapper;
using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Governanca.Infrastructure.Data;

namespace Governanca.Infrastructure.Repositories;

public class ConfiguracaoRepository(IDbConnectionFactory connectionFactory) : IConfiguracaoRepository
{
  public async Task<ConfiguracoesSistema> ObterAsync()
  {
    const string sql = @"
      SELECT chave, valor::text
      FROM public.configuracoes
      WHERE chave IN (
        'envio_automatico_atas',
        'envio_automatico_pautas',
        'webhook_n8n_receber_atas',
        'webhook_n8n_enviar_atas',
        'email_remetente',
        'nome_remetente'
      );
    ";

    using var connection = await connectionFactory.CreateConnectionAsync();
    var rows = await connection.QueryAsync<(string chave, string? valor)>(sql);
    var dict = rows.ToDictionary(r => r.chave, r => r.valor);

    return new ConfiguracoesSistema
    {
      EnviarEmailAutomatico       = LerBool(dict, "envio_automatico_atas"),
      EnviarEmailAutomaticoPautas = LerBool(dict, "envio_automatico_pautas"),
      WebhookN8nReceberAtas       = LerString(dict, "webhook_n8n_receber_atas"),
      WebhookN8nEnviarAtas        = LerString(dict, "webhook_n8n_enviar_atas"),
      EmailRemetente              = LerString(dict, "email_remetente"),
      NomeRemetente               = LerString(dict, "nome_remetente"),
    };
  }

  public async Task<ConfiguracoesSistema> AtualizarAsync(ConfiguracoesSistema cfg)
  {
    using var connection = await connectionFactory.CreateConnectionAsync();

    await UpsertAsync(connection, "envio_automatico_atas",    JsonSerializer.Serialize(new { ativo = cfg.EnviarEmailAutomatico }));
    await UpsertAsync(connection, "envio_automatico_pautas",  JsonSerializer.Serialize(new { ativo = cfg.EnviarEmailAutomaticoPautas }));
    await UpsertAsync(connection, "webhook_n8n_receber_atas", JsonSerializer.Serialize(new { url  = cfg.WebhookN8nReceberAtas ?? "" }));
    await UpsertAsync(connection, "webhook_n8n_enviar_atas",  JsonSerializer.Serialize(new { url  = cfg.WebhookN8nEnviarAtas  ?? "" }));
    await UpsertAsync(connection, "email_remetente",          JsonSerializer.Serialize(new { valor = cfg.EmailRemetente ?? "" }));
    await UpsertAsync(connection, "nome_remetente",           JsonSerializer.Serialize(new { valor = cfg.NomeRemetente  ?? "" }));

    return await ObterAsync();
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  private static async Task UpsertAsync(System.Data.IDbConnection connection, string chave, string valorJson)
  {
    const string sql = @"
      INSERT INTO public.configuracoes (id, chave, valor, created_at, updated_at)
      VALUES (gen_random_uuid(), @Chave, @Valor::jsonb, now(), now())
      ON CONFLICT (chave)
      DO UPDATE SET valor = @Valor::jsonb, updated_at = now();
    ";
    await connection.ExecuteAsync(sql, new { Chave = chave, Valor = valorJson });
  }

  private static bool LerBool(Dictionary<string, string?> dict, string chave)
  {
    if (!dict.TryGetValue(chave, out var json) || string.IsNullOrWhiteSpace(json)) return false;
    try
    {
      var doc = JsonDocument.Parse(json);
      if (doc.RootElement.TryGetProperty("ativo", out var prop)) return prop.GetBoolean();
    }
    catch { }
    return false;
  }

  private static string? LerString(Dictionary<string, string?> dict, string chave)
  {
    if (!dict.TryGetValue(chave, out var json) || string.IsNullOrWhiteSpace(json)) return null;
    try
    {
      var doc = JsonDocument.Parse(json);
      if (doc.RootElement.TryGetProperty("url",   out var url)) return url.GetString();
      if (doc.RootElement.TryGetProperty("valor", out var val)) return val.GetString();
    }
    catch { }
    return null;
  }
}
