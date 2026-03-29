using Amazon.S3;
using Amazon.S3.Model;
using Governanca.Application.Interfaces;
using Governanca.Application.Services;
using Governanca.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Governanca.Api.Controllers;

[ApiController]
[Route("api/processamentos")]
public class ProcessamentosController(IProcessamentoRepository repository, IConfiguracaoRepository configuracaoRepository, IStorageService storage, IAmazonS3 s3Client, IConfiguration configuration, IHttpClientFactory httpClientFactory) : ControllerBase
{
    private readonly string _bucket = configuration["Minio:Bucket"] ?? "governanca-upload";

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

    /// <summary>
    /// Proxy de upload: recebe o arquivo via multipart/form-data e envia diretamente ao MinIO.
    /// Após salvar, dispara o webhook N8N configurado para iniciar o processamento de transcrição.
    /// </summary>
    [HttpPost("upload")]
    [RequestSizeLimit(500 * 1024 * 1024)] // 500 MB
    [RequestFormLimits(MultipartBodyLengthLimit = 500 * 1024 * 1024)]
    public async Task<IActionResult> UploadProxy(
      [FromForm] IFormFile arquivo,
      [FromForm] string? reuniaoId,
      [FromForm] string? pautaId,
      [FromForm] string? participantesJson,
      [FromForm] string? assinaturasJson,
      [FromForm] string? tarefasMarcadasJson)
    {
        if (arquivo is null || arquivo.Length == 0)
            return BadRequest(new { message = "Arquivo obrigatório." });

        var ext = Path.GetExtension(arquivo.FileName);
        var objectKey = $"gravacoes/{Guid.NewGuid()}{ext}";
        var contentType = arquivo.ContentType ?? InferirContentType(ext);

        // ── Enviar arquivo ao MinIO via SDK (sem CORS) ────────────────────────────
        await storage.GarantirBucketAsync();

        using var stream = arquivo.OpenReadStream();
        var putRequest = new PutObjectRequest
        {
            BucketName = _bucket,
            Key = objectKey,
            InputStream = stream,
            ContentType = contentType,
            AutoCloseStream = false,
        };

        await s3Client.PutObjectAsync(putRequest);

        // ── Deserializar metadados ────────────────────────────────────────────────
        var participantes = DeserializarLista<string>(participantesJson) ?? [];
        var assinaturas = DeserializarLista<AssinaturaProcessamento>(assinaturasJson) ?? [];
        var tarefasMarcadas = DeserializarLista<Guid>(tarefasMarcadasJson) ?? [];

        Guid? reuniaoGuid = Guid.TryParse(reuniaoId, out var rg) ? rg : null;
        Guid? pautaGuid = Guid.TryParse(pautaId, out var pg) ? pg : null;

        // ── Registrar processamento no banco ──────────────────────────────────────
        var processamento = new ProcessamentoGravacao
        {
            ReuniaoId = reuniaoGuid,
            PautaId = pautaGuid,
            NomeArquivo = arquivo.FileName,
            ObjectKey = objectKey,
            Status = "aguardando",
            EtapaAtual = "Arquivo recebido. Aguardando processamento.",
            Progresso = 0,
            Participantes = participantes,
            Assinaturas = assinaturas,
            TarefasMarcadas = tarefasMarcadas,
        };

        var criado = await repository.CriarAsync(processamento);

        // ── Disparar webhook N8N (fire-and-forget, não bloqueia a resposta) ───────
        _ = DispararWebhookN8nAsync(criado, objectKey);

        return CreatedAtAction(nameof(GetById), new { id = criado.Id }, criado);
    }

    /// <summary>
    /// Gera uma Presigned URL para o frontend fazer upload direto ao MinIO.
    /// Requer que o CORS esteja configurado no MinIO para o domínio do frontend.
    /// </summary>
    [HttpGet("upload-url")]
    public async Task<IActionResult> GerarUrlUpload(
      [FromQuery] string nomeArquivo,
      [FromQuery] string? contentType)
    {
        if (string.IsNullOrWhiteSpace(nomeArquivo))
            return BadRequest(new { message = "nomeArquivo é obrigatório." });

        var ext = Path.GetExtension(nomeArquivo);
        var objectKey = $"gravacoes/{Guid.NewGuid()}{ext}";
        var mime = contentType ?? InferirContentType(ext);

        var uploadUrl = await storage.GerarUrlUploadAsync(objectKey, mime, expiresInMinutes: 30);

        return Ok(new
        {
            uploadUrl,
            objectKey,
            bucket = _bucket,
            expiresInMinutes = 30
        });
    }

