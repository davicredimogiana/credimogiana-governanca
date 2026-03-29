using Governanca.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Governanca.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController(IDashboardRepository repository) : ControllerBase
{
  // Responde tanto em GET /api/dashboard quanto em GET /api/dashboard/resumo
  [HttpGet]
  [HttpGet("resumo")]
  public async Task<IActionResult> ObterResumo()
  {
    var dados = await repository.ObterResumoAsync();
    return Ok(dados);
  }
}