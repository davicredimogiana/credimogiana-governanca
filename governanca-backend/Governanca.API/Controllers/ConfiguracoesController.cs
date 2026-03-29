using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Governanca.Api.Controllers;

[ApiController]
[Route("api/configuracoes")]
public class ConfiguracoesController(IConfiguracaoRepository repository) : ControllerBase
{
  [HttpGet]
  public async Task<IActionResult> Get()
  {
    var dados = await repository.ObterAsync();
    return Ok(dados);
  }

  /// <summary>
  /// Aceita um objeto parcial (apenas os campos que devem ser alterados).
  /// Faz merge com os valores atuais do banco antes de salvar,
  /// evitando sobrescrever campos nao enviados com null/false.
  /// </summary>
  [HttpPut]
  public async Task<IActionResult> Put([FromBody] JsonElement input)
  {
    // Carrega os valores atuais do banco
    var atual = await repository.ObterAsync();

    // Aplica somente os campos presentes no JSON recebido
    if (input.TryGetProperty("enviarEmailAutomatico", out var envAtas))
      atual.EnviarEmailAutomatico = envAtas.GetBoolean();

    if (input.TryGetProperty("enviarEmailAutomaticoPautas", out var envPautas))
      atual.EnviarEmailAutomaticoPautas = envPautas.GetBoolean();

    if (input.TryGetProperty("webhookN8nReceberAtas", out var wReceber) &&
        wReceber.ValueKind != JsonValueKind.Null)
      atual.WebhookN8nReceberAtas = wReceber.GetString();

    if (input.TryGetProperty("webhookN8nEnviarAtas", out var wEnviar) &&
        wEnviar.ValueKind != JsonValueKind.Null)
      atual.WebhookN8nEnviarAtas = wEnviar.GetString();

    if (input.TryGetProperty("emailRemetente", out var emailRem) &&
        emailRem.ValueKind != JsonValueKind.Null)
      atual.EmailRemetente = emailRem.GetString();

    if (input.TryGetProperty("nomeRemetente", out var nomeRem) &&
        nomeRem.ValueKind != JsonValueKind.Null)
      atual.NomeRemetente = nomeRem.GetString();

    var atualizado = await repository.AtualizarAsync(atual);
    return Ok(atualizado);
  }
}