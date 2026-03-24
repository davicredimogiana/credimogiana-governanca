import { useState, useEffect } from "react";
import { FileText, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Ata } from "@/types/api";

export function UltimasAtas() {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Ata[]>('/api/atas')
      .then(data => setAtas((data || []).slice(0, 5)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-foreground mb-6">Últimas Atas</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Últimas Atas</h3>
        <button onClick={() => navigate('/atas')} className="text-sm text-primary hover:underline">
          Ver todas
        </button>
      </div>
      {atas.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma ata processada ainda.</p>
      ) : (
        <div className="space-y-4">
          {atas.map((ata) => (
            <div
              key={ata.id}
              onClick={() => navigate('/atas')}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm line-clamp-1">
                  {ata.analise?.resumo ? ata.analise.resumo.substring(0, 60) + '...' : 'Ata de Reunião'}
                </p>
                {ata.analise?.resumo && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ata.analise.resumo}</p>
                )}
                {ata.geradaEm && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(ata.geradaEm), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
