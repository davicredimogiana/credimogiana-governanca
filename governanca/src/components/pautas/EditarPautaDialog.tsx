import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMembros, useReunioes } from "@/hooks/useTarefas";
import { fetchPautaParaEdicao, atualizarPauta } from "@/hooks/usePautasEditor";
import { ObjetivosEditor } from "./ObjetivosEditor";
import { DadosEditor } from "./DadosEditor";
import { DiscussoesEditor } from "./DiscussoesEditor";
import { DeliberacoesEditor } from "./DeliberacoesEditor";
import { EncaminhamentosEditor } from "./EncaminhamentosEditor";
import { ItensEditor } from "./ItensEditor";

interface EditarPautaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pautaId: string | null;
  onSaved: () => void;
}

export function EditarPautaDialog({ open, onOpenChange, pautaId, onSaved }: EditarPautaDialogProps) {
  const { membros } = useMembros();
  const { reunioes } = useReunioes();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pauta, setPauta] = useState<any>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "",
    contexto: "",
    observacoes: "",
    status: "rascunho",
    responsavel_id: "",
    reuniao_id: "",
    tempo_previsto: 30,
  });

  useEffect(() => {
    if (open && pautaId) {
      loadPauta();
    }
  }, [open, pautaId]);

  const loadPauta = async () => {
    if (!pautaId) return;
    setLoading(true);
    try {
      const data = await fetchPautaParaEdicao(pautaId);
      setPauta(data);
      setFormData({
        titulo: data.titulo || "",
        subtitulo: data.subtitulo || "",
        contexto: data.contexto || "",
        observacoes: data.observacoes || "",
        status: data.status || "rascunho",
        responsavel_id: data.responsavel_id || "",
        reuniao_id: data.reuniao_id || "",
        tempo_previsto: data.tempo_previsto || 30,
      });
    } catch (err: any) {
      toast({ title: "Erro ao carregar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    if (!pautaId) return;
    setSaving(true);
    try {
      await atualizarPauta(pautaId, {
        titulo: formData.titulo,
        subtitulo: formData.subtitulo || null,
        contexto: formData.contexto || null,
        observacoes: formData.observacoes || null,
        status: formData.status,
        responsavel_id: formData.responsavel_id || null,
        reuniao_id: formData.reuniao_id || null,
        tempo_previsto: formData.tempo_previsto,
      });
      toast({ title: "Salvo!", description: "Dados gerais atualizados." });
      onSaved();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!pautaId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Pauta: {formData.titulo || "Carregando..."}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="itens">Itens</TabsTrigger>
              <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="discussoes">Discussões</TabsTrigger>
              <TabsTrigger value="deliberacoes">Deliberações</TabsTrigger>
              <TabsTrigger value="encaminhamentos">Encam.</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh] mt-4">
              <TabsContent value="geral" className="space-y-4 p-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título *</Label>
                    <Input
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Input
                      value={formData.subtitulo}
                      onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Contexto</Label>
                  <Textarea
                    value={formData.contexto}
                    onChange={(e) => setFormData({ ...formData, contexto: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_discussao">Em Discussão</SelectItem>
                        <SelectItem value="aprovada">Aprovada</SelectItem>
                        <SelectItem value="rejeitada">Rejeitada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Responsável</Label>
                    <Select value={formData.responsavel_id} onValueChange={(v) => setFormData({ ...formData, responsavel_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {membros.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reunião</Label>
                    <Select value={formData.reuniao_id} onValueChange={(v) => setFormData({ ...formData, reuniao_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {reunioes.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.titulo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tempo Previsto (min)</Label>
                    <Input
                      type="number"
                      value={formData.tempo_previsto}
                      onChange={(e) => setFormData({ ...formData, tempo_previsto: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={2}
                  />
                </div>

                <Button onClick={handleSaveGeneral} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Dados Gerais
                </Button>
              </TabsContent>

              <TabsContent value="itens" className="p-1">
                <ItensEditor pautaId={pautaId} itens={pauta?.itens || []} onUpdate={loadPauta} />
              </TabsContent>

              <TabsContent value="objetivos" className="p-1">
                <ObjetivosEditor pautaId={pautaId} objetivos={pauta?.objetivos || []} onUpdate={loadPauta} />
              </TabsContent>

              <TabsContent value="dados" className="p-1">
                <DadosEditor pautaId={pautaId} dados={pauta?.dados || []} onUpdate={loadPauta} />
              </TabsContent>

              <TabsContent value="discussoes" className="p-1">
                <DiscussoesEditor pautaId={pautaId} discussoes={pauta?.discussoes || []} onUpdate={loadPauta} />
              </TabsContent>

              <TabsContent value="deliberacoes" className="p-1">
                <DeliberacoesEditor pautaId={pautaId} deliberacoes={pauta?.deliberacoes || []} onUpdate={loadPauta} />
              </TabsContent>

              <TabsContent value="encaminhamentos" className="p-1">
                <EncaminhamentosEditor pautaId={pautaId} encaminhamentos={pauta?.encaminhamentos || []} onUpdate={loadPauta} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
