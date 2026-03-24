import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Pauta } from '@/types/api';

export function usePautas() {
  const [pautas, setPautas] = useState<Pauta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPautas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<Pauta[]>('/api/pautas');
      setPautas(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      toast({ title: 'Erro ao carregar pautas', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPautaCompleta = async (id: string): Promise<Pauta | null> => {
    try {
      return await api.get<Pauta>(`/api/pautas/${id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao carregar pauta', description: message, variant: 'destructive' });
      return null;
    }
  };

  const criarPauta = async (dados: {
    titulo: string;
    subtitulo?: string;
    contexto?: string;
    observacoes?: string;
    reuniaoId?: string;
    responsavelId?: string;
    tempoPrevisto?: number;
    objetivos?: string[];
    dadosApresentados?: { titulo: string; itens: { label: string; valor: string }[] }[];
    discussoes?: { topico: string; pontos: string[] }[];
    deliberacoes?: string[];
    encaminhamentos?: { acao: string; responsavel: string; prazo: string }[];
  }) => {
    try {
      // Montar payload para o backend
      const payload = {
        titulo: dados.titulo,
        subtitulo: dados.subtitulo,
        contexto: dados.contexto,
        observacoes: dados.observacoes,
        reuniaoId: dados.reuniaoId,
        responsavelId: dados.responsavelId,
        tempoPrevisto: dados.tempoPrevisto || 30,
        status: 'rascunho',
        objetivos: (dados.objetivos || []).map((texto, i) => ({ texto, ordem: i })),
        dados: (dados.dadosApresentados || []).flatMap((secao, _si) =>
          secao.itens.map((item, i) => ({ secaoTitulo: secao.titulo, label: item.label, valor: item.valor, ordem: i }))
        ),
        discussoes: (dados.discussoes || []).map((disc, i) => ({
          topico: disc.topico,
          ordem: i,
          pontos: (disc.pontos || []).map((texto, j) => ({ texto, ordem: j }))
        })),
        deliberacoes: (dados.deliberacoes || []).map((texto, i) => ({ texto, ordem: i })),
        encaminhamentos: (dados.encaminhamentos || []).map((enc, i) => ({ ...enc, ordem: i })),
      };

      const criada = await api.post<Pauta>('/api/pautas', payload);
      setPautas(prev => [criada, ...prev]);
      toast({ title: 'Pauta criada!', description: 'A pauta foi criada com sucesso.' });
      return { success: true, data: criada };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao criar pauta', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  const excluirPauta = async (id: string) => {
    try {
      await api.delete(`/api/pautas/${id}`);
      setPautas(prev => prev.filter(p => p.id !== id));
      toast({ title: 'Pauta excluída!' });
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao excluir', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  const atualizarStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/pautas/${id}/status`, { status });
      setPautas(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      toast({ title: 'Status atualizado!' });
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao atualizar', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  useEffect(() => { fetchPautas(); }, []);

  return { pautas, loading, error, fetchPautas, fetchPautaCompleta, criarPauta, excluirPauta, atualizarStatus };
}
