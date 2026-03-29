using Amazon.S3;

namespace Governanca.Infrastructure.Services;

public interface IPublicS3Client
{
  IAmazonS3 Client { get; }
}

public sealed class PublicS3Client(IAmazonS3 client) : IPublicS3Client
{
  public IAmazonS3 Client { get; } = client;
}