import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { DestinatarioEmail } from '@/types/api';

export function useDestinatarios() {
  const [destinatarios, setDestinatarios] = useState<DestinatarioEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDestinatarios = async () => {
    try {
      setLoading(true);
      const data = await api.get<DestinatarioEmail[]>('/api/destinatarios');
      setDestinatarios(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao carregar destinatários', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const criarDestinatario = async (dados: Omit<DestinatarioEmail, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const criado = await api.post<DestinatarioEmail>('/api/destinatarios', dados);
      setDestinatarios(prev => [...prev, criado]);
      toast({ title: 'Destinatário adicionado!' });
      return { success: true, data: criado };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao adicionar', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  const atualizarDestinatario = async (id: string, dados: Partial<DestinatarioEmail>) => {
    try {
      const atualizado = await api.put<DestinatarioEmail>(`/api/destinatarios/${id}`, dados);
      setDestinatarios(prev => prev.map(d => d.id === id ? atualizado : d));
      toast({ title: 'Destinatário atualizado!' });
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao atualizar', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  const excluirDestinatario = async (id: string) => {
    try {
      await api.delete(`/api/destinatarios/${id}`);
      setDestinatarios(prev => prev.filter(d => d.id !== id));
      toast({ title: 'Destinatário removido!' });
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao remover', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  const importarLote = async (destinatariosLote: Omit<DestinatarioEmail, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      const result = await api.post<{ importados: number }>('/api/destinatarios/lote', destinatariosLote);
      await fetchDestinatarios();
      toast({ title: `${result.importados} destinatários importados!` });
      return { success: true, importados: result.importados };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao importar', description: message, variant: 'destructive' });
      return { success: false, error: message };
    }
  };

  useEffect(() => { fetchDestinatarios(); }, []);

  return { destinatarios, loading, fetchDestinatarios, criarDestinatario, atualizarDestinatario, excluirDestinatario, importarLote };
}
