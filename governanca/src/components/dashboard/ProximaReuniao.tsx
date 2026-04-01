import { Calendar, Clock, MapPin, Users, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Reuniao } from "@/types/governance";
import { format, parseISO, differenceInDays, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ProximaReuniaoProps {
  reuniao: Reuniao;
  onVerDetalhes?: () => void;
}

export function ProximaReuniao({ reuniao, onVerDetalhes }: ProximaReuniaoProps) {
  const dataReuniao = parseISO(`${reuniao.data}T${reuniao.horario}`);
  const agora = new Date();
  const diasRestantes = differenceInDays(dataReuniao, agora);
  const horasRestantes = differenceInHours(dataReuniao, agora);

  const getTempoRestante = () => {
    if (diasRestantes > 1) return `em ${diasRestantes} dias`;
    if (diasRestantes === 1) return "amanhã";
    if (horasRestantes > 0) return `em ${horasRestantes} horas`;
    return "em breve";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-elevated">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-secondary/20 blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium">Próxima Reunião</p>
            <p className="text-2xl font-bold mt-1">{reuniao.titulo}</p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
            <span className="text-sm font-medium">{getTempoRestante()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white/10">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/60">Data</p>
              <p className="font-medium text-sm">
                {format(parseISO(reuniao.data), "dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white/10">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/60">Horário</p>
              <p className="font-medium text-sm">{reuniao.horario}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white/10">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/60">Participantes</p>
              <p className="font-medium text-sm">{(reuniao.participantes ?? []).length} pessoas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white/10">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/60">Pautas</p>
              <p className="font-medium text-sm">{(reuniao.pautas ?? []).length} itens</p>
            </div>
          </div>
        </div>

        {/* Participantes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {(reuniao.participantes ?? []).slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="w-8 h-8 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center"
                  title={p.nome}
                >
                  <span className="text-xs font-medium">
                    {p.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
              ))}
              {(reuniao.participantes ?? []).length > 5 && (
                <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-primary flex items-center justify-center">
                  <span className="text-xs font-medium">
                    +{(reuniao.participantes ?? []).length - 5}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={onVerDetalhes}
            className="bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
          >
            Ver detalhes
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
