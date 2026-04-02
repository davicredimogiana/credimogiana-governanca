using Governanca.API.Contracts;
using Governanca.Application.Commands;
using Governanca.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Governanca.Api.Controllers;

[ApiController]
[Route("api/n8n")]
public class N8NCallbackController(IN8NAtaCallbackService service) : ControllerBase
{
    [HttpPost("atas/callback")]
    public async Task<IActionResult> ReceberAta([FromBody] N8NAtaCallbackRequest request)
    {
        var command = new ProcessarAtaN8NCommand
        {
            ProcessamentoId = Guid.TryParse(request.Titulo, out var processamentoId)
                ? processamentoId
                : null,

            Resumo = request.Resumo,
            AtaMarkdown = request.AtaMarkdown,
            LinkDrive = request.LinkDrive,
            LinkAuditoria = request.LinkAuditoria,
            TomGeral = request.TomGeral,
            Urgencia = request.Urgencia,
            TotalDecisoes = request.TotalDecisoes,
            TotalAcoes = request.TotalAcoes,
            TotalRiscos = request.TotalRiscos,
            TotalOportunidades = request.TotalOportunidades,

            Decisoes = request.Decisoes?.Select(x => new ProcessarAtaN8NDecisaoCommand
            {                                                        
                Descricao = x.Descricao,
                Responsavel = x.Responsavel,
                Prazo = x.Prazo
            }).ToList() ?? [],

            Acoes = request.Acoes?.Select(x => new ProcessarAtaN8NAcaoCommand
            {
                Descricao = x.Descricao,
                Responsavel = x.Responsavel,
                Prazo = x.Prazo
            }).ToList() ?? [],

            Riscos = request.Riscos?.Select(x => new ProcessarAtaN8NRiscoCommand
            {
                Descricao = x.Descricao,
                Severidade = x.Severidade,
                Mencoes = x.Mencoes
            }).ToList() ?? [],

            Oportunidades = request.Oportunidades?.Select(x => new ProcessarAtaN8NOportunidadeCommand
            {
                Descricao = x.Descricao,
                Potencial = x.Potencial,
                Mencoes = x.Mencoes
            }).ToList() ?? []
        };

        var result = await service.ProcessarAsync(command);
        return Ok(result);
    }
}