import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus } from "lucide-react";

const tipoOptions = [
  { value: "diretoria", label: "Diretoria" },
  { value: "gestor", label: "Gestor" },
  { value: "lider", label: "Líder" },
  { value: "cooperado", label: "Cooperado" },
];

const membroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  email: z
    .string()
    .trim()
    .email({ message: "E-mail inválido" })
    .max(255, { message: "E-mail deve ter no máximo 255 caracteres" }),
  cargo: z
    .string()
    .trim()
    .min(2, { message: "Cargo deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Cargo deve ter no máximo 100 caracteres" }),
  tipo: z.enum(["diretoria", "gestor", "lider", "cooperado"], {
    required_error: "Selecione um tipo",
  }),
});

type MembroFormData = z.infer<typeof membroSchema>;

interface AdicionarMembroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { nome: string; email: string; cargo: string; tipo: string }) => Promise<{ success: boolean }>;
}

export function AdicionarMembroDialog({
  open,
  onOpenChange,
  onSubmit,
}: AdicionarMembroDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MembroFormData>({
    resolver: zodResolver(membroSchema),
    defaultValues: {
      nome: "",
      email: "",
      cargo: "",
      tipo: undefined,
    },
  });

  const handleSubmit = async (data: MembroFormData) => {
    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        nome: data.nome,
        email: data.email,
        cargo: data.cargo,
        tipo: data.tipo,
      });
      if (result.success) {
        form.reset();
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Adicionar Novo Membro
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do novo membro da cooperativa.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: João da Silva"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Ex: joao.silva@credimogiana.com.br"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Gerente de Operações"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de membro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tipoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Membro
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
