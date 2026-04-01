import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { DestinatarioEmail } from '@/types/api';

// Tipo exportado para uso nos dialogs e na página
export type Destinatario = DestinatarioEmail;

export interface NovoDestinatario {
  nome: string;
  email: string;
  cargo?: string;
  grupo: string;
  origem?: string;
}

export function useDestinatarios() {
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDestinatarios = async () => {
    try {
      setLoading(true);
      const data = await api.get<Destinatario[]>('/api/destinatarios');
      setDestinatarios(data ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao carregar destinatários', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // addDestinatario — usado pela página e pelo NovoDestinatarioDialog
  const addDestinatario = async (dados: NovoDestinatario): Promise<boolean> => {
    try {
      const criado = await api.post<Destinatario>('/api/destinatarios', {
        ...dados,
        origem: dados.origem ?? 'manual',
        ativo: true,
      });
      setDestinatarios(prev => [...prev, criado]);
      toast({ title: 'Destinatário adicionado!' });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao adicionar', description: message, variant: 'destructive' });
      return false;
    }
  };

  // updateDestinatario — usado pela página no handleSalvarEdicao
  const updateDestinatario = async (id: string, dados: Partial<Destinatario>): Promise<boolean> => {
    try {
      const atualizado = await api.put<Destinatario>(`/api/destinatarios/${id}`, dados);
      setDestinatarios(prev => prev.map(d => d.id === id ? atualizado : d));
      toast({ title: 'Destinatário atualizado!' });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao atualizar', description: message, variant: 'destructive' });
      return false;
    }
  };

  // deleteDestinatario — usado pela página no handleExcluir
  const deleteDestinatario = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/api/destinatarios/${id}`);
      setDestinatarios(prev => prev.filter(d => d.id !== id));
      toast({ title: 'Destinatário removido!' });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao remover', description: message, variant: 'destructive' });
      return false;
    }
  };

  // toggleAtivo — usado pelo Switch na lista
  const toggleAtivo = async (id: string, ativo: boolean): Promise<void> => {
    try {
      const atualizado = await api.put<Destinatario>(`/api/destinatarios/${id}`, { ativo });
      setDestinatarios(prev => prev.map(d => d.id === id ? atualizado : d));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao atualizar status', description: message, variant: 'destructive' });
    }
  };

  // importarCSV — usado pelo ImportarCSVDialog: recebe conteúdo CSV e grupo
  const importarCSV = async (conteudo: string, grupo: string): Promise<boolean> => {
    try {
      const linhas = conteudo.split('\n').filter(l => l.trim());
      const novos: NovoDestinatario[] = [];
      for (const linha of linhas) {
        const partes = linha.split(/[,;]/).map(p => p.trim());
        const nome = partes[0];
        const email = partes[1];
        const cargo = partes[2];
        if (nome && email && email.includes('@')) {
          novos.push({ nome, email, cargo, grupo, origem: 'csv' });
        }
      }
      if (novos.length === 0) {
        toast({ title: 'Nenhum destinatário válido encontrado no CSV', variant: 'destructive' });
        return false;
      }
      const result = await api.post<{ importados: number }>('/api/destinatarios/lote', novos);
      await fetchDestinatarios();
      toast({ title: `${result.importados} destinatários importados via CSV!` });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao importar CSV', description: message, variant: 'destructive' });
      return false;
    }
  };

  // importarMembros — usado pelo ImportarMembrosDialog: recebe array de tipos de membro
  const importarMembros = async (tipos: string[]): Promise<boolean> => {
    try {
      const result = await api.post<{ importados: number }>('/api/destinatarios/importar-membros', { tipos });
      await fetchDestinatarios();
      toast({ title: `${result.importados} membros importados como destinatários!` });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao importar membros', description: message, variant: 'destructive' });
      return false;
    }
  };

  useEffect(() => { fetchDestinatarios(); }, []);

  // grupos: lista única de grupos presentes nos destinatários
  const grupos = [...new Set(destinatarios.map(d => d.grupo).filter(Boolean))].sort();

  return {
    destinatarios,
    grupos,
    loading,
    fetchDestinatarios,
    // Nomes usados pela página Destinatarios.tsx e pelos dialogs
    addDestinatario,
    updateDestinatario,
    deleteDestinatario,
    toggleAtivo,
    importarCSV,
    importarMembros,
    // Aliases com nomes alternativos (compatibilidade retroativa)
    criarDestinatario: addDestinatario,
    atualizarDestinatario: updateDestinatario,
    excluirDestinatario: deleteDestinatario,
  };
}
