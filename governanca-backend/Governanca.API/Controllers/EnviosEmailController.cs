using Governanca.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Governanca.Api.Controllers;

[ApiController]
[Route("api/envios-email")]
public class EnviosEmailController(IEnvioEmailRepository repository) : ControllerBase
{
  [HttpGet]
  public async Task<IActionResult> Get()
  {
    var itens = await repository.ListarAsync();
    return Ok(itens);
  }
}
