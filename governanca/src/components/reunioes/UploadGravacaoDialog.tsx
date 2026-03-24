import { useState } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, FileAudio, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const formatosAceitos = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];

export function UploadGravacaoDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [nomeReuniao, setNomeReuniao] = useState('');
  const [participantes, setParticipantes] = useState('');
  const [tipoReuniao, setTipoReuniao] = useState('Geral');
  const { toast } = useToast();

  const resetForm = () => {
    setFile(null); setNomeReuniao(''); setParticipantes(''); setTipoReuniao('Geral'); setError(''); setSuccess(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const extensao = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    if (!formatosAceitos.includes(extensao)) {
      setError(`Formato .${extensao} não suportado. Use: ${formatosAceitos.join(', ')}`);
      setFile(null);
      return;
    }
    if (selectedFile.size > 500 * 1024 * 1024) {
      setError('Arquivo muito grande! Máximo 500MB');
      setFile(null);
      return;
    }
    setError('');
    setFile(selectedFile);
    if (!nomeReuniao) setNomeReuniao(selectedFile.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUpload = async () => {
    if (!file) { setError('Selecione um arquivo primeiro'); return; }
    setUploading(true);
    setError('');
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('arquivo', file);
      formData.append('nomeReuniao', nomeReuniao || file.name);
      formData.append('dataReuniao', new Date().toISOString());
      formData.append('participantes', JSON.stringify(participantes.split(',').map(p => p.trim()).filter(Boolean)));
      formData.append('tipoReuniao', tipoReuniao);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/processamentos/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || `Erro ${response.status}`);
      }
      setSuccess(true);
      toast({ title: 'Gravação enviada!', description: 'O processamento foi iniciado. Acompanhe o status na página de reuniões.' });
      setTimeout(() => { setOpen(false); resetForm(); }, 2000);
    } catch (err) {
      console.error('Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md">
          <Mic className="w-4 h-4" />Enviar Gravação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileAudio className="w-5 h-5 text-primary" />Enviar Gravação de Reunião
          </DialogTitle>
          <DialogDescription>Faça upload do áudio para gerar a ata automaticamente com IA</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30">
            <input type="file" accept=".mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
            {file ? (
              <div className="flex items-center gap-3">
                <FileAudio className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Clique para selecionar ou arraste o arquivo</p>
                <p className="text-xs text-muted-foreground mt-1">MP3, WAV, M4A, OGG, MP4, WebM (máx. 500MB)</p>
              </>
            )}
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
              <CheckCircle className="w-4 h-4 text-success" />
              <p className="text-sm text-success">Arquivo enviado com sucesso!</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>Nome da Reunião</Label>
            <Input placeholder="Ex: Reunião de Diretoria - Janeiro" value={nomeReuniao} onChange={e => setNomeReuniao(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Participantes (separados por vírgula)</Label>
            <Input placeholder="João Silva, Maria Santos..." value={participantes} onChange={e => setParticipantes(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tipo de Reunião</Label>
            <Select value={tipoReuniao} onValueChange={setTipoReuniao}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Geral">Geral</SelectItem>
                <SelectItem value="Diretoria">Diretoria</SelectItem>
                <SelectItem value="Gestores">Gestores</SelectItem>
                <SelectItem value="Líderes">Líderes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><Upload className="w-4 h-4 mr-2" />Enviar Gravação</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
