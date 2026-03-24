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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { NovoDestinatario } from '@/hooks/useDestinatarios';

interface NovoDestinatarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSalvar: (data: NovoDestinatario) => Promise<boolean>;
}

export function NovoDestinatarioDialog({ open, onOpenChange, onSalvar }: NovoDestinatarioDialogProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [grupo, setGrupo] = useState('geral');
  const [loading, setLoading] = useState(false);

  const handleSalvar = async () => {
    if (!nome.trim() || !email.trim()) return;

    setLoading(true);
    const sucesso = await onSalvar({
      nome: nome.trim(),
      email: email.trim(),
      cargo: cargo.trim() || undefined,
      grupo: grupo.trim() || 'geral',
      origem: 'manual',
    });
    setLoading(false);

    if (sucesso) {
      setNome('');
      setEmail('');
      setCargo('');
      setGrupo('geral');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setNome('');
    setEmail('');
    setCargo('');
    setGrupo('geral');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Destinatário</DialogTitle>
          <DialogDescription>
            Adicione um novo destinatário para receber comunicações
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Input
              id="cargo"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Cargo ou função"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grupo">Grupo</Label>
            <Input
              id="grupo"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              placeholder="Ex: diretoria, externos"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSalvar} 
            disabled={!nome.trim() || !email.trim() || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Adicionar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
