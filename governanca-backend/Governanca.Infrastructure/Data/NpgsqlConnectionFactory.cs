using System.Data;
using Governanca.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Governanca.Infrastructure.Data;

public class NpgsqlConnectionFactory(IConfiguration configuration) : IDbConnectionFactory
{
  private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection");

  public async Task<IDbConnection> CreateConnectionAsync()
  {
    var connection = new NpgsqlConnection(_connectionString);
    await connection.OpenAsync();
    return connection;
  }
}