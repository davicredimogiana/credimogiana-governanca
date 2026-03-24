import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { UltimasAtas } from "@/components/dashboard/UltimasAtas";
import { ResumoGovernanca } from "@/components/dashboard/ResumoGovernanca";
import { api } from "@/lib/api";
import { FileText, Users, Target, Mail, Loader2 } from "lucide-react";
import type { DashboardStats } from "@/types/api";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get<DashboardStats>('/api/dashboard')
      .then(data => setStats(data))
      .catch(err => console.error('Erro ao carregar dados:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <MainLayout titulo="Painel Geral" subtitulo="Visão executiva da governança corporativa">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const taxaLeitura = stats && stats.totalTarefas > 0
    ? Math.round((stats.tarefasConcluidas / stats.totalTarefas) * 100)
    : 0;

  return (
    <MainLayout titulo="Painel Geral" subtitulo="Visão executiva da governança corporativa">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            titulo="Atas Disponíveis"
            valor={stats?.totalAtas || 0}
            subtitulo={`${stats?.reunioesEsteAno || 0} reuniões este ano`}
            icone={FileText}
            variante="primary"
            className="animate-slide-up stagger-1"
          />
          <StatCard
            titulo="Membros Ativos"
            valor={stats?.membrosAtivos || 0}
            subtitulo="Cooperados cadastrados"
            icone={Users}
            variante="default"
            className="animate-slide-up stagger-2"
          />
          <StatCard
            titulo="Tarefas em Aberto"
            valor={stats?.tarefasPendentes || 0}
            subtitulo="Aguardando execução"
            icone={Target}
            variante={(stats?.tarefasPendentes || 0) > 5 ? "warning" : "default"}
            className="animate-slide-up stagger-3"
          />
          <StatCard
            titulo="Total de Tarefas"
            valor={stats?.totalTarefas || 0}
            subtitulo={`${taxaLeitura}% taxa de conclusão`}
            icone={Mail}
            variante="secondary"
            className="animate-slide-up stagger-4"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-slide-up stagger-2">
            <UltimasAtas />
          </div>
          <div className="animate-slide-up stagger-3">
            <ResumoGovernanca />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
