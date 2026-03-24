import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import type { ReuniaoHistorico } from "@/hooks/useReunioesHistorico";

interface ExcluirReuniaoDialogProps {
  reuniao: ReuniaoHistorico;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExcluir: () => Promise<void>;
}

export function ExcluirReuniaoDialog({
  reuniao,
  open,
  onOpenChange,
  onExcluir,
}: ExcluirReuniaoDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleExcluir = async () => {
    setLoading(true);
    try {
      await onExcluir();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const tipoLabel = reuniao.tipo === 'ata' ? 'reunião e sua ata' : 'processamento';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>⚠️ Excluir Reunião</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja excluir esta {tipoLabel}?
            </p>
            <p className="font-medium text-foreground">
              "{reuniao.titulo}"
            </p>
            {reuniao.tipo === 'ata' && (
              <p className="text-destructive">
                Todos os dados relacionados serão excluídos: decisões, ações, riscos e oportunidades extraídos pela IA.
              </p>
            )}
            <p className="font-semibold">
              Esta ação não pode ser desfeita.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleExcluir}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
