import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Mail, Webhook, Shield, Zap, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";

const Configuracoes = () => {
  const { configuracoes, loading, salvarConfiguracoes, isEnvioAutomaticoAtivo } = useConfiguracoes();
  const [envioAutoAtas, setEnvioAutoAtas]     = useState(false);
  const [envioAutoPautas, setEnvioAutoPautas] = useState(false);
  const [webhookReceber, setWebhookReceber]   = useState("");
  const [webhookEnviar, setWebhookEnviar]     = useState("");
  const [emailRemetente, setEmailRemetente]   = useState("");
  const [nomeRemetente, setNomeRemetente]     = useState("");
  const [salvando, setSalvando]               = useState<string | null>(null);
  const [copiado, setCopiado]                 = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && configuracoes) {
      setEnvioAutoAtas(isEnvioAutomaticoAtivo("atas"));
      setEnvioAutoPautas(isEnvioAutomaticoAtivo("pautas"));
      setWebhookReceber(configuracoes.webhookN8nReceberAtas ?? "");
      setWebhookEnviar(configuracoes.webhookN8nEnviarAtas  ?? "");
      setEmailRemetente(configuracoes.emailRemetente       ?? "");
      setNomeRemetente(configuracoes.nomeRemetente         ?? "");
    }
  }, [loading, configuracoes]);

  const copiar = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
    toast({ title: "Copiado!" });
  };

  const handleToggleEnvioAutoAtas = async (checked: boolean) => {
    setEnvioAutoAtas(checked);
    setSalvando("atas");
    await salvarConfiguracoes({ enviarEmailAutomatico: checked });
    setSalvando(null);
  };

  const handleToggleEnvioAutoPautas = async (checked: boolean) => {
    setEnvioAutoPautas(checked);
    setSalvando("pautas");
    await salvarConfiguracoes({ enviarEmailAutomaticoPautas: checked });
    setSalvando(null);
  };

  const handleSalvarWebhooks = async () => {
    setSalvando("webhooks");
    const result = await salvarConfiguracoes({
      webhookN8nReceberAtas: webhookReceber,
      webhookN8nEnviarAtas:  webhookEnviar,
    });
    setSalvando(null);
    if (result.success) toast({ title: "Webhooks salvos com sucesso!" });
  };

  const handleSalvarEmail = async () => {
    setSalvando("email");
    const result = await salvarConfiguracoes({
      emailRemetente,
      nomeRemetente,
    });
    setSalvando(null);
    if (result.success) toast({ title: "Configurações de e-mail salvas!" });
  };

  if (loading) {
    return (
      <MainLayout titulo="Configurações" subtitulo="Personalize o sistema de governança">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout titulo="Configurações" subtitulo="Personalize o sistema de governança">
      <div className="max-w-4xl space-y-6 animate-fade-in">

        {/* Configurações de E-mail */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Configurações de E-mail</CardTitle>
                <CardDescription>Configure o envio automático de e-mails para pautas e atas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-mail Remetente</Label>
                <Input
                  value={emailRemetente}
                  onChange={(e) => setEmailRemetente(e.target.value)}
                  placeholder="governanca@empresa.com.br"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome Remetente</Label>
                <Input
                  value={nomeRemetente}
                  onChange={(e) => setNomeRemetente(e.target.value)}
                  placeholder="Governança Corporativa"
                />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Envio automático de pautas</p>
                <p className="text-sm text-muted-foreground">Enviar pautas automaticamente 48h antes da reunião</p>
              </div>
              <div className="flex items-center gap-2">
                {salvando === "pautas" && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                <Switch checked={envioAutoPautas} onCheckedChange={handleToggleEnvioAutoPautas} disabled={salvando === "pautas"} />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Envio automático de atas</p>
                <p className="text-sm text-muted-foreground">Enviar ata automaticamente ao receber do sistema de transcrição</p>
              </div>
              <div className="flex items-center gap-2">
                {salvando === "atas" && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                <Switch checked={envioAutoAtas} onCheckedChange={handleToggleEnvioAutoAtas} disabled={salvando === "atas"} />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSalvarEmail} disabled={salvando === "email"}>
                {salvando === "email" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar E-mail
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Integração com Automação N8N */}
        <Card className="shadow-soft border-secondary/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Webhook className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <CardTitle>Integração com Automação</CardTitle>
                <CardDescription>Configure a integração com o sistema de transcrição automática via N8N</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-secondary" />
                <span className="font-medium text-foreground">Fluxo N8N Conectado</span>
              </div>
              <p className="text-sm text-muted-foreground">
                O sistema está configurado para receber transcrições automáticas de reuniões
                através do fluxo N8N e processar atas automaticamente.
              </p>
            </div>

            <div className="space-y-2">
              <Label>URL do Webhook (Receber Atas)</Label>
              <p className="text-xs text-muted-foreground">
                URL do webhook N8N que receberá a notificação após o upload da gravação para processar a transcrição e gerar a ata.
              </p>
              <div className="flex gap-2">
                <Input
                  value={webhookReceber}
                  onChange={(e) => setWebhookReceber(e.target.value)}
                  placeholder="https://n8n.suaempresa.com/webhook/receber-ata"
                  className="font-mono text-sm"
                />
                <Button variant="outline" onClick={() => copiar(webhookReceber, "receber")} disabled={!webhookReceber}>
                  {copiado === "receber" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Webhook de Envio de Atas</Label>
              <p className="text-xs text-muted-foreground">
                URL do webhook N8N responsável por enviar as atas por e-mail após a geração.
              </p>
              <div className="flex gap-2">
                <Input
                  value={webhookEnviar}
                  onChange={(e) => setWebhookEnviar(e.target.value)}
                  placeholder="https://n8n.suaempresa.com/webhook/enviar-ata-email"
                  className="font-mono text-sm"
                />
                <Button variant="outline" onClick={() => copiar(webhookEnviar, "enviar")} disabled={!webhookEnviar}>
                  {copiado === "enviar" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>URL da API Backend</Label>
              <div className="flex gap-2">
                <Input readOnly value={import.meta.env.VITE_API_URL || "http://localhost:5000"} className="font-mono text-sm bg-muted" />
                <Button variant="outline" onClick={() => copiar(import.meta.env.VITE_API_URL || "http://localhost:5000", "api")}>
                  {copiado === "api" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSalvarWebhooks} disabled={salvando === "webhooks"}>
                {salvando === "webhooks" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar Webhooks
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Shield className="w-5 h-5 text-warning" />
              </div>
              <div>
                <CardTitle>Segurança e Acesso</CardTitle>
                <CardDescription>Configure permissões e políticas de acesso</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Registro de atividades</p>
                <p className="text-sm text-muted-foreground">Manter histórico de todas as ações do sistema</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Expiração de sessão</p>
                <p className="text-sm text-muted-foreground">Encerrar sessão após 8 horas de inatividade</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  );
};

export default Configuracoes;
