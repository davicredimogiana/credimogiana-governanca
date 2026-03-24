using Governanca.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Governanca.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController(IDashboardRepository repository) : ControllerBase
{
  [HttpGet("resumo")]
  public async Task<IActionResult> ObterResumo()
  {
    var dados = await repository.ObterResumoAsync();
    return Ok(dados);
  }
}