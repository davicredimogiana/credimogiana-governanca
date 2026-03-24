import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Users } from 'lucide-react';

const tiposDisponiveis = [
  { value: 'diretoria', label: 'Diretoria', description: 'Membros da diretoria executiva' },
  { value: 'superintendencia', label: 'Superintendência', description: 'Superintendentes e gerentes sênior' },
  { value: 'gestores', label: 'Gestores', description: 'Gestores de área' },
  { value: 'lideres', label: 'Líderes', description: 'Líderes de equipe' },
  { value: 'cooperados', label: 'Cooperados', description: 'Cooperados em geral' },
];

interface ImportarMembrosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportar: (tipos: string[]) => Promise<boolean>;
}

export function ImportarMembrosDialog({ open, onOpenChange, onImportar }: ImportarMembrosDialogProps) {
  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleTipo = (tipo: string) => {
    setTiposSelecionados(prev =>
      prev.includes(tipo)
        ? prev.filter(t => t !== tipo)
        : [...prev, tipo]
    );
  };

  const handleImportar = async () => {
    if (tiposSelecionados.length === 0) return;

    setLoading(true);
    const sucesso = await onImportar(tiposSelecionados);
    setLoading(false);

    if (sucesso) {
      setTiposSelecionados([]);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setTiposSelecionados([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Importar Membros Cadastrados
          </DialogTitle>
          <DialogDescription>
            Selecione os tipos de membros para importar como destinatários
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {tiposDisponiveis.map((tipo) => (
            <label
              key={tipo.value}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={tiposSelecionados.includes(tipo.value)}
                onCheckedChange={() => toggleTipo(tipo.value)}
                className="mt-0.5"
              />
              <div>
                <p className="font-medium text-foreground">{tipo.label}</p>
                <p className="text-sm text-muted-foreground">{tipo.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground mt-4">
          <p>
            Membros que já foram importados anteriormente não serão duplicados.
          </p>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImportar} 
            disabled={tiposSelecionados.length === 0 || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              `Importar ${tiposSelecionados.length > 0 ? `(${tiposSelecionados.length})` : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
