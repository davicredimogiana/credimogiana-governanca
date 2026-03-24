import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Check, X, Edit2, Loader2, User, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMembros } from "@/hooks/useTarefas";
import { adicionarItemPauta, atualizarItemPauta, excluirItemPauta } from "@/hooks/usePautasEditor";

interface PautaItem {
  id: string;
  tema: string;
  responsavel_id: string | null;
  ordem: number;
  hora_inicio: string | null;
  hora_fim: string | null;
  responsavel?: {
    id: string;
    nome: string;
    cargo: string;
  } | null;
}

interface Props {
  pautaId: string;
  itens: PautaItem[];
  onUpdate: () => void;
}

export function ItensEditor({ pautaId, itens, onUpdate }: Props) {
  const { membros } = useMembros();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ 
    tema: "", 
    responsavel_id: "", 
    hora_inicio: "", 
    hora_fim: "" 
  });
  const [newData, setNewData] = useState({ 
    tema: "", 
    responsavel_id: "", 
    hora_inicio: "", 
    hora_fim: "" 
  });
  const [loading, setLoading] = useState(false);

  // Formata horário do banco (HH:MM:SS) para input (HH:MM)
  const formatTimeForInput = (time: string | null): string => {
    if (!time) return "";
    return time.substring(0, 5);
  };

  // Formata horário do input para exibição
  const formatTimeDisplay = (time: string | null): string => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

  const handleAdd = async () => {
    if (!newData.tema.trim()) {
      toast({ title: "Preencha o tema", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await adicionarItemPauta(pautaId, {
        tema: newData.tema.trim(),
        responsavel_id: newData.responsavel_id || null,
        ordem: itens.length,
        hora_inicio: newData.hora_inicio || null,
        hora_fim: newData.hora_fim || null,
      });
      setNewData({ tema: "", responsavel_id: "", hora_inicio: "", hora_fim: "" });
      toast({ title: "Item adicionado!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: PautaItem) => {
    setEditingId(item.id);
    setEditData({ 
      tema: item.tema, 
      responsavel_id: item.responsavel_id || "",
      hora_inicio: formatTimeForInput(item.hora_inicio),
      hora_fim: formatTimeForInput(item.hora_fim),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setLoading(true);
    try {
      await atualizarItemPauta(editingId, {
        tema: editData.tema,
        responsavel_id: editData.responsavel_id || null,
        hora_inicio: editData.hora_inicio || null,
        hora_fim: editData.hora_fim || null,
      });
      setEditingId(null);
      toast({ title: "Item atualizado!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este item?")) return;
    setLoading(true);
    try {
      await excluirItemPauta(id);
      toast({ title: "Item excluído!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-foreground">Súmula da Pauta (Concierge)</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Defina os temas, horários e responsáveis para auxiliar a IA na identificação de quem está falando durante a transcrição.
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2 font-medium w-8">#</th>
              <th className="text-left p-2 font-medium">Tema / Assunto</th>
              <th className="text-left p-2 font-medium w-40">Responsável</th>
              <th className="text-center p-2 font-medium w-20">Início</th>
              <th className="text-center p-2 font-medium w-20">Fim</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-muted-foreground">
                  Nenhum item cadastrado. Adicione temas abaixo.
                </td>
              </tr>
            ) : (
              itens.map((item, index) => (
                <tr key={item.id} className="border-t">
                  {editingId === item.id ? (
                    <>
                      <td className="p-2 text-muted-foreground">{index + 1}</td>
                      <td className="p-2">
                        <Input
                          value={editData.tema}
                          onChange={(e) => setEditData({ ...editData, tema: e.target.value })}
                          autoFocus
                        />
                      </td>
                      <td className="p-2">
                        <Select 
                          value={editData.responsavel_id || "none"} 
                          onValueChange={(v) => setEditData({ ...editData, responsavel_id: v === "none" ? "" : v })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem responsável</SelectItem>
                            {membros.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="time"
                          value={editData.hora_inicio}
                          onChange={(e) => setEditData({ ...editData, hora_inicio: e.target.value })}
                          className="h-9 text-center"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="time"
                          value={editData.hora_fim}
                          onChange={(e) => setEditData({ ...editData, hora_fim: e.target.value })}
                          className="h-9 text-center"
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={handleSaveEdit} disabled={loading}>
                            <Check className="w-4 h-4 text-primary" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2 text-muted-foreground">{index + 1}</td>
                      <td className="p-2 font-medium">{item.tema}</td>
                      <td className="p-2">
                        {item.responsavel ? (
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                            <User className="w-3 h-3" />
                            <span>{item.responsavel.nome}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        <span className="text-xs font-mono">
                          {formatTimeDisplay(item.hora_inicio)}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className="text-xs font-mono">
                          {formatTimeDisplay(item.hora_fim)}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t pt-4 space-y-3">
        <h5 className="text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Item
        </h5>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-5">
            <Label className="text-xs">Tema / Assunto *</Label>
            <Input
              placeholder="Ex: Abertura e Boas Vindas"
              value={newData.tema}
              onChange={(e) => setNewData({ ...newData, tema: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div className="col-span-3">
            <Label className="text-xs">Responsável</Label>
            <Select 
              value={newData.responsavel_id || "none"} 
              onValueChange={(v) => setNewData({ ...newData, responsavel_id: v === "none" ? "" : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem responsável</SelectItem>
                {membros.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nome} - {m.cargo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Início
            </Label>
            <Input
              type="time"
              value={newData.hora_inicio}
              onChange={(e) => setNewData({ ...newData, hora_inicio: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <Label className="text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Fim
            </Label>
            <Input
              type="time"
              value={newData.hora_fim}
              onChange={(e) => setNewData({ ...newData, hora_fim: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={handleAdd} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Adicionar Item
        </Button>
      </div>
    </div>
  );
}
