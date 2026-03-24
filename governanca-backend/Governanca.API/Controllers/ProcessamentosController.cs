using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Governanca.Api.Controllers;

[ApiController]
[Route("api/processamentos")]
public class ProcessamentosController(IProcessamentoRepository repository) : ControllerBase
{
  [HttpGet]
  public async Task<IActionResult> Get([FromQuery] Guid? reuniaoId)
  {
    var itens = await repository.ListarAsync(reuniaoId);
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
  public async Task<IActionResult> Post([FromBody] ProcessamentoGravacao input)
  {
    var criado = await repository.CriarAsync(input);
    return CreatedAtAction(nameof(GetById), new { id = criado.Id }, criado);
  }

  [HttpPut("{id:guid}")]
  public async Task<IActionResult> Put(Guid id, [FromBody] ProcessamentoGravacao input)
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
}
