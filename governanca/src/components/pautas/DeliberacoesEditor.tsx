import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Check, X, Edit2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { adicionarDeliberacao, atualizarDeliberacao, excluirDeliberacao } from "@/hooks/usePautasEditor";

interface Deliberacao {
  id: string;
  texto: string;
  ordem: number;
}

interface Props {
  pautaId: string;
  deliberacoes: Deliberacao[];
  onUpdate: () => void;
}

export function DeliberacoesEditor({ pautaId, deliberacoes, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    setLoading(true);
    try {
      await adicionarDeliberacao(pautaId, newValue.trim(), deliberacoes.length);
      setNewValue("");
      toast({ title: "Deliberação adicionada!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (d: Deliberacao) => {
    setEditingId(d.id);
    setEditValue(d.texto);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editValue.trim()) return;
    setLoading(true);
    try {
      await atualizarDeliberacao(editingId, editValue.trim());
      setEditingId(null);
      toast({ title: "Deliberação atualizada!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta deliberação?")) return;
    setLoading(true);
    try {
      await excluirDeliberacao(id);
      toast({ title: "Deliberação excluída!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground">Deliberações</h4>

      <div className="space-y-2">
        {deliberacoes.map((d, i) => (
          <div key={d.id} className="p-3 bg-success/10 border border-success/30 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-success w-6">{i + 1}.</span>
              {editingId === d.id ? (
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleSaveEdit} disabled={loading}>
                      <Check className="w-4 h-4 mr-1" /> Salvar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4 mr-1" /> Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm">{d.texto}</span>
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(d)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(d.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Nova deliberação..."
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          rows={2}
        />
        <Button onClick={handleAdd} disabled={loading || !newValue.trim()} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Adicionar Deliberação
        </Button>
      </div>
    </div>
  );
}
