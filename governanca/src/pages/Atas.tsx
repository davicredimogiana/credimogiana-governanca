import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText, Clock, AlertTriangle, Lightbulb, CheckCircle2, ListChecks,
  ExternalLink, RefreshCw, Eye, Mail
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { EnviarDocumentoDialog } from "@/components/email/EnviarDocumentoDialog";
import { VisualizarAtaDialog } from "@/components/atas/VisualizarAtaDialog";
import type { Ata } from "@/types/api";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  recebida: { label: "Recebida", variant: "secondary" },
  revisada: { label: "Revisada", variant: "default" },
  aprovada: { label: "Aprovada", variant: "default" },
};

export default function Atas() {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAta, setSelectedAta] = useState<Ata | null>(null);
  const [dialogEnvioOpen, setDialogEnvioOpen] = useState(false);
  const [ataSelecionadaEnvio, setAtaSelecionadaEnvio] = useState<Ata | null>(null);
  const [dialogVisualizarOpen, setDialogVisualizarOpen] = useState(false);
  const { toast } = useToast();

  const fetchAtas = async () => {
    setLoading(true);
    try {
      const data = await api.get<Ata[]>('/api/atas');
      setAtas(data || []);
    } catch (error) {
      console.error('Erro ao buscar atas:', error);
      toast({ title: "Erro ao carregar atas", description: "Não foi possível carregar as atas do sistema.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAtas(); }, []);

  const handleSelectAta = (ata: Ata) => {
    setSelectedAta(ata);
    setDialogVisualizarOpen(true);
  };

  const contadores = {
    decisoes: atas.reduce((acc, a) => acc + (a.analise?.decisoes?.length || 0), 0),
    acoes: atas.reduce((acc, a) => acc + (a.analise?.acoes?.length || 0), 0),
    riscos: atas.reduce((acc, a) => acc + (a.analise?.riscos?.length || 0), 0),
    oportunidades: atas.reduce((acc, a) => acc + (a.analise?.oportunidades?.length || 0), 0),
  };

  return (
    <MainLayout titulo="Atas de Reuniões" subtitulo="Atas recebidas automaticamente do sistema de transcrição">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Button onClick={fetchAtas} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />Atualizar
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: FileText, label: "Atas Recebidas", valor: atas.length, cor: "bg-primary/10 text-primary" },
            { icon: CheckCircle2, label: "Decisões", valor: contadores.decisoes, cor: "bg-green-100 text-green-700" },
            { icon: ListChecks, label: "Ações", valor: contadores.acoes, cor: "bg-blue-100 text-blue-700" },
            { icon: AlertTriangle, label: "Riscos", valor: contadores.riscos, cor: "bg-amber-100 text-amber-700" },
          ].map(item => (
            <Card key={item.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.cor}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{item.valor}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />Atas Processadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : atas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Nenhuma ata recebida ainda</p>
                <p className="text-sm mt-1">As atas aparecerão aqui quando forem enviadas pelo sistema de transcrição.</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {atas.map((ata) => (
                    <div key={ata.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-foreground">
                              {ata.analise?.resumo?.substring(0, 60) || `Ata ${format(new Date(ata.geradaEm), "dd/MM/yyyy HH:mm")}`}
                            </h3>
                            <Badge variant={statusConfig[ata.status]?.variant || "secondary"}>
                              {statusConfig[ata.status]?.label || ata.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(ata.geradaEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              {ata.analise?.decisoes?.length || 0} decisões
                            </span>
                            <span className="flex items-center gap-1">
                              <ListChecks className="w-4 h-4 text-blue-600" />
                              {ata.analise?.acoes?.length || 0} ações
                            </span>
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              {ata.analise?.riscos?.length || 0} riscos
                            </span>
                            <span className="flex items-center gap-1">
                              <Lightbulb className="w-4 h-4 text-purple-600" />
                              {ata.analise?.oportunidades?.length || 0} oportunidades
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setAtaSelecionadaEnvio(ata); setDialogEnvioOpen(true); }}>
                            <Mail className="w-4 h-4 mr-1" />Enviar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleSelectAta(ata)}>
                            <Eye className="w-4 h-4 mr-2" />Visualizar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
        {ataSelecionadaEnvio && (
          <EnviarDocumentoDialog
            open={dialogEnvioOpen}
            onOpenChange={setDialogEnvioOpen}
            tipo="ata"
            documentoId={ataSelecionadaEnvio.id}
            documentoTitulo={ataSelecionadaEnvio.analise?.resumo?.substring(0, 60) || `Ata de ${format(new Date(ataSelecionadaEnvio.geradaEm), "dd/MM/yyyy")}`}
          />
        )}
        <VisualizarAtaDialog
          open={dialogVisualizarOpen}
          onOpenChange={setDialogVisualizarOpen}
          ata={selectedAta}
          decisoes={selectedAta?.analise?.decisoes || []}
          acoes={selectedAta?.analise?.acoes || []}
          riscos={selectedAta?.analise?.riscos || []}
          oportunidades={selectedAta?.analise?.oportunidades || []}
        />
      </div>
    </MainLayout>
  );
}
