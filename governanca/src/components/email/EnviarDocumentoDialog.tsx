import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Plus, Loader2, Users, X } from 'lucide-react';
import { useDestinatarios } from '@/hooks/useDestinatarios';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { DestinatarioEmail } from '@/types/api';

interface DestinatarioAvulso {
  nome: string;
  email: string;
  cargo?: string;
}

interface EnviarDocumentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: 'ata' | 'pauta';
  documentoId: string;
  documentoTitulo: string;
}

export function EnviarDocumentoDialog({ open, onOpenChange, tipo, documentoId, documentoTitulo }: EnviarDocumentoDialogProps) {
  const { destinatarios, loading: loadingDestinatarios } = useDestinatarios();
  const destinatariosAtivos = destinatarios.filter(d => d.ativo);
  const grupos = [...new Set(destinatariosAtivos.map(d => d.grupo))];
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [avulsos, setAvulsos] = useState<DestinatarioAvulso[]>([]);
  const [novoAvulsoNome, setNovoAvulsoNome] = useState('');
  const [novoAvulsoEmail, setNovoAvulsoEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mostrarFormAvulso, setMostrarFormAvulso] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && destinatariosAtivos.length > 0) {
      setSelecionados(new Set(destinatariosAtivos.map(d => d.id)));
    }
  }, [open, destinatariosAtivos.length]);

  const toggleDestinatario = (id: string) => {
    setSelecionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const adicionarAvulso = () => {
    if (!novoAvulsoNome.trim() || !novoAvulsoEmail.trim()) return;
    setAvulsos(prev => [...prev, { nome: novoAvulsoNome.trim(), email: novoAvulsoEmail.trim() }]);
    setNovoAvulsoNome('');
    setNovoAvulsoEmail('');
    setMostrarFormAvulso(false);
  };

  const removerAvulso = (index: number) => setAvulsos(prev => prev.filter((_, i) => i !== index));

  const handleEnviar = async () => {
    const destinatariosSelecionados = destinatariosAtivos
      .filter(d => selecionados.has(d.id))
      .map(d => ({ nome: d.nome, email: d.email, cargo: d.cargo || '' }));
    const todosDestinatarios = [...destinatariosSelecionados, ...avulsos.map(a => ({ nome: a.nome, email: a.email, cargo: a.cargo || '' }))];
    if (todosDestinatarios.length === 0) {
      toast({ title: 'Nenhum destinatário', description: 'Selecione ao menos um destinatário para enviar.', variant: 'destructive' });
      return;
    }
    setEnviando(true);
    try {
      const endpoint = tipo === 'ata' ? `/api/atas/${documentoId}/enviar` : `/api/pautas/${documentoId}/enviar`;
      await api.post(endpoint, { destinatarios: todosDestinatarios });
      toast({ title: 'E-mail enviado!', description: `${tipo === 'ata' ? 'Ata' : 'Pauta'} enviada para ${todosDestinatarios.length} destinatário(s).` });
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast({ title: 'Erro ao enviar', description: 'Não foi possível enviar o e-mail. Tente novamente.', variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  };

  const handleClose = () => {
    setSelecionados(new Set());
    setAvulsos([]);
    setMostrarFormAvulso(false);
    onOpenChange(false);
  };

  const totalSelecionados = selecionados.size + avulsos.length;
  const destinatariosPorGrupo = grupos.reduce((acc, grupo) => {
    acc[grupo] = destinatariosAtivos.filter(d => d.grupo === grupo);
    return acc;
  }, {} as Record<string, DestinatarioEmail[]>);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Enviar {tipo === 'ata' ? 'Ata' : 'Pauta'} por E-mail
          </DialogTitle>
          <DialogDescription>
            Selecione os destinatários para enviar: <strong>{documentoTitulo}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <Label>Destinatários</Label>
            <Button variant="ghost" size="sm" onClick={() => setMostrarFormAvulso(!mostrarFormAvulso)}>
              <Plus className="w-4 h-4 mr-1" />Adicionar avulso
            </Button>
          </div>
          {mostrarFormAvulso && (
            <div className="p-3 border rounded-lg space-y-2 bg-muted/30">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Nome" value={novoAvulsoNome} onChange={e => setNovoAvulsoNome(e.target.value)} />
                <Input placeholder="E-mail" type="email" value={novoAvulsoEmail} onChange={e => setNovoAvulsoEmail(e.target.value)} />
              </div>
              <Button onClick={adicionarAvulso} size="sm">Adicionar</Button>
            </div>
          )}
          <ScrollArea className="h-[300px] border rounded-lg">
            <div className="p-4 space-y-4">
              {loadingDestinatarios ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {Object.entries(destinatariosPorGrupo).map(([grupo, dests]) =>
                    dests.length > 0 && (
                      <div key={grupo}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{grupo}</p>
                        <div className="space-y-1">
                          {dests.map(dest => (
                            <label key={dest.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                              <Checkbox checked={selecionados.has(dest.id)} onCheckedChange={() => toggleDestinatario(dest.id)} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{dest.nome}</p>
                                <p className="text-xs text-muted-foreground truncate">{dest.email}</p>
                              </div>
                              {dest.cargo && <Badge variant="secondary" className="text-xs">{dest.cargo}</Badge>}
                            </label>
                          ))}
                        </div>
                        <Separator className="mt-3" />
                      </div>
                    )
                  )}
                  {avulsos.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Avulsos (apenas este envio)</p>
                      <div className="space-y-1">
                        {avulsos.map((avulso, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded bg-primary/5">
                            <Checkbox checked disabled />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{avulso.nome}</p>
                              <p className="text-xs text-muted-foreground truncate">{avulso.email}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removerAvulso(i)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {destinatariosAtivos.length === 0 && avulsos.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum destinatário cadastrado.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
          <div className="text-sm text-muted-foreground">{totalSelecionados} destinatário(s) selecionado(s)</div>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleEnviar} disabled={totalSelecionados === 0 || enviando}>
            {enviando ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><Mail className="w-4 h-4 mr-2" />Enviar E-mail</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
