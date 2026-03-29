using Amazon.S3;
using Amazon.S3.Model;
using Governanca.Application.Services;
using Microsoft.Extensions.Configuration;

namespace Governanca.Infrastructure.Services;

public class MinioStorageService(IAmazonS3 s3Internal, IPublicS3Client publicS3Client, IConfiguration configuration) : IStorageService
{
  private readonly IAmazonS3 _s3Public = publicS3Client.Client;
  private readonly string _bucket = configuration["Minio:Bucket"] ?? "governanca-upload";

  public async Task GarantirBucketAsync()
  {
    try
    {
      await s3Internal.EnsureBucketExistsAsync(_bucket);
    }
    catch (Exception ex)
    {
      Console.WriteLine($"[MinIO] Aviso ao garantir bucket '{_bucket}': {ex.Message}");
    }
  }

  public async Task<string> GerarUrlUploadAsync(string objectKey, string contentType, int expiresInMinutes = 30)
  {
    var request = new GetPreSignedUrlRequest
    {
      BucketName = _bucket,
      Key = objectKey,
      Verb = HttpVerb.PUT,
      ContentType = contentType,
      Expires = DateTime.UtcNow.AddMinutes(expiresInMinutes)
    };

    return await _s3Public.GetPreSignedURLAsync(request);
  }

  public async Task<string> GerarUrlDownloadAsync(string objectKey, int expiresInMinutes = 60)
  {
    var request = new GetPreSignedUrlRequest
    {
      BucketName = _bucket,
      Key = objectKey,
      Verb = HttpVerb.GET,
      Expires = DateTime.UtcNow.AddMinutes(expiresInMinutes)
    };

    return await _s3Public.GetPreSignedURLAsync(request);
  }

  public async Task ExcluirAsync(string objectKey)
  {
    await s3Internal.DeleteObjectAsync(_bucket, objectKey);
  }
}