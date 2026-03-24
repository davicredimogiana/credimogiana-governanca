using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Governanca.Api.Controllers;

[ApiController]
[Route("api/destinatarios")]
public class DestinatariosController(IDestinatarioRepository repository) : ControllerBase
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
  public async Task<IActionResult> Post([FromBody] DestinatarioEmail input)
  {
    var criado = await repository.CriarAsync(input);
    return CreatedAtAction(nameof(GetById), new { id = criado.Id }, criado);
  }

  [HttpPut("{id:guid}")]
  public async Task<IActionResult> Put(Guid id, [FromBody] DestinatarioEmail input)
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

  [HttpPost("lote")]
  public async Task<IActionResult> ImportarLote([FromBody] List<DestinatarioEmail> destinatarios)
  {
    var count = await repository.ImportarLoteAsync(destinatarios);
    return Ok(new { importados = count });
  }
}
