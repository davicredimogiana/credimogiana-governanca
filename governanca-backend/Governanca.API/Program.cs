using Amazon.Runtime;
using Amazon.S3;
using Governanca.API.Workers;
using Governanca.Application.Interfaces;
using Governanca.Application.Services;
using Governanca.Infrastructure.Data;
using Governanca.Infrastructure.Repositories;
using Governanca.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Limite de upload (500 MB) ───────────────────────────────────────────────
builder.WebHost.ConfigureKestrel(options =>
{
  options.Limits.MaxRequestBodySize = 524_288_000;
});

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
  options.MultipartBodyLengthLimit = 524_288_000;
  options.ValueLengthLimit = int.MaxValue;
  options.MultipartHeadersLengthLimit = int.MaxValue;
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
      options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ─── Banco de dados ───────────────────────────────────────────────────────────
builder.Services.AddScoped<IDbConnectionFactory, NpgsqlConnectionFactory>();
builder.Services.AddScoped<IMembroRepository, MembroRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<IReuniaoRepository, ReuniaoRepository>();
builder.Services.AddScoped<IAtaRepository, AtaRepository>();
builder.Services.AddScoped<IConfiguracaoRepository, ConfiguracaoRepository>();
builder.Services.AddScoped<IDestinatarioRepository, DestinatarioRepository>();
builder.Services.AddScoped<ITarefaRepository, TarefaRepository>();
builder.Services.AddScoped<IPautaRepository, PautaRepository>();
builder.Services.AddScoped<IProcessamentoRepository, ProcessamentoRepository>();
builder.Services.AddScoped<IEnvioEmailRepository, EnvioEmailRepository>();
builder.Services.AddScoped<IWebhookOutboxRepository, WebhookOutboxRepository>();

// ─── MinIO (S3-compatible) ────────────────────────────────────────────────────
var minioInternalEndpoint = builder.Configuration["Minio:Endpoint"] ?? "http://minio:9000";
var minioPublicEndpoint = builder.Configuration["Minio:PublicEndpoint"] ?? "https://s3.governanca.mogiana.io";
var minioAccessKey = builder.Configuration["Minio:AccessKey"] ?? "minio";
var minioSecretKey = builder.Configuration["Minio:SecretKey"] ?? "minio123";

// Cliente interno: usado para bucket/create/delete/etc
builder.Services.AddSingleton<IAmazonS3>(sp =>
{
  var config = new AmazonS3Config
  {
    ServiceURL = minioInternalEndpoint,
    ForcePathStyle = true,
    UseHttp = minioInternalEndpoint.StartsWith("http://", StringComparison.OrdinalIgnoreCase),
    AuthenticationRegion = "us-east-1"
  };

  return new AmazonS3Client(
      new BasicAWSCredentials(minioAccessKey, minioSecretKey),
      config
  );
});

// Cliente público: usado só para gerar presigned URL para o browser
builder.Services.AddSingleton<IPublicS3Client>(sp =>
{
  var config = new AmazonS3Config
  {
    ServiceURL = minioPublicEndpoint,
    ForcePathStyle = true,
    UseHttp = minioPublicEndpoint.StartsWith("http://", StringComparison.OrdinalIgnoreCase),
    AuthenticationRegion = "us-east-1"
  };

  var client = new AmazonS3Client(
    new BasicAWSCredentials(minioAccessKey, minioSecretKey),
    config
  );

  return new PublicS3Client(client);
});

builder.Services.AddScoped<IStorageService, MinioStorageService>();

// ─── HTTP Client (para webhooks N8N) ─────────────────────────────────────────
builder.Services.AddHttpClient("N8N", client =>
{
  client.Timeout = TimeSpan.FromSeconds(30);
});

// ─── Worker: despacho confiável para o N8N (Outbox Pattern) ──────────────────
builder.Services.AddHostedService<N8nDispatcherWorker>();

// ─── CORS ─────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
  options.AddPolicy("Frontend", policy =>
  {
    policy
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod();
  });
});

var app = builder.Build();

// Garantir que o bucket existe na inicialização
using (var scope = app.Services.CreateScope())
{
  var storage = scope.ServiceProvider.GetRequiredService<IStorageService>();
  try
  {
    await storage.GarantirBucketAsync();
  }
  catch (Exception ex)
  {
    Console.WriteLine($"[MinIO] Não foi possível verificar o bucket: {ex.Message}");
  }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("Frontend");
app.UseAuthorization();
app.MapControllers();
app.Run();

