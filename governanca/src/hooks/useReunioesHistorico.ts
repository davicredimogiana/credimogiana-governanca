import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Ata, ProcessamentoGravacao } from '@/types/api';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos de status do frontend
// Regra de negócio: 'ata_disponivel' SEMPRE prevalece sobre qualquer outro status.
// Um processamento com status 'concluido' só vira 'ata_disponivel' se existir
// uma ata vinculada ao mesmo processamento_id / reuniaoId.
// ─────────────────────────────────────────────────────────────────────────────
export type StatusReuniao =
  | 'ata_disponivel'   // ata já gerada e disponível para leitura
  | 'aguardando'       // na fila, ainda não iniciou
  | 'processando'      // upload recebido, enviando para N8N
  | 'transcrevendo'    // N8N está transcrevendo o áudio
  | 'analisando'       // N8N está analisando a transcrição com IA
  | 'concluido'        // backend concluiu, mas ata ainda não chegou
  | 'erro';            // falha em alguma etapa

export interface ReuniaoHistorico {
  id: string;
  tipo: 'ata' | 'processamento';
  titulo: string;
  data: string;
  participantes: string[];
  status: StatusReuniao;
  status_raw?: string;           // status original do backend (para debug)
  resumo_executivo?: string;
  link_ata?: string;
  link_auditoria?: string;
  total_decisoes?: number;
  total_acoes?: number;
  total_riscos?: number;
  total_oportunidades?: number;
  ata_id?: string;
  link_gravacao?: string;
  link_arquivo_processado?: string;
  processamento_id?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapeamento: status do backend → status do frontend
// ─────────────────────────────────────────────────────────────────────────────
function mapearStatus(backendStatus: string, temAta: boolean): StatusReuniao {
  // Regra principal: se existe ata vinculada, sempre mostra 'ata_disponivel'
  if (temAta) return 'ata_disponivel';

  switch (backendStatus?.toLowerCase()) {
    case 'ata_disponivel': return 'ata_disponivel'; // backend já sinalizou diretamente
    case 'aguardando':     return 'aguardando';
    case 'processando':    return 'processando';
    case 'transcrevendo':  return 'transcrevendo';
    case 'analisando':     return 'analisando';
    case 'concluido':      return 'concluido';   // concluido SEM ata
    case 'erro':           return 'erro';
    default:               return 'processando'; // fallback seguro
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Chave de cache compartilhada
// ─────────────────────────────────────────────────────────────────────────────
export const REUNIOES_HISTORICO_KEY = ['reunioes-historico'] as const;

function extrairTituloDoMarkdown(markdown: string): string {
  const match = markdown?.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : 'Reunião';
}

function extrairParticipantesDoMarkdown(markdown: string): string[] {
  const match = markdown?.match(/participantes?[:\s]+([^\n]+)/i);
  if (!match) return [];
  return match[1].split(/[,;]/).map(p => p.trim()).filter(Boolean);
}

async function fetchHistoricoFn(): Promise<ReuniaoHistorico[]> {
  const [atas, processamentos] = await Promise.all([
    api.get<Ata[]>('/api/atas'),
    api.get<ProcessamentoGravacao[]>('/api/processamentos'),
  ]);

  const atasSafe = atas ?? [];
  const processamentosSafe = processamentos ?? [];

  // Conjunto de IDs de processamentos que já têm ata — usado para aplicar
  // a regra "ata_disponivel prevalece sobre concluido"
  const processamentosComAta = new Set<string>(
    atasSafe
      .map(a => a.reuniaoId)
      .filter((id): id is string => Boolean(id))
  );

  // ── Atas ──────────────────────────────────────────────────────────────────
  const atasFormatadas: ReuniaoHistorico[] = atasSafe.map(ata => ({
    id: ata.id,
    tipo: 'ata' as const,
    titulo: extrairTituloDoMarkdown(ata.conteudoMarkdown),
    data: ata.geradaEm || '',
    participantes: extrairParticipantesDoMarkdown(ata.conteudoMarkdown),
    status: 'ata_disponivel' as const,
    status_raw: 'ata_disponivel',
    resumo_executivo: ata.analise?.resumo,
    total_decisoes: ata.analise?.decisoes?.length ?? 0,
    total_acoes: ata.analise?.acoes?.length ?? 0,
    total_riscos: ata.analise?.riscos?.length ?? 0,
    total_oportunidades: ata.analise?.oportunidades?.length ?? 0,
    ata_id: ata.id,
  }));

  // ── Processamentos ────────────────────────────────────────────────────────
  // Exibe TODOS os processamentos que não são 'concluido com ata' nem 'erro'
  // (erros são exibidos para que o usuário saiba que algo falhou)
  const processamentosVisiveis = processamentosSafe.filter(p => {
    const temAta = processamentosComAta.has(p.id);
    if (temAta) return false;                    // já representado como ata
    return true;                                 // mostra todos os demais
  });

  const processamentosFormatados: ReuniaoHistorico[] = processamentosVisiveis.map(proc => {
    const temAta = processamentosComAta.has(proc.id);
    const statusFront = mapearStatus(proc.status, temAta);
    return {
      id: proc.id,
      tipo: 'processamento' as const,
      titulo: `Reunião de ${format(new Date(proc.createdAt), "dd 'de' MMMM", { locale: ptBR })}`,
      data: proc.createdAt,
      participantes: proc.participantes ?? [],
      status: statusFront,
      status_raw: proc.status,
      link_gravacao: proc.linkArquivoProcessado || proc.linkDrive,
      link_arquivo_processado: proc.linkArquivoProcessado,
      processamento_id: proc.id,
    };
  });

  return [...atasFormatadas, ...processamentosFormatados]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export function useReunioesHistorico() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reunioes = [], isLoading: loading, isFetching } = useQuery({
    queryKey: REUNIOES_HISTORICO_KEY,
    queryFn: fetchHistoricoFn,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  async function excluirReuniao(reuniao: ReuniaoHistorico): Promise<void> {
    try {
      if (reuniao.tipo === 'ata' && reuniao.ata_id) {
        await api.delete(`/api/atas/${reuniao.ata_id}`);
        toast({ title: 'Reunião excluída', description: 'A ata e todos os dados relacionados foram removidos.' });
      } else if (reuniao.tipo === 'processamento' && reuniao.processamento_id) {
        await api.delete(`/api/processamentos/${reuniao.processamento_id}`);
        toast({ title: 'Processamento excluído', description: 'O registro de processamento foi removido.' });
      }
      await queryClient.invalidateQueries({ queryKey: REUNIOES_HISTORICO_KEY });
    } catch (error) {
      console.error('Erro ao excluir reunião:', error);
      toast({ title: 'Erro ao excluir', description: 'Não foi possível excluir a reunião. Tente novamente.', variant: 'destructive' });
      throw error;
    }
  }

  async function invalidateAndRefetch() {
    await queryClient.invalidateQueries({ queryKey: REUNIOES_HISTORICO_KEY });
  }

  const stats = {
    total: reunioes.length,
    atasDisponiveis: reunioes.filter(r => r.status === 'ata_disponivel').length,
    aguardandoAta: reunioes.filter(r =>
      r.status === 'aguardando' ||
      r.status === 'processando' ||
      r.status === 'transcrevendo' ||
      r.status === 'analisando'
    ).length,
    comErro: reunioes.filter(r => r.status === 'erro').length,
  };

  return { reunioes, loading, isFetching, stats, excluirReuniao, refetch: invalidateAndRefetch };
}
