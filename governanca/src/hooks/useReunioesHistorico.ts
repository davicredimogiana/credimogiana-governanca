import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Ata, ProcessamentoGravacao } from '@/types/api';

export interface ReuniaoHistorico {
  id: string;
  tipo: 'ata' | 'processamento';
  titulo: string;
  data: string;
  participantes: string[];
  status: 'ata_disponivel' | 'processando' | 'erro';
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

// Chave de cache compartilhada — qualquer componente que invalide esta chave
// fará com que TODOS os consumidores do hook recarreguem automaticamente.
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

  const atasFormatadas: ReuniaoHistorico[] = (atas || []).map(ata => ({
    id: ata.id,
    tipo: 'ata' as const,
    titulo: extrairTituloDoMarkdown(ata.conteudoMarkdown),
    data: ata.geradaEm || '',
    participantes: extrairParticipantesDoMarkdown(ata.conteudoMarkdown),
    status: 'ata_disponivel' as const,
    resumo_executivo: ata.analise?.resumo,
    total_decisoes: ata.analise?.decisoes?.length || 0,
    total_acoes: ata.analise?.acoes?.length || 0,
    total_riscos: ata.analise?.riscos?.length || 0,
    total_oportunidades: ata.analise?.oportunidades?.length || 0,
    ata_id: ata.id,
  }));

  const processamentosAtivos = (processamentos || []).filter(
    p => p.status !== 'concluido' && p.status !== 'erro'
  );

  const processamentosFormatados: ReuniaoHistorico[] = processamentosAtivos.map(proc => ({
    id: proc.id,
    tipo: 'processamento' as const,
    titulo: `Reunião de ${format(new Date(proc.createdAt), "dd 'de' MMMM", { locale: ptBR })}`,
    data: proc.createdAt,
    participantes: proc.participantes || [],
    status: 'processando' as const,
    link_gravacao: proc.linkArquivoProcessado || proc.linkDrive,
    link_arquivo_processado: proc.linkArquivoProcessado,
    processamento_id: proc.id,
  }));

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
    aguardandoAta: reunioes.filter(r => r.status === 'processando').length,
  };

  return { reunioes, loading, isFetching, stats, excluirReuniao, refetch: invalidateAndRefetch };
}
