using Governanca.Application.Interfaces;
using Governanca.Infrastructure.Data;
using Governanca.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
  .AddJsonOptions(options =>
  {
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
  });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseAuthorization();
app.MapControllers();
app.Run();