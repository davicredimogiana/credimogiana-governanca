import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  RefreshCw,
  Loader2,
  CalendarDays,
  FileCheck,
  Clock,
} from "lucide-react";

import { useReunioesHistorico } from "@/hooks/useReunioesHistorico";
import { CardReuniaoExecutivo } from "@/components/reunioes/CardReuniaoExecutivo";
import { EnviarGravacaoDialog } from "@/components/reunioes/EnviarGravacaoDialog";

const Reunioes = () => {
  const { reunioes, loading, stats, excluirReuniao, refetch } = useReunioesHistorico();
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [busca, setBusca] = useState("");

  const reunioesFiltradas = reunioes.filter((reuniao) => {
    const matchBusca =
      reuniao.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      reuniao.participantes?.some(p => p.toLowerCase().includes(busca.toLowerCase())) ||
      reuniao.resumo_executivo?.toLowerCase().includes(busca.toLowerCase());

    const matchStatus =
      filtroStatus === "todas" ||
      (filtroStatus === "com_ata" && reuniao.status === "ata_disponivel") ||
      (filtroStatus === "aguardando" && reuniao.status === "processando");

    return matchBusca && matchStatus;
  });

  if (loading) {
    return (
      <MainLayout titulo="Reuniões Registradas" subtitulo="Acompanhe as reuniões realizadas e suas atas">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout titulo="Reuniões Registradas" subtitulo="Acompanhe as reuniões realizadas e suas atas">
      <div className="space-y-6 animate-fade-in">
        {/* Stats Cards Executivos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-soft">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Reuniões</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Atas Disponíveis</p>
                  <p className="text-2xl font-bold text-success">{stats.atasDisponiveis}</p>
                </div>
                <FileCheck className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aguardando Ata</p>
                  <p className="text-2xl font-bold text-warning">{stats.aguardandoAta}</p>
                </div>
                <Clock className={`h-8 w-8 text-warning ${stats.aguardandoAta > 0 ? 'animate-pulse' : ''}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Ações */}
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, participante ou resumo..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-full md:w-56">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Reuniões</SelectItem>
                  <SelectItem value="com_ata">Com Ata Disponível</SelectItem>
                  <SelectItem value="aguardando">Aguardando Ata</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 flex-wrap items-center">
                <Button variant="outline" size="icon" onClick={refetch} title="Atualizar">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <EnviarGravacaoDialog onSuccess={refetch} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Reuniões */}
        {reunioesFiltradas.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-12 text-center">
              <CalendarDays className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {busca || filtroStatus !== "todas"
                  ? "Nenhuma reunião encontrada"
                  : "Nenhuma reunião registrada ainda"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {busca || filtroStatus !== "todas"
                  ? "Tente ajustar os filtros de busca."
                  : "Clique em \"Enviar Gravação\" para enviar a gravação de uma reunião e gerar a ata automaticamente."}
              </p>
              {!busca && filtroStatus === "todas" && (
                <EnviarGravacaoDialog onSuccess={refetch} />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reunioesFiltradas.map((reuniao) => (
              <CardReuniaoExecutivo
                key={reuniao.id}
                reuniao={reuniao}
                onExcluir={excluirReuniao}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Reunioes;
