import { useState, useRef } from 'react';
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
import { Upload, FileText, Loader2 } from 'lucide-react';

interface ImportarCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportar: (conteudo: string, grupo: string) => Promise<boolean>;
}

export function ImportarCSVDialog({ open, onOpenChange, onImportar }: ImportarCSVDialogProps) {
  const [grupo, setGrupo] = useState('importado');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArquivo(file);
    const texto = await file.text();
    const linhas = texto.split('\n').filter(l => l.trim()).slice(0, 5);
    setPreview(linhas);
  };

  const handleImportar = async () => {
    if (!arquivo) return;

    setLoading(true);
    const texto = await arquivo.text();
    const sucesso = await onImportar(texto, grupo);
    setLoading(false);

    if (sucesso) {
      setArquivo(null);
      setPreview([]);
      setGrupo('importado');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setArquivo(null);
    setPreview([]);
    setGrupo('importado');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Destinatários via CSV</DialogTitle>
          <DialogDescription>
            Formato esperado: nome,cargo,email (uma linha por destinatário)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Grupo</Label>
            <Input
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              placeholder="Nome do grupo (ex: externos, parceiros)"
            />
          </div>

          <div className="space-y-2">
            <Label>Arquivo CSV</Label>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            >
              {arquivo ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-medium">{arquivo.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar ou arraste o arquivo aqui
                  </p>
                </div>
              )}
            </div>
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview (primeiras 5 linhas)</Label>
              <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs space-y-1">
                {preview.map((linha, i) => (
                  <div key={i} className="truncate">{linha}</div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-1">Exemplo de formato:</p>
            <code className="text-xs">
              João Silva,Diretor,joao@email.com<br />
              Maria Santos,Gerente,maria@email.com
            </code>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleImportar} disabled={!arquivo || loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              'Importar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
