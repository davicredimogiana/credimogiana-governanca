using System.Text.RegularExpressions;
using Governanca.Application.Commands;
using Governanca.Application.Interfaces;
using Governanca.Domain.Entities;

namespace Governanca.Application.Services;

public class N8NAtaCallbackService(IAtaWriteRepository ataWriteRepository, IProcessamentoRepository processamentoRepository, IConfiguracaoRepository configuracaoRepository) : IN8NAtaCallbackService
{
    private static readonly string[] InvalidResumoPatterns =
    [
        "Parece que",
        "transcrição fornecida",
        "não contém informações",
        "não forneceu detalhes",
        "não foi possível",
        "está incompleta",
        "forneça os detalhes",
        "forneça informações",
        "não há informações suficientes",
        "não consegui identificar",
        "não é possível gerar",
        "não possui informações"
    ];

    public async Task<object> ProcessarAsync(ProcessarAtaN8NCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.AtaMarkdown) &&
            string.IsNullOrWhiteSpace(command.Resumo))
        {
            throw new InvalidOperationException("É necessário enviar ata_markdown ou resumo.");
        }

        var markdown = command.AtaMarkdown ?? string.Empty;
        var resumoFinal = command.Resumo ?? string.Empty;

        if (ResumoInvalido(resumoFinal))
        {
            var extraido = ExtrairResumoDoMarkdown(markdown);
            resumoFinal = string.IsNullOrWhiteSpace(extraido) ? string.Empty : extraido;
        }

        var processamentoId = command.ProcessamentoId;

        Guid? reuniaoId = null;

        if (command.ProcessamentoId.HasValue)
        {
            var proc = await processamentoRepository.ObterPorIdAsync(command.ProcessamentoId.Value);

            if (proc is not null)
            {
                reuniaoId = proc.ReuniaoId;
            }
        }
        var ataId = await ataWriteRepository.CriarAtaCompletaAsync(new CriarAtaCompletaCommand
        {
            ProcessamentoId = reuniaoId,
            ConteudoMarkdown = !string.IsNullOrWhiteSpace(markdown) ? markdown : resumoFinal,
            ResumoExecutivo = resumoFinal,
            LinkDrive = command.LinkDrive,
            LinkAuditoria = command.LinkAuditoria,
            TomGeral = string.IsNullOrWhiteSpace(command.TomGeral) ? "neutro" : command.TomGeral,
            Urgencia = string.IsNullOrWhiteSpace(command.Urgencia) ? "media" : command.Urgencia,
            TotalDecisoes = command.TotalDecisoes,
            TotalAcoes = command.TotalAcoes,
            TotalRiscos = command.TotalRiscos,
            TotalOportunidades = command.TotalOportunidades,
            Decisoes = command.Decisoes?.Select(x => new DecisaoIA
            {
                Descricao = x.Descricao,
                Responsavel = x.Responsavel,
                Prazo = x.Prazo,
                Status = "pendente"
            }).ToList() ?? [],
            Acoes = command.Acoes?.Select(x => new AcaoIA
            {
                Descricao = x.Descricao,
                Responsavel = x.Responsavel,
                Prazo = x.Prazo,
                Status = "pendente"
            }).ToList() ?? [],
            Riscos = command.Riscos?.Select(x => new RiscoIA
            {
                Descricao = x.Descricao,
                Severidade = x.Severidade ?? "media",
                Mencoes = x.Mencoes ?? 0
            }).ToList() ?? [],
            Oportunidades = command.Oportunidades?.Select(x => new OportunidadeIA
            {
                Descricao = x.Descricao,
                Potencial = x.Potencial ?? "medio",
                Mencoes = x.Mencoes ?? 0
            }).ToList() ?? []
        });

        if (processamentoId.HasValue)
        {
            var proc = await processamentoRepository.ObterPorIdAsync(processamentoId.Value);
            if (proc is not null)
            {
                proc.Status = "concluido";
                proc.Progresso = 100;
                proc.EtapaAtual = "Processamento concluído com sucesso!";
                await processamentoRepository.AtualizarAsync(proc.Id, proc);
            }
        }

        return new
        {
            success = true,
            message = "Ata recebida e processada com sucesso",
            ataId
        };
    }

    private static bool ResumoInvalido(string? resumo)
    {
        if (string.IsNullOrWhiteSpace(resumo) || resumo.Trim().Length < 30) return true;
        var lower = resumo.ToLowerInvariant();
        return InvalidResumoPatterns.Any(p => lower.Contains(p, StringComparison.InvariantCultureIgnoreCase));
    }

    private static string ExtrairResumoDoMarkdown(string markdown)
    {
        if (string.IsNullOrWhiteSpace(markdown)) return string.Empty;

        var visaoGeral = Regex.Match(
            markdown,
            @"## 1\. VIS[ÃA]O GERAL E CONTEXTO[\s\S]*?\n\n([\s\S]*?)(?=\n---|\n## \d|$)",
            RegexOptions.IgnoreCase);

        if (visaoGeral.Success && visaoGeral.Groups[1].Value.Trim().Length > 50)
            return visaoGeral.Groups[1].Value.Trim();

        var resumo = Regex.Match(
            markdown,
            @"## (?:\d+\.\s*)?RESUMO[\s\S]*?\n\n([\s\S]*?)(?=\n---|\n## \d|$)",
            RegexOptions.IgnoreCase);

        if (resumo.Success && resumo.Groups[1].Value.Trim().Length > 50)
            return resumo.Groups[1].Value.Trim();

        var primeiros = Regex.Match(
            markdown,
            @"^#[^\n]+\n\n([\s\S]{100,1500}?)(?=\n\n|\n##|\n---)",
            RegexOptions.Multiline);

        return primeiros.Success ? primeiros.Groups[1].Value.Trim() : string.Empty;
    }
}