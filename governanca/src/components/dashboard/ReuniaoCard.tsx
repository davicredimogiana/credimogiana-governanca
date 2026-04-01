import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Reuniao } from "@/types/governance";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReuniaoCardProps {
  reuniao: Reuniao;
  compacto?: boolean;
  onClick?: () => void;
}

const statusConfig = {
  agendada: { label: "Agendada", classe: "status-badge-info" },
  em_andamento: { label: "Em andamento", classe: "status-badge-warning" },
  concluida: { label: "Concluída", classe: "status-badge-success" },
  cancelada: { label: "Cancelada", classe: "status-badge-error" },
};

const tipoConfig = {
  diretoria: { label: "Diretoria", classe: "member-badge-diretoria" },
  gestores: { label: "Gestores", classe: "member-badge-gestor" },
  lideres: { label: "Líderes", classe: "member-badge-lider" },
  geral: { label: "Geral", classe: "member-badge-cooperado" },
};

export function ReuniaoCard({ reuniao, compacto = false, onClick }: ReuniaoCardProps) {
  const dataFormatada = format(parseISO(reuniao.data), "dd 'de' MMMM", { locale: ptBR });
  const status = statusConfig[reuniao.status];
  const tipo = tipoConfig[reuniao.tipo];

  if (compacto) {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
      >
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-primary leading-none">
            {format(parseISO(reuniao.data), "dd")}
          </span>
          <span className="text-[10px] uppercase text-primary/70">
            {format(parseISO(reuniao.data), "MMM", { locale: ptBR })}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {reuniao.titulo}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {reuniao.horario}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {(reuniao.participantes ?? []).length}
            </span>
          </div>
        </div>
        <span className={cn("status-badge", status.classe)}>{status.label}</span>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border bg-card shadow-soft hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={cn("member-badge", tipo.classe)}>{tipo.label}</span>
            <span className={cn("status-badge", status.classe)}>{status.label}</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mt-2">{reuniao.titulo}</h3>
          {reuniao.descricao && (
            <p className="text-sm text-muted-foreground line-clamp-2">{reuniao.descricao}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{dataFormatada}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{reuniao.horario} ({reuniao.duracao}min)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{(reuniao.participantes ?? []).length} participantes</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {reuniao.local ? (
            <>
              <MapPin className="w-4 h-4" />
              <span className="truncate">{reuniao.local}</span>
            </>
          ) : reuniao.plataforma ? (
            <>
              <Video className="w-4 h-4" />
              <span>{reuniao.plataforma}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="flex -space-x-2">
          {(reuniao.participantes ?? []).slice(0, 4).map((p, i) => (
            <div
              key={p.id}
              className="w-8 h-8 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center"
              title={p.nome}
            >
              <span className="text-xs font-medium text-primary">
                {p.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </span>
            </div>
          ))}
          {(reuniao.participantes ?? []).length > 4 && (
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                +{(reuniao.participantes ?? []).length - 4}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={onClick}>
          Ver detalhes
        </Button>
      </div>
    </div>
  );
}
