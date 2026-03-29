namespace Governanca.Domain.Entities;

public class ConfiguracoesSistema
{
  // Notificações por e-mail
  public bool EnviarEmailAutomatico { get; set; }
  public bool EnviarEmailAutomaticoPautas { get; set; }

  // Integração N8N
  public string? WebhookN8nReceberAtas { get; set; }
  public string? WebhookN8nEnviarAtas { get; set; }

  // Configurações de e-mail
  public string? EmailRemetente { get; set; }
  public string? NomeRemetente { get; set; }
}

public class ConfiguracaoChaveValor
{
  public string Chave { get; set; } = string.Empty;
  public object? Valor { get; set; }
}
