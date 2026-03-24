import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mail, Loader2, Users, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Membro } from "@/types/api";

interface EnviarEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pautaId: string;
  pautaTitulo: string;
  membros: Membro[];
}

const tipoConfig: Record<string, { label: string; color: string }> = {
  diretoria: { label: "Diretoria", color: "bg-primary/10 text-primary border-primary/30" },
  superintendencia: { label: "Superintendência", color: "bg-info/10 text-info border-info/30" },
  gestores: { label: "Gestores", color: "bg-success/10 text-success border-success/30" },
  lideres: { label: "Líderes", color: "bg-warning/10 text-warning border-warning/30" },
  cooperados: { label: "Cooperados", color: "bg-muted text-muted-foreground border-border" },
};

export function EnviarEmailDialog({ open, onOpenChange, pautaId, pautaTitulo, membros }: EnviarEmailDialogProps) {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const { toast } = useToast();
  const membrosAtivos = membros.filter(m => m.email);

  const toggleMembro = (id: string) =>
    setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const selecionarTodos = () =>
    setSelecionados(selecionados.length === membrosAtivos.length ? [] : membrosAtivos.map(m => m.id));

  const selecionarPorTipo = (tipo: string) => {
    const idsTipo = membrosAtivos.filter(m => m.tipo === tipo).map(m => m.id);
    const todosSelecionados = idsTipo.every(id => selecionados.includes(id));
    setSelecionados(prev => todosSelecionados ? prev.filter(id => !idsTipo.includes(id)) : [...new Set([...prev, ...idsTipo])]);
  };

  const handleEnviar = async () => {
    if (selecionados.length === 0) {
      toast({ title: "Selecione destinatários", description: "Escolha pelo menos um destinatário.", variant: "destructive" });
      return;
    }
    setEnviando(true);
    try {
      const destinatarios = membrosAtivos.filter(m => selecionados.includes(m.id)).map(d => ({ nome: d.nome, email: d.email, cargo: d.cargo }));
      await api.post(`/api/pautas/${pautaId}/enviar`, { destinatarios });
      setSucesso(true);
      toast({ title: "E-mail enviado!", description: `A pauta foi enviada para ${selecionados.length} destinatário(s).` });
      setTimeout(() => { onOpenChange(false); setSucesso(false); setSelecionados([]); }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar';
      toast({ title: "Erro ao enviar", description: message, variant: "destructive" });
    } finally {
      setEnviando(false);
    }
  };

  const membrosPorTipo = membrosAtivos.reduce((acc, membro) => {
    if (!acc[membro.tipo]) acc[membro.tipo] = [];
    acc[membro.tipo].push(membro);
    return acc;
  }, {} as Record<string, Membro[]>);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!enviando) { onOpenChange(o); if (!o) { setSelecionados([]); setSucesso(false); } } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />Enviar Pauta por E-mail
          </DialogTitle>
          <DialogDescription>Selecione os destinatários para enviar a pauta "{pautaTitulo}"</DialogDescription>
        </DialogHeader>
        {sucesso ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-success mb-4" />
            <h3 className="text-lg font-semibold mb-1">E-mail Enviado!</h3>
            <p className="text-muted-foreground">A pauta foi enviada para {selecionados.length} destinatário(s)</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={selecionarTodos} className="gap-2">
                  <Users className="w-4 h-4" />
                  {selecionados.length === membrosAtivos.length ? "Desmarcar Todos" : "Selecionar Todos"}
                </Button>
                {Object.keys(membrosPorTipo).map(tipo => (
                  <Button key={tipo} variant="outline" size="sm" onClick={() => selecionarPorTipo(tipo)}>
                    {tipoConfig[tipo]?.label || tipo}
                  </Button>
                ))}
              </div>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {Object.entries(membrosPorTipo).map(([tipo, membrosTipo]) => {
                    const config = tipoConfig[tipo] || { label: tipo, color: "bg-muted" };
                    return (
                      <div key={tipo} className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                          <Badge variant="outline" className={config.color}>{config.label}</Badge>
                          <span className="text-xs">({membrosTipo.length})</span>
                        </h4>
                        <div className="space-y-1">
                          {membrosTipo.map(membro => (
                            <label key={membro.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                              <Checkbox checked={selecionados.includes(membro.id)} onCheckedChange={() => toggleMembro(membro.id)} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{membro.nome}</p>
                                <p className="text-xs text-muted-foreground truncate">{membro.email}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">{membro.cargo}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {membrosAtivos.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum membro com e-mail cadastrado</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={enviando}>Cancelar</Button>
              <Button onClick={handleEnviar} disabled={enviando || selecionados.length === 0}>
                {enviando ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><Mail className="w-4 h-4 mr-2" />Enviar ({selecionados.length})</>}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
