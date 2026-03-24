import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useDestinatarios, type Destinatario } from "@/hooks/useDestinatarios";
import { ImportarCSVDialog } from "@/components/destinatarios/ImportarCSVDialog";
import { NovoDestinatarioDialog } from "@/components/destinatarios/NovoDestinatarioDialog";
import { ImportarMembrosDialog } from "@/components/destinatarios/ImportarMembrosDialog";
import { Plus, Search, Mail, Edit, Trash2, Loader2, Upload, Users, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const origemLabels: Record<string, string> = {
  manual: 'Manual',
  csv: 'CSV',
  membro: 'Membro',
};

const Destinatarios = () => {
  const { 
    destinatarios, 
    grupos, 
    loading, 
    addDestinatario, 
    updateDestinatario, 
    deleteDestinatario, 
    toggleAtivo,
    importarCSV,
    importarMembros,
  } = useDestinatarios();
  
  const [busca, setBusca] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState<string>("todos");
  const [dialogNovo, setDialogNovo] = useState(false);
  const [dialogCSV, setDialogCSV] = useState(false);
  const [dialogMembros, setDialogMembros] = useState(false);
  const [dialogEditar, setDialogEditar] = useState(false);
  const [destinatarioSelecionado, setDestinatarioSelecionado] = useState<Destinatario | null>(null);
  
  // Estados para edição
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCargo, setEditCargo] = useState("");
  const [editGrupo, setEditGrupo] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const destinatariosFiltrados = destinatarios.filter((dest) => {
    const matchBusca = dest.nome.toLowerCase().includes(busca.toLowerCase()) ||
      dest.email.toLowerCase().includes(busca.toLowerCase());
    const matchGrupo = filtroGrupo === "todos" || dest.grupo === filtroGrupo;
    return matchBusca && matchGrupo;
  });

  const handleEditar = (dest: Destinatario) => {
    setDestinatarioSelecionado(dest);
    setEditNome(dest.nome);
    setEditEmail(dest.email);
    setEditCargo(dest.cargo || "");
    setEditGrupo(dest.grupo);
    setDialogEditar(true);
  };

  const handleSalvarEdicao = async () => {
    if (!destinatarioSelecionado) return;
    
    setEditLoading(true);
    const sucesso = await updateDestinatario(destinatarioSelecionado.id, {
      nome: editNome.trim(),
      email: editEmail.trim(),
      cargo: editCargo.trim() || undefined,
      grupo: editGrupo.trim() || "geral",
    });
    setEditLoading(false);
    
    if (sucesso) {
      setDialogEditar(false);
      setDestinatarioSelecionado(null);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este destinatário?")) return;
    await deleteDestinatario(id);
  };

  if (loading) {
    return (
      <MainLayout titulo="Destinatários" subtitulo="Gerencie a lista de destinatários de e-mail">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout titulo="Destinatários" subtitulo="Gerencie a lista de destinatários de e-mail">
      <div className="space-y-6 animate-fade-in">
        {/* Info Card */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Central de Destinatários</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie quem receberá pautas e atas por e-mail. Você pode adicionar manualmente, 
                importar de um arquivo CSV ou importar membros já cadastrados no sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Filtros e Ações */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar destinatário..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os grupos</SelectItem>
                {grupos.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDialogMembros(true)}>
              <Users className="w-4 h-4 mr-2" />
              Importar Membros
            </Button>
            <Button variant="outline" onClick={() => setDialogCSV(true)}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Importar CSV
            </Button>
            <Button onClick={() => setDialogNovo(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Destinatário
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{destinatarios.length} destinatário(s) no total</span>
          <span>•</span>
          <span>{destinatarios.filter(d => d.ativo).length} ativo(s)</span>
          <span>•</span>
          <span>{grupos.length} grupo(s)</span>
        </div>

        {/* Lista de Destinatários */}
        {destinatariosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Mail className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {busca || filtroGrupo !== "todos" 
                ? "Nenhum destinatário encontrado" 
                : "Nenhum destinatário cadastrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {busca || filtroGrupo !== "todos" 
                ? "Tente ajustar os filtros de busca"
                : "Adicione destinatários manualmente ou importe de outras fontes"}
            </p>
            {!busca && filtroGrupo === "todos" && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDialogMembros(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Importar Membros
                </Button>
                <Button onClick={() => setDialogNovo(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Destinatário
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {destinatariosFiltrados.map((dest, i) => (
              <div
                key={dest.id}
                className={cn(
                  "p-4 rounded-xl border bg-card shadow-soft hover-lift animate-slide-up",
                  !dest.ativo && "opacity-60"
                )}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {dest.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">{dest.nome}</h3>
                      <Badge variant="outline" className="text-xs">
                        {dest.grupo}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {origemLabels[dest.origem] || dest.origem}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                      <span className="truncate">{dest.email}</span>
                      {dest.cargo && (
                        <>
                          <span>•</span>
                          <span className="truncate">{dest.cargo}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Ativo</span>
                      <Switch
                        checked={dest.ativo}
                        onCheckedChange={(checked) => toggleAtivo(dest.id, checked)}
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => handleEditar(dest)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleExcluir(dest.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialogs */}
        <NovoDestinatarioDialog
          open={dialogNovo}
          onOpenChange={setDialogNovo}
          onSalvar={addDestinatario}
        />

        <ImportarCSVDialog
          open={dialogCSV}
          onOpenChange={setDialogCSV}
          onImportar={importarCSV}
        />

        <ImportarMembrosDialog
          open={dialogMembros}
          onOpenChange={setDialogMembros}
          onImportar={importarMembros}
        />

        {/* Dialog Editar */}
        <Dialog open={dialogEditar} onOpenChange={setDialogEditar}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Destinatário</DialogTitle>
              <DialogDescription>
                Atualize as informações do destinatário
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome</Label>
                <Input
                  id="edit-nome"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cargo">Cargo</Label>
                <Input
                  id="edit-cargo"
                  value={editCargo}
                  onChange={(e) => setEditCargo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-grupo">Grupo</Label>
                <Input
                  id="edit-grupo"
                  value={editGrupo}
                  onChange={(e) => setEditGrupo(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setDialogEditar(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarEdicao} disabled={editLoading}>
                {editLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Destinatarios;
