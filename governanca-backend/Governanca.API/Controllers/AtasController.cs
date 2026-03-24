using Governanca.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Governanca.Api.Controllers;

[ApiController]
[Route("api/atas")]
public class AtasController(IAtaRepository repository) : ControllerBase
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
    if (item is null)
      return NotFound();

    return Ok(item);
  }

  [HttpDelete("{id:guid}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var removido = await repository.ExcluirAsync(id);
    if (!removido) return NotFound();
    return NoContent();
  }

  [HttpPost("{id:guid}/enviar")]
  public IActionResult EnviarEmail(Guid id, [FromBody] EnviarAtaEmailRequest req)
  {
    // Endpoint para integração com N8N ou serviço de e-mail externo
    return Ok(new { success = true, message = $"Ata {id} enviada para {req.Destinatarios.Count} destinatário(s)." });
  }
}

public record EnviarAtaEmailRequest(List<DestinatarioAtaEnvio> Destinatarios);
public record DestinatarioAtaEnvio(string Nome, string Email, string Cargo);