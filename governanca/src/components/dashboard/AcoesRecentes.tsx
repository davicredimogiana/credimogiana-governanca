import { useState, useEffect } from "react";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { TarefaDelegada } from "@/types/api";

export function AcoesRecentes() {
  const [tarefas, setTarefas] = useState<TarefaDelegada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<TarefaDelegada[]>('/api/tarefas')
      .then(data => setTarefas((data || []).slice(0, 5)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'em_andamento': return <Clock className="w-4 h-4 text-warning" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-foreground mb-6">Ações Recentes</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-foreground mb-6">Ações Recentes</h3>
      {tarefas.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma ação registrada.</p>
      ) : (
        <div className="space-y-3">
          {tarefas.map(tarefa => (
            <div key={tarefa.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              {getStatusIcon(tarefa.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{tarefa.descricao}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tarefa.responsavel?.nome} • Prazo: {tarefa.prazo || 'Sem prazo'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
