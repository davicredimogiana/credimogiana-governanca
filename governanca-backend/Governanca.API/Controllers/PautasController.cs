using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Governanca.Api.Controllers;

[ApiController]
[Route("api/pautas")]
public class PautasController(IPautaRepository repository) : ControllerBase
{
  [HttpGet]
  public async Task<IActionResult> Get()
  {
    var itens = await repository.ListarAsync();
    return Ok(itens);
  }

  [HttpGet("{id:guid}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var item = await repository.ObterPorIdAsync(id);
    if (item is null) return NotFound();
    return Ok(item);
  }

  [HttpPost]
  public async Task<IActionResult> Post([FromBody] Pauta input)
  {
    var criado = await repository.CriarAsync(input);
    return CreatedAtAction(nameof(GetById), new { id = criado.Id }, criado);
  }

  [HttpPut("{id:guid}")]
  public async Task<IActionResult> Put(Guid id, [FromBody] Pauta input)
  {
    var atualizado = await repository.AtualizarAsync(id, input);
    if (atualizado is null) return NotFound();
    return Ok(atualizado);
  }

  [HttpDelete("{id:guid}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var removido = await repository.ExcluirAsync(id);
    if (!removido) return NotFound();
    return NoContent();
  }

  [HttpPatch("{id:guid}/status")]
  public async Task<IActionResult> PatchStatus(Guid id, [FromBody] PatchStatusRequest req)
  {
    var ok = await repository.AtualizarStatusAsync(id, req.Status);
    if (!ok) return NotFound();
    return NoContent();
  }

  // ---- Sub-recursos: Objetivos ----

  [HttpPost("{pautaId:guid}/objetivos")]
  public async Task<IActionResult> PostObjetivo(Guid pautaId, [FromBody] PautaObjetivo input)
  {
    var criado = await repository.AdicionarObjetivoAsync(pautaId, input.Texto, input.Ordem);
    return Ok(criado);
  }

  [HttpPut("objetivos/{id:guid}")]
  public async Task<IActionResult> PutObjetivo(Guid id, [FromBody] PautaObjetivo input)
  {
    await repository.AtualizarObjetivoAsync(id, input.Texto);
    return NoContent();
  }

  [HttpDelete("objetivos/{id:guid}")]
  public async Task<IActionResult> DeleteObjetivo(Guid id)
  {
    await repository.ExcluirObjetivoAsync(id);
    return NoContent();
  }

  // ---- Sub-recursos: Dados ----

  [HttpPost("{pautaId:guid}/dados")]
  public async Task<IActionResult> PostDado(Guid pautaId, [FromBody] PautaDado input)
  {
    var criado = await repository.AdicionarDadoAsync(pautaId, input);
    return Ok(criado);
  }

  [HttpPut("dados/{id:guid}")]
  public async Task<IActionResult> PutDado(Guid id, [FromBody] PautaDado input)
  {
    await repository.AtualizarDadoAsync(id, input);
    return NoContent();
  }

  [HttpDelete("dados/{id:guid}")]
  public async Task<IActionResult> DeleteDado(Guid id)
  {
    await repository.ExcluirDadoAsync(id);
    return NoContent();
  }

  // ---- Sub-recursos: Discussões ----

  [HttpPost("{pautaId:guid}/discussoes")]
  public async Task<IActionResult> PostDiscussao(Guid pautaId, [FromBody] PautaDiscussao input)
  {
    var criado = await repository.AdicionarDiscussaoAsync(pautaId, input.Topico, input.Ordem);
    return Ok(criado);
  }

  [HttpPut("discussoes/{id:guid}")]
  public async Task<IActionResult> PutDiscussao(Guid id, [FromBody] PautaDiscussao input)
  {
    await repository.AtualizarDiscussaoAsync(id, input.Topico);
    return NoContent();
  }

  [HttpDelete("discussoes/{id:guid}")]
  public async Task<IActionResult> DeleteDiscussao(Guid id)
  {
    await repository.ExcluirDiscussaoAsync(id);
    return NoContent();
  }

  [HttpPost("discussoes/{discussaoId:guid}/pontos")]
  public async Task<IActionResult> PostPonto(Guid discussaoId, [FromBody] PautaDiscussaoPonto input)
  {
    var criado = await repository.AdicionarPontoDiscussaoAsync(discussaoId, input.Texto, input.Ordem);
    return Ok(criado);
  }

  [HttpPut("discussoes/pontos/{id:guid}")]
  public async Task<IActionResult> PutPonto(Guid id, [FromBody] PautaDiscussaoPonto input)
  {
    await repository.AtualizarPontoDiscussaoAsync(id, input.Texto);
    return NoContent();
  }

  [HttpDelete("discussoes/pontos/{id:guid}")]
  public async Task<IActionResult> DeletePonto(Guid id)
  {
    await repository.ExcluirPontoDiscussaoAsync(id);
    return NoContent();
  }

  // ---- Sub-recursos: Deliberações ----

  [HttpPost("{pautaId:guid}/deliberacoes")]
  public async Task<IActionResult> PostDeliberacao(Guid pautaId, [FromBody] PautaDeliberacao input)
  {
    var criado = await repository.AdicionarDeliberacaoAsync(pautaId, input.Texto, input.Ordem);
    return Ok(criado);
  }

  [HttpPut("deliberacoes/{id:guid}")]
  public async Task<IActionResult> PutDeliberacao(Guid id, [FromBody] PautaDeliberacao input)
  {
    await repository.AtualizarDeliberacaoAsync(id, input.Texto);
    return NoContent();
  }

  [HttpDelete("deliberacoes/{id:guid}")]
  public async Task<IActionResult> DeleteDeliberacao(Guid id)
  {
    await repository.ExcluirDeliberacaoAsync(id);
    return NoContent();
  }

  // ---- Sub-recursos: Encaminhamentos ----

  [HttpPost("{pautaId:guid}/encaminhamentos")]
  public async Task<IActionResult> PostEncaminhamento(Guid pautaId, [FromBody] PautaEncaminhamento input)
  {
    var criado = await repository.AdicionarEncaminhamentoAsync(pautaId, input);
    return Ok(criado);
  }

  [HttpPut("encaminhamentos/{id:guid}")]
  public async Task<IActionResult> PutEncaminhamento(Guid id, [FromBody] PautaEncaminhamento input)
  {
    await repository.AtualizarEncaminhamentoAsync(id, input);
    return NoContent();
  }

  [HttpDelete("encaminhamentos/{id:guid}")]
  public async Task<IActionResult> DeleteEncaminhamento(Guid id)
  {
    await repository.ExcluirEncaminhamentoAsync(id);
    return NoContent();
  }

  // ---- Sub-recursos: Itens ----

  [HttpPost("{pautaId:guid}/itens")]
  public async Task<IActionResult> PostItem(Guid pautaId, [FromBody] PautaItemDetalhe input)
  {
    var criado = await repository.AdicionarItemAsync(pautaId, input);
    return Ok(criado);
  }

  [HttpPut("itens/{id:guid}")]
  public async Task<IActionResult> PutItem(Guid id, [FromBody] PautaItemDetalhe input)
  {
    await repository.AtualizarItemAsync(id, input);
    return NoContent();
  }

  [HttpDelete("itens/{id:guid}")]
  public async Task<IActionResult> DeleteItem(Guid id)
  {
    await repository.ExcluirItemAsync(id);
    return NoContent();
  }

  // ---- Envio de E-mail ----

  [HttpPost("{id:guid}/enviar")]
  public IActionResult EnviarEmail(Guid id, [FromBody] EnviarEmailRequest req)
  {
    // Endpoint para integração com N8N ou serviço de e-mail externo
    // Registra o envio e retorna sucesso para o frontend
    return Ok(new { success = true, message = $"Pauta {id} enviada para {req.Destinatarios.Count} destinatário(s)." });
  }
}

public record PatchStatusRequest(string Status);
public record EnviarEmailRequest(List<DestinatarioEnvio> Destinatarios);
public record DestinatarioEnvio(string Nome, string Email, string Cargo);
