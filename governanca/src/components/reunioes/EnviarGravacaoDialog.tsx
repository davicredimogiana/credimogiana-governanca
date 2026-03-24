import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Send,
  Upload,
  FileAudio,
  Users,
  Target,
  MessageSquare,
  CheckSquare,
  Loader2,
  X,
  Plus,
  AlertCircle,
  CloudUpload,
  Clock,
} from 'lucide-react';
import { SignatureCanvas } from '@/components/ui/signature-canvas';
import { useReunioes, useTarefas, useMembros, type ReuniaoDB, type TarefaDB } from '@/hooks/useTarefas';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Pauta } from '@/types/api';

interface Assinatura {
  nome: string;
  imagem: string | null;
  hora: string;
}

export function EnviarGravacaoDialog() {
  const { reunioes, loading: loadingReunioes } = useReunioes();
  const { tarefas } = useTarefas();
  const { membros } = useMembros(true);
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadEtapa, setUploadEtapa] = useState<string>('');

  const [reuniaoId, setReuniaoId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [participantes, setParticipantes] = useState<string[]>([]);
  const [novoParticipante, setNovoParticipante] = useState('');
  const [tarefasMarcadas, setTarefasMarcadas] = useState<string[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);

  const [pauta, setPauta] = useState<Pauta | null>(null);
  const [loadingPauta, setLoadingPauta] = useState(false);

  const reuniaoSelecionada = reunioes.find(r => r.id === reuniaoId);
  const tarefasDaReuniao = tarefas.filter(t => t.reuniaoId === reuniaoId);

  useEffect(() => {
    if (!reuniaoId) { setPauta(null); return; }
    async function fetchPauta() {
      setLoadingPauta(true);
      try {
        const pautas = await api.get<Pauta[]>(`/api/pautas?reuniaoId=${reuniaoId}`);
        setPauta(pautas && pautas.length > 0 ? pautas[0] : null);
      } catch (err) {
        console.error('Erro ao buscar pauta:', err);
        setPauta(null);
      } finally {
        setLoadingPauta(false);
      }
    }
    fetchPauta();
  }, [reuniaoId]);

  useEffect(() => {
    setAssinaturas(participantes.map(nome => ({ nome, imagem: null, hora: new Date().toISOString() })));
  }, [participantes]);

  const adicionarParticipante = () => {
    const nome = novoParticipante.trim();
    if (!nome || participantes.includes(nome)) return;
    setParticipantes(prev => [...prev, nome]);
    setNovoParticipante('');
  };

  const removerParticipante = (nome: string) => {
    setParticipantes(prev => prev.filter(p => p !== nome));
  };

  const atualizarAssinatura = (nome: string, imagem: string | null) => {
    setAssinaturas(prev => prev.map(a => a.nome === nome ? { ...a, imagem, hora: new Date().toISOString() } : a));
  };

  const toggleTarefa = (id: string) => {
    setTarefasMarcadas(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const estimarTempoUpload = (bytes: number) => {
    const mbps = 5;
    const segundos = (bytes / (mbps * 1024 * 1024 / 8));
    if (segundos < 60) return `${Math.round(segundos)}s`;
    return `${Math.round(segundos / 60)}min`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const resetForm = () => {
    setFile(null);
    setReuniaoId('');
    setParticipantes([]);
    setNovoParticipante('');
    setTarefasMarcadas([]);
    setAssinaturas([]);
    setPauta(null);
    setUploadProgress(0);
    setUploadEtapa('');
  };

  const handleEnviar = async () => {
    if (!file) {
      toast({ title: 'Arquivo obrigatório', description: 'Selecione um arquivo de gravação.', variant: 'destructive' });
      return;
    }
    if (participantes.length === 0) {
      toast({ title: 'Participantes obrigatórios', description: 'Adicione pelo menos um participante.', variant: 'destructive' });
      return;
    }
    const assinaturasCompletas = assinaturas.filter(a => a.imagem);
    if (assinaturasCompletas.length < participantes.length) {
      toast({
        title: 'Assinaturas pendentes',
        description: `${participantes.length - assinaturasCompletas.length} participante(s) ainda não assinaram.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setEnviando(true);
      setUploadProgress(10);
      setUploadEtapa('Preparando envio...');

      const formData = new FormData();
      formData.append('arquivo', file);
      formData.append('reuniaoId', reuniaoId || '');
      formData.append('nomeReuniao', reuniaoSelecionada?.titulo || 'Reunião sem título');
      formData.append('dataReuniao', reuniaoSelecionada?.data || new Date().toISOString().split('T')[0]);
      formData.append('tipoReuniao', reuniaoSelecionada?.tipo || 'geral');
      formData.append('participantes', JSON.stringify(participantes));
      formData.append('assinaturas', JSON.stringify(assinaturasCompletas));
      formData.append('pautaId', pauta?.id || '');
      formData.append('tarefasMarcadas', JSON.stringify(tarefasMarcadas));

      setUploadProgress(30);
      setUploadEtapa('Enviando arquivo...');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/processamentos/upload`, {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);
      setUploadEtapa('Finalizando...');

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || `Erro ${response.status}`);
      }

      setUploadProgress(100);
      toast({ title: 'Gravação enviada!', description: 'O processamento foi iniciado. Acompanhe o status na página de reuniões.' });
      resetForm();
      setOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar gravação';
      console.error('Erro ao enviar:', error);
      toast({ title: 'Erro ao enviar', description: errorMessage, variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {enviando && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-background rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl border">
            <div className="text-center mb-6">
              <CloudUpload className="w-12 h-12 text-primary mx-auto mb-3 animate-pulse" />
              <h3 className="text-lg font-semibold">Enviando Gravação</h3>
              <p className="text-sm text-muted-foreground mt-1">{uploadEtapa}</p>
            </div>
            <Progress value={uploadProgress} className="h-3 mb-4" />
            <p className="text-center text-sm text-muted-foreground">{uploadProgress}% concluído</p>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
            <Send className="w-4 h-4" />Enviar Gravação Completa
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileAudio className="w-5 h-5 text-primary" />Enviar Gravação de Reunião
            </DialogTitle>
            <DialogDescription>Preencha os dados e envie a gravação para processamento automático</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6 py-4">
              {/* Reunião */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4" />Reunião (opcional)
                </Label>
                <Select value={reuniaoId} onValueChange={setReuniaoId}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingReunioes ? 'Carregando...' : 'Selecione uma reunião'} />
                  </SelectTrigger>
                  <SelectContent>
                    {reunioes.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.titulo} — {r.data ? format(new Date(r.data), "dd/MM/yyyy", { locale: ptBR }) : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Arquivo */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileAudio className="w-4 h-4" />Arquivo de Gravação *
                </Label>
                <div className="relative border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-muted/30">
                  <input type="file" accept="audio/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                  {file ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileAudio className="w-8 h-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="flex-shrink-0">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Clique para selecionar ou arraste o arquivo</p>
                      <p className="text-xs text-muted-foreground mt-1">MP3, WAV, M4A, OGG, MP4, WebM</p>
                      <input type="file" className="hidden" accept="audio/*,video/*" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
                {file && file.size > 50 * 1024 * 1024 && (
                  <div className="flex items-center gap-2 p-2.5 bg-warning/10 border border-warning/30 rounded-lg">
                    <Clock className="w-4 h-4 text-warning flex-shrink-0" />
                    <span className="text-xs text-warning">Estimativa de upload: ~{estimarTempoUpload(file.size)}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Participantes */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />Participantes Presentes *
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do participante"
                    value={novoParticipante}
                    onChange={e => setNovoParticipante(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && adicionarParticipante()}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={adicionarParticipante}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {participantes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {participantes.map(p => (
                      <Badge key={p} variant="secondary" className="gap-1">
                        {p}
                        <button onClick={() => removerParticipante(p)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Assinaturas */}
              {participantes.length > 0 && (
                <div className="space-y-3">
                  <Label>Assinaturas Digitais *</Label>
                  <p className="text-xs text-muted-foreground">Cada participante deve assinar para confirmar presença</p>
                  {assinaturas.map(a => (
                    <SignatureCanvas
                      key={a.nome}
                      participanteName={a.nome}
                      onSignatureChange={img => atualizarAssinatura(a.nome, img)}
                    />
                  ))}
                </div>
              )}

              {/* Tarefas */}
              {tarefasDaReuniao.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" />Tarefas Concluídas
                    </Label>
                    <div className="space-y-2">
                      {tarefasDaReuniao.map(tarefa => (
                        <label key={tarefa.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                          <Checkbox checked={tarefasMarcadas.includes(tarefa.id)} onCheckedChange={() => toggleTarefa(tarefa.id)} />
                          <span className="text-sm">{tarefa.descricao}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Pauta vinculada */}
              {pauta && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />Pauta Vinculada
                    </Label>
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <p className="font-medium text-sm">{pauta.titulo}</p>
                      {pauta.subtitulo && <p className="text-xs text-muted-foreground">{pauta.subtitulo}</p>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="border-t pt-4">
            {participantes.length > 0 && (
              <div className="flex-1 text-sm text-muted-foreground">
                {assinaturas.filter(a => a.imagem).length} de {participantes.length} assinaturas coletadas
              </div>
            )}
            <Button variant="outline" onClick={() => setOpen(false)} disabled={enviando}>Cancelar</Button>
            <Button onClick={handleEnviar} disabled={enviando || !file || participantes.length === 0}>
              {enviando ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" />Enviar Gravação</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
