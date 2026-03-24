import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Check, X, Edit2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { adicionarEncaminhamento, atualizarEncaminhamento, excluirEncaminhamento } from "@/hooks/usePautasEditor";

interface Encaminhamento {
  id: string;
  acao: string;
  responsavel: string;
  prazo: string;
  ordem: number;
}

interface Props {
  pautaId: string;
  encaminhamentos: Encaminhamento[];
  onUpdate: () => void;
}

export function EncaminhamentosEditor({ pautaId, encaminhamentos, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ acao: "", responsavel: "", prazo: "" });
  const [newData, setNewData] = useState({ acao: "", responsavel: "", prazo: "" });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newData.acao.trim() || !newData.responsavel.trim() || !newData.prazo.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await adicionarEncaminhamento(pautaId, {
        acao: newData.acao.trim(),
        responsavel: newData.responsavel.trim(),
        prazo: newData.prazo.trim(),
        ordem: encaminhamentos.length,
      });
      setNewData({ acao: "", responsavel: "", prazo: "" });
      toast({ title: "Encaminhamento adicionado!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e: Encaminhamento) => {
    setEditingId(e.id);
    setEditData({ acao: e.acao, responsavel: e.responsavel, prazo: e.prazo });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setLoading(true);
    try {
      await atualizarEncaminhamento(editingId, editData);
      setEditingId(null);
      toast({ title: "Encaminhamento atualizado!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este encaminhamento?")) return;
    setLoading(true);
    try {
      await excluirEncaminhamento(id);
      toast({ title: "Encaminhamento excluído!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground">Encaminhamentos</h4>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2 font-medium">Ação</th>
              <th className="text-left p-2 font-medium w-40">Responsável</th>
              <th className="text-left p-2 font-medium w-32">Prazo</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {encaminhamentos.map((enc) => (
              <tr key={enc.id} className="border-t">
                {editingId === enc.id ? (
                  <>
                    <td className="p-2">
                      <Input
                        value={editData.acao}
                        onChange={(e) => setEditData({ ...editData, acao: e.target.value })}
                        autoFocus
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={editData.responsavel}
                        onChange={(e) => setEditData({ ...editData, responsavel: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={editData.prazo}
                        onChange={(e) => setEditData({ ...editData, prazo: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={handleSaveEdit} disabled={loading}>
                          <Check className="w-4 h-4 text-success" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2 text-muted-foreground">{enc.acao}</td>
                    <td className="p-2 font-medium">{enc.responsavel}</td>
                    <td className="p-2 text-muted-foreground">{enc.prazo}</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(enc)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(enc.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t pt-4 space-y-3">
        <h5 className="text-sm font-medium">Adicionar Encaminhamento</h5>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">Ação</Label>
            <Input
              placeholder="Descreva a ação..."
              value={newData.acao}
              onChange={(e) => setNewData({ ...newData, acao: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Responsável</Label>
            <Input
              placeholder="Nome do responsável"
              value={newData.responsavel}
              onChange={(e) => setNewData({ ...newData, responsavel: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Prazo</Label>
            <Input
              placeholder="Ex: 15/12/2024"
              value={newData.prazo}
              onChange={(e) => setNewData({ ...newData, prazo: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={handleAdd} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Adicionar Encaminhamento
        </Button>
      </div>
    </div>
  );
}
