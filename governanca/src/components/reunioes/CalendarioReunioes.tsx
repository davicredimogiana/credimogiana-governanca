import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Building,
  MapPin,
  Clock
} from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ReuniaoDB } from "@/hooks/useTarefas";

const tipoConfig: Record<string, { label: string; color: string }> = {
  diretoria: { label: "Diretoria", color: "bg-primary text-primary-foreground" },
  gestores: { label: "Gestores", color: "bg-secondary text-secondary-foreground" },
  lideres: { label: "Líderes", color: "bg-info text-info-foreground" },
  geral: { label: "Geral", color: "bg-accent text-accent-foreground" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  agendada: { label: "Agendada", color: "bg-warning/10 text-warning border-warning/30" },
  em_andamento: { label: "Em Andamento", color: "bg-info/10 text-info border-info/30" },
  concluida: { label: "Concluída", color: "bg-success/10 text-success border-success/30" },
  cancelada: { label: "Cancelada", color: "bg-destructive/10 text-destructive border-destructive/30" },
};

interface CalendarioReunioesProps {
  reunioes: ReuniaoDB[];
  onReuniaoClick?: (reuniao: ReuniaoDB) => void;
}

export function CalendarioReunioes({ reunioes, onReuniaoClick }: CalendarioReunioesProps) {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<Date | undefined>(undefined);

  const diasDoMes = useMemo(() => {
    const inicio = startOfMonth(mesAtual);
    const fim = endOfMonth(mesAtual);
    return eachDayOfInterval({ start: inicio, end: fim });
  }, [mesAtual]);

  const reunioesPorDia = useMemo(() => {
    const map = new Map<string, ReuniaoDB[]>();
    reunioes.forEach(reuniao => {
      const key = reuniao.data;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(reuniao);
    });
    return map;
  }, [reunioes]);

  const reunioesDoMes = useMemo(() => {
    return reunioes.filter(r => {
      const data = new Date(r.data);
      return data.getMonth() === mesAtual.getMonth() && data.getFullYear() === mesAtual.getFullYear();
    });
  }, [reunioes, mesAtual]);

  const reunioesDoDia = useMemo(() => {
    if (!diaSelecionado) return [];
    const key = format(diaSelecionado, 'yyyy-MM-dd');
    return reunioesPorDia.get(key) || [];
  }, [diaSelecionado, reunioesPorDia]);

  const getDiaClasses = (dia: Date) => {
    const key = format(dia, 'yyyy-MM-dd');
    const reunioesDia = reunioesPorDia.get(key) || [];
    if (reunioesDia.length === 0) return "";
    
    const tipos = [...new Set(reunioesDia.map(r => r.tipo))];
    if (tipos.includes('diretoria')) return "bg-primary/20 text-primary font-bold";
    if (tipos.includes('gestores')) return "bg-secondary/20 text-secondary font-bold";
    if (tipos.includes('lideres')) return "bg-info/20 text-info font-bold";
    return "bg-accent/20 text-accent font-bold";
  };

  const getDiaIndicadores = (dia: Date) => {
    const key = format(dia, 'yyyy-MM-dd');
    const reunioesDia = reunioesPorDia.get(key) || [];
    return reunioesDia.length;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendário */}
      <Card className="shadow-soft lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Calendário de Reuniões
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setMesAtual(subMonths(mesAtual, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium text-foreground min-w-[140px] text-center">
                {format(mesAtual, "MMMM yyyy", { locale: ptBR })}
              </span>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setMesAtual(addMonths(mesAtual, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Header dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
              <div key={dia} className="text-center text-sm font-medium text-muted-foreground py-2">
                {dia}
              </div>
            ))}
          </div>
          
          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-1">
            {/* Espaços vazios antes do primeiro dia */}
            {Array.from({ length: getDay(startOfMonth(mesAtual)) }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20" />
            ))}
            
            {diasDoMes.map(dia => {
              const numReunioes = getDiaIndicadores(dia);
              const isSelected = diaSelecionado && isSameDay(dia, diaSelecionado);
              const isToday = isSameDay(dia, new Date());
              
              return (
                <button
                  key={dia.toISOString()}
                  onClick={() => setDiaSelecionado(dia)}
                  className={`
                    h-20 p-1 rounded-lg border transition-all text-left flex flex-col
                    ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'}
                    ${isToday ? 'bg-muted' : 'hover:bg-muted/50'}
                    ${getDiaClasses(dia)}
                  `}
                >
                  <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>
                    {format(dia, 'd')}
                  </span>
                  {numReunioes > 0 && (
                    <div className="flex-1 flex items-end">
                      <Badge variant="secondary" className="text-xs">
                        {numReunioes} {numReunioes === 1 ? 'reunião' : 'reuniões'}
                      </Badge>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
            {Object.entries(tipoConfig).map(([tipo, config]) => (
              <div key={tipo} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${config.color}`} />
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sidebar - Reuniões do dia ou do mês */}
      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {diaSelecionado 
              ? `Reuniões em ${format(diaSelecionado, "dd 'de' MMMM", { locale: ptBR })}`
              : `Próximas reuniões em ${format(mesAtual, 'MMMM', { locale: ptBR })}`
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
          {(diaSelecionado ? reunioesDoDia : reunioesDoMes.slice(0, 8)).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma reunião {diaSelecionado ? 'neste dia' : 'este mês'}
            </p>
          ) : (
            (diaSelecionado ? reunioesDoDia : reunioesDoMes.slice(0, 8)).map(reuniao => (
              <div 
                key={reuniao.id}
                className="p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => onReuniaoClick?.(reuniao)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-sm text-foreground line-clamp-2">
                    {reuniao.titulo}
                  </h4>
                  <Badge className={tipoConfig[reuniao.tipo]?.color || 'bg-muted'}>
                    {tipoConfig[reuniao.tipo]?.label || reuniao.tipo}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {format(new Date(reuniao.data), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {reuniao.horario.substring(0, 5)} ({reuniao.duracao} min)
                  </div>
                  {(reuniao.local || reuniao.plataforma) && (
                    <div className="flex items-center gap-1">
                      {reuniao.local ? <Building className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {reuniao.local || reuniao.plataforma}
                    </div>
                  )}
                </div>

                <Badge className={`mt-2 ${statusConfig[reuniao.status]?.color || ''}`}>
                  {statusConfig[reuniao.status]?.label || reuniao.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}