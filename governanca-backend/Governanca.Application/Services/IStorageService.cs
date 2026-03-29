namespace Governanca.Application.Services;

/// <summary>
/// Serviço de armazenamento de arquivos (MinIO / S3-compatible).
/// </summary>
public interface IStorageService
{
  /// <summary>
  /// Gera uma Presigned URL para upload direto pelo cliente (PUT).
  /// </summary>
  /// <param name="objectKey">Caminho/nome do objeto no bucket (ex: "gravacoes/uuid.m4a")</param>
  /// <param name="contentType">MIME type do arquivo (ex: "audio/mp4")</param>
  /// <param name="expiresInMinutes">Tempo de validade da URL em minutos (padrão: 15)</param>
  Task<string> GerarUrlUploadAsync(string objectKey, string contentType, int expiresInMinutes = 15);

  /// <summary>
  /// Gera uma Presigned URL para download/visualização do objeto.
  /// </summary>
  Task<string> GerarUrlDownloadAsync(string objectKey, int expiresInMinutes = 60);

  /// <summary>
  /// Garante que o bucket existe, criando-o se necessário.
  /// </summary>
  Task GarantirBucketAsync();

  /// <summary>
  /// Exclui um objeto do bucket.
  /// </summary>
  Task ExcluirAsync(string objectKey);
}
