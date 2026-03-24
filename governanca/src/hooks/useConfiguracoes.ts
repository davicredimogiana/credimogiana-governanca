import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ConfiguracoesSistema } from "@/types/api";

export function useConfiguracoes() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesSistema | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfiguracoes = async () => {
    try {
      setLoading(true);
      const data = await api.get<ConfiguracoesSistema>("/api/configuracoes");
      setConfiguracoes(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast({ title: "Erro ao carregar configuracoes", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async (dados: Partial<ConfiguracoesSistema>) => {
    try {
      const atualizadas = await api.put<ConfiguracoesSistema>("/api/configuracoes", dados);
      setConfiguracoes(atualizadas);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast({ title: "Erro ao salvar configuracoes", description: message, variant: "destructive" });
      return { success: false, error: message };
    }
  };

  const isEnvioAutomaticoAtivo = (tipo: "atas" | "pautas"): boolean => {
    return tipo === "atas" ? configuracoes.enviarEmailAutomatico : configuracoes.enviarEmailAutomaticoPautas;
  };

  useEffect(() => { fetchConfiguracoes(); }, []);

  return { configuracoes, loading, fetchConfiguracoes, salvarConfiguracoes, isEnvioAutomaticoAtivo };
}
