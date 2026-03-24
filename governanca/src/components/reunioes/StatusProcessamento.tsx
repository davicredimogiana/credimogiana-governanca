import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  AlertCircle, 
  Upload, 
  Cloud, 
  FileAudio, 
  FileText,
  ExternalLink
} from 'lucide-react';
import { ProcessamentoGravacao } from '@/hooks/useProcessamentos';
import { Button } from '@/components/ui/button';

interface StatusProcessamentoProps {
  processamento: ProcessamentoGravacao;
  compact?: boolean;
}

const etapas = [
  { key: 'enviando', label: 'Enviando arquivo', icon: Upload },
  { key: 'enviado_drive', label: 'Salvo no Google Drive', icon: Cloud },
  { key: 'transcrevendo', label: 'Transcrevendo áudio', icon: FileAudio },
  { key: 'gerando_ata', label: 'Gerando ata com IA', icon: FileText },
  { key: 'arquivando', label: 'Arquivando gravação', icon: Cloud },
  { key: 'concluido', label: 'Concluído', icon: CheckCircle2 },
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'concluido':
      return <Badge className="bg-success text-success-foreground">Concluído</Badge>;
    case 'erro':
      return <Badge variant="destructive">Erro</Badge>;
    default:
      return <Badge variant="secondary">Em processamento</Badge>;
  }
}

export function StatusProcessamento({ processamento, compact = false }: StatusProcessamentoProps) {
  const currentStepIndex = etapas.findIndex(e => e.key === processamento.status);
  const isError = processamento.status === 'erro';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isError ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : processamento.status === 'concluido' ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : (
          <Loader2 className="h-4 w-4 text-info animate-spin" />
        )}
        <span className="text-sm text-muted-foreground truncate max-w-[150px]">
          {processamento.etapa_atual || processamento.status}
        </span>
        {processamento.link_drive && (
          <a 
            href={processamento.link_drive} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {processamento.nome_arquivo}
          </CardTitle>
          {getStatusBadge(processamento.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{processamento.etapa_atual || 'Aguardando...'}</span>
            <span>{processamento.progresso}%</span>
          </div>
          <Progress value={processamento.progresso} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {etapas.map((etapa, index) => {
            const Icon = etapa.icon;
            const isCompleted = index < currentStepIndex || processamento.status === 'concluido';
            const isCurrent = index === currentStepIndex && processamento.status !== 'concluido';
            
            return (
              <div 
                key={etapa.key} 
                className={`flex items-center gap-2 text-sm ${
                  isCompleted 
                    ? 'text-success' 
                    : isCurrent 
                      ? 'text-info font-medium' 
                      : 'text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                <span>{etapa.label}</span>
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {isError && processamento.erro_mensagem && (
          <div className="p-2 bg-destructive/10 rounded text-sm text-destructive">
            {processamento.erro_mensagem}
          </div>
        )}

        {/* Drive link */}
        {processamento.link_drive && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            asChild
          >
            <a 
              href={processamento.link_drive} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir no Google Drive
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
