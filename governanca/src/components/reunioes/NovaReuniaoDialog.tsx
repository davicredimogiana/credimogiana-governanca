import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Calendar } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const reuniaoSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  data: z.string().min(1, "Data é obrigatória"),
  horario: z.string().min(1, "Horário é obrigatório"),
  duracao: z.coerce.number().min(15).max(480),
  tipo: z.enum(["diretoria", "gestores", "lideres", "geral"]),
  local: z.string().optional(),
  plataforma: z.string().optional(),
});

type ReuniaoFormData = z.infer<typeof reuniaoSchema>;

interface NovaReuniaoDialogProps {
  onReuniaoCreated?: () => void;
}

export function NovaReuniaoDialog({ onReuniaoCreated }: NovaReuniaoDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ReuniaoFormData>({
    resolver: zodResolver(reuniaoSchema),
    defaultValues: { duracao: 60, tipo: undefined },
  });
  const tipoValue = watch("tipo");

  const onSubmit = async (data: ReuniaoFormData) => {
    setLoading(true);
    try {
      await api.post('/api/reunioes', {
        titulo: data.titulo,
        descricao: data.descricao || null,
        data: data.data,
        horario: data.horario,
        duracao: data.duracao,
        tipo: data.tipo,
        local: data.local || null,
        plataforma: data.plataforma || null,
        status: 'agendada',
      });
      toast({ title: "Reunião criada!", description: `"${data.titulo}" foi agendada com sucesso.` });
      reset();
      setOpen(false);
      onReuniaoCreated?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: "Erro ao criar reunião", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" />Nova Reunião</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />Nova Reunião
          </DialogTitle>
          <DialogDescription>Preencha os dados para agendar uma nova reunião.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" placeholder="Ex: Reunião de Diretoria - Janeiro" {...register("titulo")} />
            {errors.titulo && <p className="text-sm text-destructive">{errors.titulo.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" placeholder="Descreva o objetivo da reunião..." rows={3} {...register("descricao")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input id="data" type="date" {...register("data")} />
              {errors.data && <p className="text-sm text-destructive">{errors.data.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="horario">Horário *</Label>
              <Input id="horario" type="time" {...register("horario")} />
              {errors.horario && <p className="text-sm text-destructive">{errors.horario.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duracao">Duração (min) *</Label>
              <Input id="duracao" type="number" min={15} max={480} step={15} {...register("duracao")} />
              {errors.duracao && <p className="text-sm text-destructive">{errors.duracao.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={tipoValue} onValueChange={(v) => setValue("tipo", v as ReuniaoFormData["tipo"])}>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="diretoria">Diretoria</SelectItem>
                  <SelectItem value="gestores">Gestores</SelectItem>
                  <SelectItem value="lideres">Líderes</SelectItem>
                  <SelectItem value="geral">Geral</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-sm text-destructive">{errors.tipo.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Input id="local" placeholder="Sala de reuniões..." {...register("local")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plataforma">Plataforma</Label>
              <Input id="plataforma" placeholder="Google Meet, Zoom..." {...register("plataforma")} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Reunião'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
