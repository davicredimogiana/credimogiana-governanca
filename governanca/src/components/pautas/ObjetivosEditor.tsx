import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check, X, Edit2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { adicionarObjetivo, atualizarObjetivo, excluirObjetivo } from "@/hooks/usePautasEditor";

interface Objetivo {
  id: string;
  texto: string;
  ordem: number;
}

interface Props {
  pautaId: string;
  objetivos: Objetivo[];
  onUpdate: () => void;
}

export function ObjetivosEditor({ pautaId, objetivos, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    setLoading(true);
    try {
      await adicionarObjetivo(pautaId, newValue.trim(), objetivos.length);
      setNewValue("");
      toast({ title: "Objetivo adicionado!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (obj: Objetivo) => {
    setEditingId(obj.id);
    setEditValue(obj.texto);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editValue.trim()) return;
    setLoading(true);
    try {
      await atualizarObjetivo(editingId, editValue.trim());
      setEditingId(null);
      toast({ title: "Objetivo atualizado!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este objetivo?")) return;
    setLoading(true);
    try {
      await excluirObjetivo(id);
      toast({ title: "Objetivo excluído!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground">Objetivos da Pauta</h4>
      
      <div className="space-y-2">
        {objetivos.map((obj, i) => (
          <div key={obj.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-primary w-6">{i + 1}.</span>
            {editingId === obj.id ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={handleSaveEdit} disabled={loading}>
                  <Check className="w-4 h-4 text-success" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{obj.texto}</span>
                <Button size="icon" variant="ghost" onClick={() => handleEdit(obj)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(obj.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Novo objetivo..."
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={loading || !newValue.trim()} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Adicionar
        </Button>
      </div>
    </div>
  );
}
