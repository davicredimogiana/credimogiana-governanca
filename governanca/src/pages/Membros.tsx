import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Search, 
  Filter, 
  Mail,
  Briefcase,
  RefreshCw,
  Loader2,
  FileDown,
  UserPlus
} from "lucide-react";
import { useMembros, type MembroDB } from "@/hooks/useTarefas";
import { exportarRelatorioMembros } from "@/utils/pdfExport";
import { AdicionarMembroDialog } from "@/components/membros/AdicionarMembroDialog";

const tipoConfig: Record<string, { label: string; color: string }> = {
  diretoria: { label: "Diretoria", color: "bg-primary text-primary-foreground" },
  gestor: { label: "Gestor", color: "bg-secondary text-secondary-foreground" },
  lider: { label: "Líder", color: "bg-info text-info-foreground" },
  cooperado: { label: "Cooperado", color: "bg-accent text-accent-foreground" },
};

const Membros = () => {
  const { membros, loading, fetchMembros, criarMembro } = useMembros();
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const membrosFiltrados = membros.filter((membro) => {
    const matchBusca = membro.nome.toLowerCase().includes(busca.toLowerCase()) ||
      membro.email.toLowerCase().includes(busca.toLowerCase()) ||
      membro.cargo.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === "todos" || membro.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  // Agrupar membros por tipo
  const membrosAgrupados = membrosFiltrados.reduce((acc, membro) => {
    if (!acc[membro.tipo]) {
      acc[membro.tipo] = [];
    }
    acc[membro.tipo].push(membro);
    return acc;
  }, {} as Record<string, MembroDB[]>);

  const ordemTipos = ['diretoria', 'gestor', 'lider', 'cooperado'];

  const estatisticas = {
    total: membros.length,
    diretoria: membros.filter(m => m.tipo === 'diretoria').length,
    gestores: membros.filter(m => m.tipo === 'gestor').length,
    lideres: membros.filter(m => m.tipo === 'lider').length,
    cooperados: membros.filter(m => m.tipo === 'cooperado').length,
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <MainLayout titulo="Membros" subtitulo="Gestão de membros da cooperativa">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout titulo="Membros" subtitulo="Gestão de membros da cooperativa">
      <div className="space-y-6 animate-fade-in">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="shadow-soft">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{estatisticas.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-primary/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{estatisticas.diretoria}</p>
              <p className="text-sm text-muted-foreground">Diretoria</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-secondary/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-secondary">{estatisticas.gestores}</p>
              <p className="text-sm text-muted-foreground">Gestores</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-info/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-info">{estatisticas.lideres}</p>
              <p className="text-sm text-muted-foreground">Líderes</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-accent/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">{estatisticas.cooperados}</p>
              <p className="text-sm text-muted-foreground">Cooperados</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou cargo..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="diretoria">Diretoria</SelectItem>
                  <SelectItem value="gestor">Gestores</SelectItem>
                  <SelectItem value="lider">Líderes</SelectItem>
                  <SelectItem value="cooperado">Cooperados</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchMembros}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => exportarRelatorioMembros(membrosFiltrados, { tipo: filtroTipo })}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button onClick={() => setDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Membro
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Membros por Grupo */}
        {membrosFiltrados.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum membro encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          ordemTipos.filter(tipo => membrosAgrupados[tipo]?.length > 0).map(tipo => (
            <Card key={tipo} className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Badge className={tipoConfig[tipo]?.color || 'bg-muted'}>
                    {tipoConfig[tipo]?.label || tipo}
                  </Badge>
                  <span className="text-muted-foreground text-sm font-normal">
                    ({membrosAgrupados[tipo].length} membros)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {membrosAgrupados[tipo].map(membro => (
                    <div 
                      key={membro.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-all"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(membro.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {membro.nome}
                        </p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {membro.cargo}
                        </p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {membro.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <AdicionarMembroDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={criarMembro}
        />
      </div>
    </MainLayout>
  );
};

export default Membros;