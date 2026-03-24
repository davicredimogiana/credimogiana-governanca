using System.Data;

namespace Governanca.Application.Interfaces;

public interface IDbConnectionFactory
{
  Task<IDbConnection> CreateConnectionAsync();
}