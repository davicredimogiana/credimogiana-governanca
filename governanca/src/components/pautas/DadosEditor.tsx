import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Check, X, Edit2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { adicionarDado, atualizarDado, excluirDado } from "@/hooks/usePautasEditor";

interface Dado {
  id: string;
  secao_titulo: string;
  label: string;
  valor: string;
  ordem: number;
}

interface Props {
  pautaId: string;
  dados: Dado[];
  onUpdate: () => void;
}

export function DadosEditor({ pautaId, dados, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ secao_titulo: "", label: "", valor: "" });
  const [newData, setNewData] = useState({ secao_titulo: "", label: "", valor: "" });
  const [loading, setLoading] = useState(false);

  // Agrupar por seção
  const secoes = dados.reduce((acc, d) => {
    if (!acc[d.secao_titulo]) acc[d.secao_titulo] = [];
    acc[d.secao_titulo].push(d);
    return acc;
  }, {} as Record<string, Dado[]>);

  const handleAdd = async () => {
    if (!newData.secao_titulo.trim() || !newData.label.trim() || !newData.valor.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await adicionarDado(pautaId, {
        secao_titulo: newData.secao_titulo.trim(),
        label: newData.label.trim(),
        valor: newData.valor.trim(),
        ordem: dados.length,
      });
      setNewData({ secao_titulo: "", label: "", valor: "" });
      toast({ title: "Dado adicionado!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (d: Dado) => {
    setEditingId(d.id);
    setEditData({ secao_titulo: d.secao_titulo, label: d.label, valor: d.valor });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setLoading(true);
    try {
      await atualizarDado(editingId, editData);
      setEditingId(null);
      toast({ title: "Dado atualizado!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este dado?")) return;
    setLoading(true);
    try {
      await excluirDado(id);
      toast({ title: "Dado excluído!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground">Dados Apresentados</h4>

      {Object.entries(secoes).map(([titulo, itens]) => (
        <div key={titulo} className="border rounded-lg p-3 space-y-2">
          <h5 className="font-medium text-sm text-primary">{titulo}</h5>
          {itens.map((d) => (
            <div key={d.id} className="flex items-center gap-2 bg-muted/30 p-2 rounded">
              {editingId === d.id ? (
                <>
                  <Input
                    value={editData.secao_titulo}
                    onChange={(e) => setEditData({ ...editData, secao_titulo: e.target.value })}
                    placeholder="Seção"
                    className="w-32"
                  />
                  <Input
                    value={editData.label}
                    onChange={(e) => setEditData({ ...editData, label: e.target.value })}
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Input
                    value={editData.valor}
                    onChange={(e) => setEditData({ ...editData, valor: e.target.value })}
                    placeholder="Valor"
                    className="flex-1"
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
                  <span className="flex-1 text-sm text-muted-foreground">{d.label}</span>
                  <span className="font-medium text-sm">{d.valor}</span>
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(d)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(d.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="border-t pt-4 space-y-3">
        <h5 className="text-sm font-medium">Adicionar Novo Dado</h5>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">Seção</Label>
            <Input
              placeholder="Ex: Indicadores"
              value={newData.secao_titulo}
              onChange={(e) => setNewData({ ...newData, secao_titulo: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Label</Label>
            <Input
              placeholder="Ex: Total de vendas"
              value={newData.label}
              onChange={(e) => setNewData({ ...newData, label: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Valor</Label>
            <Input
              placeholder="Ex: R$ 100.000"
              value={newData.valor}
              onChange={(e) => setNewData({ ...newData, valor: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={handleAdd} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Adicionar Dado
        </Button>
      </div>
    </div>
  );
}
