import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check, X, Edit2, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  adicionarDiscussao,
  atualizarDiscussao,
  excluirDiscussao,
  adicionarPontoDiscussao,
  atualizarPontoDiscussao,
  excluirPontoDiscussao,
} from "@/hooks/usePautasEditor";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Ponto {
  id: string;
  texto: string;
  ordem: number;
}

interface Discussao {
  id: string;
  topico: string;
  ordem: number;
  pontos: Ponto[];
}

interface Props {
  pautaId: string;
  discussoes: Discussao[];
  onUpdate: () => void;
}

export function DiscussoesEditor({ pautaId, discussoes, onUpdate }: Props) {
  const [expandedIds, setExpandedIds] = useState<string[]>(discussoes.map(d => d.id));
  const [editingDiscId, setEditingDiscId] = useState<string | null>(null);
  const [editingPontoId, setEditingPontoId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newTopico, setNewTopico] = useState("");
  const [newPontos, setNewPontos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddDiscussao = async () => {
    if (!newTopico.trim()) return;
    setLoading(true);
    try {
      await adicionarDiscussao(pautaId, newTopico.trim(), discussoes.length);
      setNewTopico("");
      toast({ title: "Tópico adicionado!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditDiscussao = (d: Discussao) => {
    setEditingDiscId(d.id);
    setEditValue(d.topico);
  };

  const handleSaveDiscussao = async () => {
    if (!editingDiscId || !editValue.trim()) return;
    setLoading(true);
    try {
      await atualizarDiscussao(editingDiscId, editValue.trim());
      setEditingDiscId(null);
      toast({ title: "Tópico atualizado!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiscussao = async (id: string) => {
    if (!confirm("Excluir este tópico e todos seus pontos?")) return;
    setLoading(true);
    try {
      await excluirDiscussao(id);
      toast({ title: "Tópico excluído!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPonto = async (discussaoId: string) => {
    const texto = newPontos[discussaoId]?.trim();
    if (!texto) return;
    setLoading(true);
    try {
      const disc = discussoes.find((d) => d.id === discussaoId);
      await adicionarPontoDiscussao(discussaoId, texto, disc?.pontos.length || 0);
      setNewPontos({ ...newPontos, [discussaoId]: "" });
      toast({ title: "Ponto adicionado!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPonto = (p: Ponto) => {
    setEditingPontoId(p.id);
    setEditValue(p.texto);
  };

  const handleSavePonto = async () => {
    if (!editingPontoId || !editValue.trim()) return;
    setLoading(true);
    try {
      await atualizarPontoDiscussao(editingPontoId, editValue.trim());
      setEditingPontoId(null);
      toast({ title: "Ponto atualizado!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePonto = async (id: string) => {
    if (!confirm("Excluir este ponto?")) return;
    setLoading(true);
    try {
      await excluirPontoDiscussao(id);
      toast({ title: "Ponto excluído!" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground">Discussões</h4>

      <div className="space-y-2">
        {discussoes.map((disc) => (
          <Collapsible key={disc.id} open={expandedIds.includes(disc.id)}>
            <div className="border rounded-lg">
              <CollapsibleTrigger asChild>
                <div
                  className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleExpand(disc.id)}
                >
                  {expandedIds.includes(disc.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  {editingDiscId === disc.id ? (
                    <>
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleSaveDiscussao(); }} disabled={loading}>
                        <Check className="w-4 h-4 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingDiscId(null); }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-sm">{disc.topico}</span>
                      <span className="text-xs text-muted-foreground">{disc.pontos.length} pontos</span>
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditDiscussao(disc); }}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteDiscussao(disc.id); }}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-2 border-t">
                  {disc.pontos.map((ponto) => (
                    <div key={ponto.id} className="flex items-center gap-2 pl-6 py-1">
                      <span className="text-info">•</span>
                      {editingPontoId === ponto.id ? (
                        <>
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1"
                            autoFocus
                          />
                          <Button size="icon" variant="ghost" onClick={handleSavePonto} disabled={loading}>
                            <Check className="w-4 h-4 text-success" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingPontoId(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm text-muted-foreground">{ponto.texto}</span>
                          <Button size="icon" variant="ghost" onClick={() => handleEditPonto(ponto)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeletePonto(ponto.id)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 pl-6 pt-2">
                    <Input
                      placeholder="Novo ponto..."
                      value={newPontos[disc.id] || ""}
                      onChange={(e) => setNewPontos({ ...newPontos, [disc.id]: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleAddPonto(disc.id)}
                      className="flex-1"
                    />
                    <Button size="sm" variant="outline" onClick={() => handleAddPonto(disc.id)} disabled={loading}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Novo tópico de discussão..."
          value={newTopico}
          onChange={(e) => setNewTopico(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddDiscussao()}
        />
        <Button onClick={handleAddDiscussao} disabled={loading || !newTopico.trim()} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Adicionar Tópico
        </Button>
      </div>
    </div>
  );
}
