import { useState, useEffect } from "react";
import { Users, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types/api";

export function ResumoGovernanca() {
  const [metricas, setMetricas] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardStats>('/api/dashboard')
      .then(data => setMetricas(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const taxaConclusao = metricas
    ? metricas.totalTarefas > 0
      ? Math.round((metricas.tarefasConcluidas / metricas.totalTarefas) * 100)
      : 0
    : 0;

  const items = [
    { label: 'Membros Ativos', valor: metricas?.membrosAtivos || 0, icon: Users, cor: 'bg-primary/10 text-primary' },
    { label: 'Atas Geradas', valor: metricas?.totalAtas || 0, icon: FileText, cor: 'bg-success/10 text-success' },
    { label: 'Tarefas Concluídas', valor: metricas?.tarefasConcluidas || 0, icon: CheckCircle2, cor: 'bg-success/10 text-success' },
    { label: 'Tarefas Pendentes', valor: metricas?.tarefasPendentes || 0, icon: AlertTriangle, cor: 'bg-warning/10 text-warning' },
  ];

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-foreground mb-6">Resumo de Governança</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-foreground mb-6">Resumo de Governança</h3>
      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", item.cor)}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <span className="text-lg font-semibold text-foreground">{item.valor}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Taxa de Conclusão</span>
          <span className="text-sm font-medium text-foreground">{taxaConclusao}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-success transition-all duration-500"
            style={{ width: `${taxaConclusao}%` }}
          />
        </div>
      </div>
    </div>
  );
}
