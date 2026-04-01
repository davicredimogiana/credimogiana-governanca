import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { ProcessamentoGravacao } from '@/types/api';

export function useProcessamentos(reuniaoId?: string) {
  const [processamentos, setProcessamentos] = useState<ProcessamentoGravacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchProcessamentos = async () => {
    try {
      const path = reuniaoId ? `/api/processamentos?reuniaoId=${reuniaoId}` : '/api/processamentos';
      const data = await api.get<ProcessamentoGravacao[]>(path);
      setProcessamentos(data ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao carregar processamentos:', message);
    } finally {
      setLoading(false);
    }
  };

  const criarProcessamento = async (dados: Partial<ProcessamentoGravacao>) => {
    try {
      const criado = await api.post<ProcessamentoGravacao>('/api/processamentos', dados);
      setProcessamentos(prev => [criado, ...prev]);
      return { success: true, data: criado };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao criar processamento', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  const atualizarProcessamento = async (id: string, dados: Partial<ProcessamentoGravacao>) => {
    try {
      const atualizado = await api.put<ProcessamentoGravacao>(`/api/processamentos/${id}`, dados);
      setProcessamentos(prev => prev.map(p => p.id === id ? atualizado : p));
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao atualizar processamento:', message);
      return { success: false, error: message };
    }
  };

  const excluirProcessamento = async (id: string) => {
    try {
      await api.delete(`/api/processamentos/${id}`);
      setProcessamentos(prev => prev.filter(p => p.id !== id));
      toast({ title: 'Processamento excluído!' });
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao excluir', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  // Polling para substituir o realtime do Supabase
  const iniciarPolling = (intervalo = 5000) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(fetchProcessamentos, intervalo);
  };

  const pararPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    fetchProcessamentos();
    return () => pararPolling();
  }, [reuniaoId]);

  return { processamentos, loading, fetchProcessamentos, criarProcessamento, atualizarProcessamento, excluirProcessamento, iniciarPolling, pararPolling };
}
