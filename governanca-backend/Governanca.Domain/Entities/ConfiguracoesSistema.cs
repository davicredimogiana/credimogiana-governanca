namespace Governanca.Domain.Entities;

public class ConfiguracoesSistema
{
  public bool EnviarEmailAutomatico { get; set; }
  public bool EnviarEmailAutomaticoPautas { get; set; }
}

public class ConfiguracaoChaveValor
{
  public string Chave { get; set; } = string.Empty;
  public object? Valor { get; set; }
}
