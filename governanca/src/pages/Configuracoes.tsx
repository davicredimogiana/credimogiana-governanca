import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Mail, Webhook, Shield, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";

const Configuracoes = () => {
  const { configuracoes, loading, salvarConfiguracoes, isEnvioAutomaticoAtivo } = useConfiguracoes();
  const [envioAutoAtas, setEnvioAutoAtas] = useState(false);
  const [envioAutoPautas, setEnvioAutoPautas] = useState(false);
  const [salvando, setSalvando] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
      setEnvioAutoAtas(isEnvioAutomaticoAtivo('atas'));
      setEnvioAutoPautas(isEnvioAutomaticoAtivo('pautas'));
    }
  }, [loading, configuracoes]);

  const handleToggleEnvioAutoAtas = async (checked: boolean) => {
    setEnvioAutoAtas(checked);
    setSalvando('atas');
    await salvarConfiguracoes({ enviarEmailAutomatico: checked });
    setSalvando(null);
  };

  const handleToggleEnvioAutoPautas = async (checked: boolean) => {
    setEnvioAutoPautas(checked);
    setSalvando('pautas');
    await salvarConfiguracoes({ enviarEmailAutomaticoPautas: checked });
    setSalvando(null);
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
        {/* Notificações por E-mail */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notificações por E-mail</CardTitle>
                <CardDescription>Configure o envio automático de documentos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Envio automático de atas</p>
                <p className="text-sm text-muted-foreground">Enviar ata automaticamente após processamento</p>
              </div>
              <div className="flex items-center gap-2">
                {salvando === 'atas' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                <Switch checked={envioAutoAtas} onCheckedChange={handleToggleEnvioAutoAtas} disabled={salvando === 'atas'} />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Envio automático de pautas</p>
                <p className="text-sm text-muted-foreground">Enviar pauta automaticamente antes da reunião</p>
              </div>
              <div className="flex items-center gap-2">
                {salvando === 'pautas' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                <Switch checked={envioAutoPautas} onCheckedChange={handleToggleEnvioAutoPautas} disabled={salvando === 'pautas'} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integração Backend */}
        <Card className="shadow-soft border-secondary/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Webhook className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <CardTitle>Integração com Automação</CardTitle>
                <CardDescription>Configure a integração com o sistema de transcrição automática</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-secondary" />
                <span className="font-medium text-foreground">Backend .NET Conectado</span>
              </div>
              <p className="text-sm text-muted-foreground">
                O sistema está configurado para receber transcrições automáticas de reuniões
                através do backend .NET e processar atas via integração com N8N.
              </p>
            </div>
            <div className="space-y-2">
              <Label>URL da API Backend</Label>
              <div className="flex gap-2">
                <Input readOnly value={import.meta.env.VITE_API_URL || 'http://localhost:5000'} className="font-mono text-sm" />
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(import.meta.env.VITE_API_URL || 'http://localhost:5000');
                  toast({ title: "URL copiada!" });
                }}>Copiar</Button>
              </div>
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