    /// <summary>
    /// Gera uma Presigned URL para download/visualização de um objeto já armazenado.
    /// </summary>
    [HttpGet("{id:guid}/download-url")]
    public async Task<IActionResult> GerarUrlDownload(Guid id)
    {
        var item = await repository.ObterPorIdAsync(id);
        if (item is null) return NotFound();
        if (string.IsNullOrEmpty(item.ObjectKey))
            return BadRequest(new { message = "Este processamento não possui arquivo armazenado." });

        var downloadUrl = await storage.GerarUrlDownloadAsync(item.ObjectKey, expiresInMinutes: 60);
        return Ok(new { downloadUrl, objectKey = item.ObjectKey });
    }

    /// <summary>
    /// Registra o processamento após o frontend ter feito o upload direto ao MinIO via Presigned URL.
    /// Também dispara o webhook N8N configurado.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CriarProcessamentoRequest input)
    {
        var processamento = new ProcessamentoGravacao
        {
            ReuniaoId = input.ReuniaoId,
            PautaId = input.PautaId,
            NomeArquivo = input.NomeArquivo ?? "gravacao",
            ObjectKey = input.ObjectKey,
            Status = "aguardando",
            EtapaAtual = "Arquivo recebido no storage. Aguardando processamento.",
            Progresso = 0,
            Participantes = input.Participantes ?? [],
            Assinaturas = input.Assinaturas ?? [],
            TarefasMarcadas = input.TarefasMarcadas ?? [],
        };

        var criado = await repository.CriarAsync(processamento);

        // ── Disparar webhook N8N (fire-and-forget) ────────────────────────────────
        _ = DispararWebhookN8nAsync(criado, input.ObjectKey);

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
        var item = await repository.ObterPorIdAsync(id);
        if (item is null) return NotFound();

        if (!string.IsNullOrEmpty(item.ObjectKey))
        {
            try { await storage.ExcluirAsync(item.ObjectKey); }
            catch { /* ignora erro de remoção no storage */ }
        }

        var removido = await repository.ExcluirAsync(id);
        if (!removido) return NotFound();
        return NoContent();
    }

    // ─── Webhook N8N ─────────────────────────────────────────────────────────────

    /// <summary>
    /// Dispara o webhook N8N de forma assíncrona (fire-and-forget).
    /// Erros são apenas logados e não afetam a resposta ao cliente.
    /// </summary>
    private async Task DispararWebhookN8nAsync(ProcessamentoGravacao processamento, string? objectKey)
    {
        try
        {
            var cfg = await configuracaoRepository.ObterAsync();
            var webhookUrl = cfg.WebhookN8nReceberAtas;

            if (string.IsNullOrWhiteSpace(webhookUrl))
            {
                Console.WriteLine("[N8N] Webhook não configurado. Pulando disparo.");
                return;
            }

            var minioEndpoint = configuration["Minio:Endpoint"] ?? "http://localhost:8000";
            var bucket = _bucket;

            var payload = new
            {
                processamentoId = processamento.Id,
                reuniaoId = processamento.ReuniaoId,
                pautaId = processamento.PautaId,
                nomeArquivo = processamento.NomeArquivo,
                objectKey = objectKey,
                bucket = bucket,
                minioEndpoint = minioEndpoint,
                participantes = processamento.Participantes,
                criadoEm = processamento.CreatedAt,
                callbackUrl = $"{Request.Scheme}://{Request.Host}/api/processamentos/{processamento.Id}",
            };

            var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            var httpClient = httpClientFactory.CreateClient("N8N");
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync(webhookUrl, content);

            if (response.IsSuccessStatusCode)
                Console.WriteLine($"[N8N] Webhook disparado com sucesso para processamento {processamento.Id}");
            else
                Console.WriteLine($"[N8N] Webhook retornou status {(int)response.StatusCode} para processamento {processamento.Id}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[N8N] Erro ao disparar webhook: {ex.Message}");
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private static List<T>? DeserializarLista<T>(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try { return JsonSerializer.Deserialize<List<T>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }); }
        catch { return null; }
    }

    private static string InferirContentType(string ext) => ext.ToLowerInvariant() switch
    {
        ".mp3" => "audio/mpeg",
        ".mp4" => "audio/mp4",
        ".m4a" => "audio/mp4",
        ".wav" => "audio/wav",
        ".ogg" => "audio/ogg",
        ".webm" => "audio/webm",
        ".aac" => "audio/aac",
        _ => "application/octet-stream"
    };
}

public class CriarProcessamentoRequest
{
    public Guid? ReuniaoId { get; set; }
    public Guid? PautaId { get; set; }
    public string? NomeArquivo { get; set; }
    public string? ObjectKey { get; set; }
    public List<string>? Participantes { get; set; }
    public List<AssinaturaProcessamento>? Assinaturas { get; set; }
    public List<Guid>? TarefasMarcadas { get; set; }
}
