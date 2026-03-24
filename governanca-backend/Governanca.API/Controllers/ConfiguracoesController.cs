using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Governanca.Api.Controllers;

[ApiController]
[Route("api/configuracoes")]
public class ConfiguracoesController : ControllerBase
{
  private readonly IConfiguracaoRepository _repository;

  public ConfiguracoesController(IConfiguracaoRepository repository)
  {
    _repository = repository;
  }

  [HttpGet]
  public async Task<IActionResult> Get()
  {
    var dados = await _repository.ObterAsync();
    return Ok(dados);
  }

  [HttpPut]
  public async Task<IActionResult> Put([FromBody] ConfiguracoesSistema input)
  {
    var atualizado = await _repository.AtualizarAsync(input);
    return Ok(atualizado);
  }
}