import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { EnvioEmail } from '@/types/api';

export function useEnviosEmail() {
  const [envios, setEnvios] = useState<EnvioEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEnvios = async () => {
    try {
      setLoading(true);
      const data = await api.get<EnvioEmail[]>('/api/envios-email');
      setEnvios(data ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao carregar envios', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnvios(); }, []);

  return { envios, loading, fetchEnvios };
}
