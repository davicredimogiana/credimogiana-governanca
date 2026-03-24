import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { TarefaDelegada, Reuniao, Membro } from '@/types/api';

// Tipos de compatibilidade para o EnviarGravacaoDialog e página Membros
export type ReuniaoDB = Reuniao;
export type TarefaDB = TarefaDelegada;
export type MembroDB = Membro;

export function useTarefas() {
  const [tarefas, setTarefas] = useState<TarefaDelegada[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTarefas = async () => {
    try {
      setLoading(true);
      const data = await api.get<TarefaDelegada[]>('/api/tarefas');
      setTarefas(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao carregar tarefas', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const criarTarefa = async (dados: Partial<TarefaDelegada>) => {
    try {
      const criada = await api.post<TarefaDelegada>('/api/tarefas', dados);
      setTarefas(prev => [criada, ...prev]);
      toast({ title: 'Tarefa criada!' });
      return { success: true, data: criada };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao criar tarefa', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  const atualizarTarefa = async (id: string, dados: Partial<TarefaDelegada>) => {
    try {
      const atualizada = await api.put<TarefaDelegada>(`/api/tarefas/${id}`, dados);
      setTarefas(prev => prev.map(t => t.id === id ? atualizada : t));
      toast({ title: 'Tarefa atualizada!' });
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao atualizar', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  const excluirTarefa = async (id: string) => {
    try {
      await api.delete(`/api/tarefas/${id}`);
      setTarefas(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Tarefa excluída!' });
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao excluir', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  useEffect(() => { fetchTarefas(); }, []);

  return { tarefas, loading, fetchTarefas, criarTarefa, atualizarTarefa, excluirTarefa };
}

export function useReunioes() {
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    api.get<Reuniao[]>('/api/reunioes')
      .then(data => setReunioes(data || []))
      .catch(err => {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        toast({ title: 'Erro ao carregar reuniões', description: message, variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, []);

  return { reunioes, loading };
}

export function useMembros(apenasAtivos = false) {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembros = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<Membro[]>('/api/membros');
      const lista = data || [];
      setMembros(apenasAtivos ? lista.filter(m => m.ativo) : lista);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao carregar membros', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [apenasAtivos, toast]);

  const criarMembro = async (dados: { nome: string; email: string; cargo: string; tipo: string }) => {
    try {
      const criado = await api.post<Membro>('/api/membros', { ...dados, ativo: true });
      setMembros(prev => [criado, ...prev]);
      toast({ title: 'Membro adicionado!', description: `${dados.nome} foi cadastrado com sucesso.` });
      return { success: true, data: criado };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao adicionar membro', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  const atualizarMembro = async (id: string, dados: Partial<Membro>) => {
    try {
      const atualizado = await api.put<Membro>(`/api/membros/${id}`, dados);
      setMembros(prev => prev.map(m => m.id === id ? atualizado : m));
      toast({ title: 'Membro atualizado!' });
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao atualizar membro', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  const excluirMembro = async (id: string) => {
    try {
      await api.delete(`/api/membros/${id}`);
      setMembros(prev => prev.filter(m => m.id !== id));
      toast({ title: 'Membro removido!' });
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao remover membro', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  useEffect(() => { fetchMembros(); }, [fetchMembros]);

  return { membros, loading, fetchMembros, criarMembro, atualizarMembro, excluirMembro };
}
