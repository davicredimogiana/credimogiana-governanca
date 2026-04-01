import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileText,
  ExternalLink,
  Users,
  CheckCircle2,
  Clock,
  Gavel,
  Zap,
  AlertTriangle,
  Lightbulb,
  Trash2,
  Loader2,
  XCircle,
  Mic,
  Brain,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ReuniaoHistorico, StatusReuniao } from "@/hooks/useReunioesHistorico";
import { ExcluirReuniaoDialog } from "./ExcluirReuniaoDialog";

interface CardReuniaoExecutivoProps {
  reuniao: ReuniaoHistorico;
  onExcluir: (reuniao: ReuniaoHistorico) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuração visual de cada status
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<StatusReuniao, {
  label: string;
  className: string;
  icon: React.ElementType;
  spin?: boolean;
  mensagem: string;
}> = {
  ata_disponivel: {
    label: 'Ata Disponível',
    className: 'bg-success/10 text-success border-success/30',
    icon: CheckCircle2,
    mensagem: '',
  },
  aguardando: {
    label: 'Aguardando',
    className: 'bg-muted/60 text-muted-foreground border-muted-foreground/20',
    icon: Clock,
    mensagem: '⏳ Na fila de processamento. A ata será gerada em breve...',
  },
  processando: {
    label: 'Processando',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    icon: Loader2,
    spin: true,
    mensagem: '⚙️ Enviando gravação para processamento...',
  },
  transcrevendo: {
    label: 'Transcrevendo',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    icon: Mic,
    mensagem: '🎙️ Transcrevendo o áudio da reunião...',
  },
  analisando: {
    label: 'Analisando',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    icon: Brain,
    mensagem: '🧠 Analisando a transcrição com IA...',
  },
  concluido: {
    label: 'Finalizado',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    icon: CheckCircle2,
    mensagem: '✅ Processamento concluído. Aguardando geração da ata...',
  },
  erro: {
    label: 'Erro',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
    icon: XCircle,
    mensagem: '❌ Ocorreu um erro durante o processamento. Tente enviar novamente.',
  },
};

export function CardReuniaoExecutivo({ reuniao, onExcluir }: CardReuniaoExecutivoProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isAtaDisponivel = reuniao.status === 'ata_disponivel';
  const config = STATUS_CONFIG[reuniao.status] ?? STATUS_CONFIG['processando'];
  const Icon = config.icon;
  const dataFormatada = format(
    new Date(reuniao.data),
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  );

  const handleExcluir = async () => {
    await onExcluir(reuniao);
  };

  return (
    <>
      <Card className="shadow-soft hover:shadow-medium transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-2" title={reuniao.titulo}>
                {reuniao.titulo}
              </CardTitle>
              <CardDescription className="mt-1">
                {dataFormatada}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={`${config.className} shrink-0 flex items-center gap-1`}
            >
              <Icon className={`h-3 w-3 ${config.spin ? 'animate-spin' : ''}`} />
              {config.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Resumo Executivo (apenas para atas) */}
          {isAtaDisponivel && reuniao.resumo_executivo && (
            <p className="text-sm text-muted-foreground line-clamp-3 italic border-l-2 border-primary/30 pl-3">
              "{reuniao.resumo_executivo}"
            </p>
          )}

          {/* Métricas (apenas para atas) */}
          {isAtaDisponivel && (
            <div className="flex flex-wrap gap-3 text-sm">
              {(reuniao.total_decisoes ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Gavel className="h-4 w-4 text-primary" />
                  <span>{reuniao.total_decisoes} {reuniao.total_decisoes === 1 ? 'Decisão' : 'Decisões'}</span>
                </div>
              )}
              {(reuniao.total_acoes ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Zap className="h-4 w-4 text-info" />
                  <span>{reuniao.total_acoes} {reuniao.total_acoes === 1 ? 'Ação' : 'Ações'}</span>
                </div>
              )}
              {(reuniao.total_riscos ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span>{reuniao.total_riscos} {reuniao.total_riscos === 1 ? 'Risco' : 'Riscos'}</span>
                </div>
              )}
              {(reuniao.total_oportunidades ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Lightbulb className="h-4 w-4 text-success" />
                  <span>{reuniao.total_oportunidades} {reuniao.total_oportunidades === 1 ? 'Oportunidade' : 'Oportunidades'}</span>
                </div>
              )}
            </div>
          )}

          {/* Participantes (para processamentos) */}
          {!isAtaDisponivel && (reuniao.participantes ?? []).length > 0 && (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                {(reuniao.participantes ?? []).slice(0, 4).join(', ')}
                {(reuniao.participantes ?? []).length > 4 && ` e mais ${(reuniao.participantes ?? []).length - 4}`}
              </p>
            </div>
          )}

          {/* Mensagem de status contextual */}
          {!isAtaDisponivel && config.mensagem && (
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              {config.mensagem}
            </p>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            {isAtaDisponivel && reuniao.ata_id && (
              <Button asChild className="flex-1">
                <Link to={`/atas?id=${reuniao.ata_id}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Ata Completa
                </Link>
              </Button>
            )}
            {reuniao.link_ata && (
              <Button variant="outline" size="icon" asChild title="Abrir ata no Drive">
                <a href={reuniao.link_ata} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            {(reuniao.link_arquivo_processado || reuniao.link_gravacao) && (
              <Button variant="outline" asChild>
                <a href={reuniao.link_arquivo_processado || reuniao.link_gravacao} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Gravação
                </a>
              </Button>
            )}
            
            {/* Botão de excluir */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Excluir</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      <ExcluirReuniaoDialog
        reuniao={reuniao}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onExcluir={handleExcluir}
      />
    </>
  );
}
