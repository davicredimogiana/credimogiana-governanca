import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckSquare, 
  Search, 
  Filter, 
  Calendar,
  User,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Circle,
  Loader2,
  AlertTriangle,
  Plus,
  RefreshCw,
  FileDown,
  Tag,
  X,
  Mail
} from "lucide-react";
import { useTarefas, useMembros, useReunioes, TarefaDB } from "@/hooks/useTarefas";
import { exportarRelatorioTarefas } from "@/utils/pdfExport";
import { TAGS_DISPONIVEIS, getTagConfig } from "@/data/tagsConfig";
import { EnviosEmailTab } from "@/components/acompanhamento/EnviosEmailTab";

import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pendente: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/30", icon: Circle },
  em_andamento: { label: "Em Andamento", color: "bg-info/10 text-info border-info/30", icon: Loader2 },
  concluida: { label: "Concluída", color: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
  nao_realizada: { label: "Não Realizada", color: "bg-destructive/10 text-destructive border-destructive/30", icon: XCircle },
};

const Acompanhamento = () => {
  const { tarefas, loading, atualizarTarefa, criarTarefa, fetchTarefas } = useTarefas();
  const { membros } = useMembros();
  const { reunioes } = useReunioes();
  
  const [abaAtiva, setAbaAtiva] = useState("tarefas");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>("todos");
  const [filtroTag, setFiltroTag] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [tarefaSelecionada, setTarefaSelecionada] = useState<TarefaDB | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogNovaAberto, setDialogNovaAberto] = useState(false);
  const [novoStatus, setNovoStatus] = useState<string>("pendente");
  const [observacao, setObservacao] = useState("");
  const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>([]);

  // Form nova tarefa
  const [novaTarefa, setNovaTarefa] = useState({
    descricao: "",
    responsavel_id: "",
    reuniao_id: "",
    prazo: "",
    observacoes: "",
    tags: [] as string[],
  });

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const matchBusca = tarefa.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      tarefa.responsavel?.nome.toLowerCase().includes(busca.toLowerCase()) ||
      tarefa.reuniao?.titulo.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || tarefa.status === filtroStatus;
    const matchResponsavel = filtroResponsavel === "todos" || tarefa.responsavel_id === filtroResponsavel;
    const matchTag = filtroTag === "todos" || (tarefa.tags && tarefa.tags.includes(filtroTag));
    return matchBusca && matchStatus && matchResponsavel && matchTag;
  });

  const estatisticas = {
    total: tarefas.length,
    pendentes: tarefas.filter(t => t.status === 'pendente').length,
    emAndamento: tarefas.filter(t => t.status === 'em_andamento').length,
    concluidas: tarefas.filter(t => t.status === 'concluida').length,
    naoRealizadas: tarefas.filter(t => t.status === 'nao_realizada').length,
  };

  const responsaveisUnicos = tarefas
    .filter(t => t.responsavel)
    .reduce((acc, t) => {
      if (t.responsavel && !acc.find(m => m.id === t.responsavel!.id)) {
        acc.push(t.responsavel);
      }
      return acc;
    }, [] as NonNullable<TarefaDB['responsavel']>[]);

  const abrirDialogAtualizacao = (tarefa: TarefaDB) => {
    setTarefaSelecionada(tarefa);
    setNovoStatus(tarefa.status);
    setObservacao(tarefa.observacoes || "");
    setTagsSelecionadas(tarefa.tags || []);
    setDialogAberto(true);
  };

  const handleAtualizarTarefa = async () => {
    if (!tarefaSelecionada) return;

    await atualizarTarefa(tarefaSelecionada.id, {
      status: novoStatus,
      observacoes: observacao || null,
      concluida_em: novoStatus === 'concluida' ? new Date().toISOString() : null,
      tags: tagsSelecionadas,
    });

    setDialogAberto(false);
    setTarefaSelecionada(null);
    fetchTarefas();
  };

  const handleCriarTarefa = async () => {
    if (!novaTarefa.descricao || !novaTarefa.responsavel_id || !novaTarefa.prazo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha descrição, responsável e prazo.",
        variant: "destructive",
      });
      return;
    }

    const result = await criarTarefa({
      descricao: novaTarefa.descricao,
      responsavel_id: novaTarefa.responsavel_id,
      reuniao_id: novaTarefa.reuniao_id || undefined,
      prazo: novaTarefa.prazo,
      observacoes: novaTarefa.observacoes || undefined,
      tags: novaTarefa.tags,
    });

    if (result.success) {
      setDialogNovaAberto(false);
      setNovaTarefa({ descricao: "", responsavel_id: "", reuniao_id: "", prazo: "", observacoes: "", tags: [] });
      fetchTarefas();
    }
  };

  const handleCheckboxChange = async (tarefa: TarefaDB, checked: boolean) => {
    await atualizarTarefa(tarefa.id, {
      status: checked ? 'concluida' : 'pendente',
      concluida_em: checked ? new Date().toISOString() : null,
    });
    fetchTarefas();
  };

  const toggleTag = (tagValue: string, targetArray: string[], setTargetArray: (tags: string[]) => void) => {
    if (targetArray.includes(tagValue)) {
      setTargetArray(targetArray.filter(t => t !== tagValue));
    } else {
      setTargetArray([...targetArray, tagValue]);
    }
  };

  if (loading) {
    return (
      <MainLayout titulo="Acompanhamento" subtitulo="Checklist de tarefas e histórico de envios">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout titulo="Acompanhamento" subtitulo="Checklist de tarefas e histórico de envios">
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tarefas" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Tarefas
          </TabsTrigger>
          <TabsTrigger value="envios" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Envios de E-mail
          </TabsTrigger>
        </TabsList>

        {/* Aba de Tarefas */}
        <TabsContent value="tarefas" className="space-y-6 animate-fade-in">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{estatisticas.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-warning/30">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-warning">{estatisticas.pendentes}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-info/30">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-info">{estatisticas.emAndamento}</p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-success/30">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-success">{estatisticas.concluidas}</p>
                <p className="text-sm text-muted-foreground">Concluídas</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-destructive/30">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-destructive">{estatisticas.naoRealizadas}</p>
                <p className="text-sm text-muted-foreground">Não Realizadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e Ações */}
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar tarefa, responsável ou reunião..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="nao_realizada">Não Realizada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel}>
                    <SelectTrigger className="w-full md:w-48">
                      <User className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Responsáveis</SelectItem>
                      {responsaveisUnicos.map((membro) => (
                        <SelectItem key={membro.id} value={membro.id}>
                          {membro.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filtroTag} onValueChange={setFiltroTag}>
                    <SelectTrigger className="w-full md:w-48">
                      <Tag className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as Tags</SelectItem>
                      {TAGS_DISPONIVEIS.map((tag) => (
                        <SelectItem key={tag.value} value={tag.value}>
                          {tag.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2 items-center justify-end">
                  <Button variant="outline" size="icon" onClick={fetchTarefas}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => exportarRelatorioTarefas(tarefasFiltradas, { status: filtroStatus })}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                  <Button onClick={() => setDialogNovaAberto(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Tarefa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Tarefas */}
          <div className="space-y-3">
            {tarefasFiltradas.length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="p-8 text-center">
                  <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {tarefas.length === 0 
                      ? "Nenhuma tarefa cadastrada ainda. Clique em 'Nova Tarefa' para começar."
                      : "Nenhuma tarefa encontrada com os filtros aplicados."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              tarefasFiltradas.map((tarefa) => {
                const StatusIcon = statusConfig[tarefa.status].icon;
                const prazoVencido = new Date(tarefa.prazo) < new Date() && 
                  !['concluida', 'nao_realizada'].includes(tarefa.status);

                return (
                  <Card 
                    key={tarefa.id} 
                    className={`shadow-soft transition-all hover:shadow-medium cursor-pointer ${
                      prazoVencido ? 'border-destructive/50' : ''
                    }`}
                    onClick={() => abrirDialogAtualizacao(tarefa)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center pt-1">
                          <Checkbox 
                            checked={tarefa.status === 'concluida'}
                            className="w-5 h-5"
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) => handleCheckboxChange(tarefa, !!checked)}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className={`font-medium text-foreground ${tarefa.status === 'concluida' ? 'line-through opacity-60' : ''}`}>
                              {tarefa.descricao}
                            </h4>
                            <Badge className={statusConfig[tarefa.status].color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[tarefa.status].label}
                            </Badge>
                          </div>

                          {/* Tags */}
                          {tarefa.tags && tarefa.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {tarefa.tags.map((tag) => {
                                const tagConfig = getTagConfig(tag);
                                return (
                                  <Badge key={tag} variant="outline" className={`text-xs ${tagConfig.color}`}>
                                    {tagConfig.label}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {tarefa.responsavel?.nome || 'Não definido'}
                            </span>
                            {tarefa.reuniao && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {tarefa.reuniao.titulo}
                              </span>
                            )}
                            <span className={`flex items-center gap-1 ${prazoVencido ? 'text-destructive font-medium' : ''}`}>
                              <Clock className="w-4 h-4" />
                              Prazo: {format(new Date(tarefa.prazo), "dd/MM/yyyy", { locale: ptBR })}
                              {prazoVencido && <AlertTriangle className="w-4 h-4 ml-1" />}
                            </span>
                          </div>

                          {tarefa.observacoes && (
                            <div className="mt-2 flex items-start gap-1 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{tarefa.observacoes}</span>
                            </div>
                          )}

                          {tarefa.concluida_em && (
                            <p className="mt-2 text-xs text-success">
                              Concluída em {format(new Date(tarefa.concluida_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              {tarefa.atualizador && ` por ${tarefa.atualizador.nome}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Aba de Envios de E-mail */}
        <TabsContent value="envios">
          <EnviosEmailTab />
        </TabsContent>
      </Tabs>

      {/* Dialog de Atualização */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar Tarefa</DialogTitle>
            <DialogDescription>
              Atualize o status e adicione observações sobre a tarefa.
            </DialogDescription>
          </DialogHeader>

          {tarefaSelecionada && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium text-foreground">{tarefaSelecionada.descricao}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Responsável: {tarefaSelecionada.responsavel?.nome}
                </p>
                <p className="text-sm text-muted-foreground">
                  Prazo: {format(new Date(tarefaSelecionada.prazo), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={novoStatus} onValueChange={(v) => setNovoStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">
                      <span className="flex items-center gap-2">
                        <Circle className="w-4 h-4 text-warning" />
                        Pendente
                      </span>
                    </SelectItem>
                    <SelectItem value="em_andamento">
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-info" />
                        Em Andamento
                      </span>
                    </SelectItem>
                    <SelectItem value="concluida">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Concluída
                      </span>
                    </SelectItem>
                    <SelectItem value="nao_realizada">
                      <span className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-destructive" />
                        Não Realizada
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-background min-h-[60px]">
                  {TAGS_DISPONIVEIS.map((tag) => {
                    const isSelected = tagsSelecionadas.includes(tag.value);
                    return (
                      <Badge 
                        key={tag.value}
                        variant="outline"
                        className={`cursor-pointer transition-all ${isSelected ? tag.color : 'opacity-50 hover:opacity-80'}`}
                        onClick={() => toggleTag(tag.value, tagsSelecionadas, setTagsSelecionadas)}
                      >
                        {tag.label}
                        {isSelected && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Adicione observações sobre o andamento ou conclusão da tarefa..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAtualizarTarefa}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Nova Tarefa */}
      <Dialog open={dialogNovaAberto} onOpenChange={setDialogNovaAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>
              Adicione uma nova tarefa delegada para acompanhamento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Textarea
                placeholder="Descreva a tarefa..."
                value={novaTarefa.descricao}
                onChange={(e) => setNovaTarefa(prev => ({ ...prev, descricao: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Responsável *</Label>
              <Select 
                value={novaTarefa.responsavel_id} 
                onValueChange={(v) => setNovaTarefa(prev => ({ ...prev, responsavel_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {membros.map((membro) => (
                    <SelectItem key={membro.id} value={membro.id}>
                      {membro.nome} - {membro.cargo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reunião de Origem</Label>
              <Select 
                value={novaTarefa.reuniao_id} 
                onValueChange={(v) => setNovaTarefa(prev => ({ ...prev, reuniao_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a reunião (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {reunioes.map((reuniao) => (
                    <SelectItem key={reuniao.id} value={reuniao.id}>
                      {reuniao.titulo} - {format(new Date(reuniao.data), "dd/MM/yyyy", { locale: ptBR })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prazo *</Label>
              <Input
                type="date"
                value={novaTarefa.prazo}
                onChange={(e) => setNovaTarefa(prev => ({ ...prev, prazo: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-background min-h-[60px]">
                {TAGS_DISPONIVEIS.map((tag) => {
                  const isSelected = novaTarefa.tags.includes(tag.value);
                  return (
                    <Badge 
                      key={tag.value}
                      variant="outline"
                      className={`cursor-pointer transition-all ${isSelected ? tag.color : 'opacity-50 hover:opacity-80'}`}
                      onClick={() => {
                        if (isSelected) {
                          setNovaTarefa(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag.value) }));
                        } else {
                          setNovaTarefa(prev => ({ ...prev, tags: [...prev.tags, tag.value] }));
                        }
                      }}
                    >
                      {tag.label}
                      {isSelected && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações adicionais..."
                value={novaTarefa.observacoes}
                onChange={(e) => setNovaTarefa(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogNovaAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarTarefa}>
              Criar Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Acompanhamento;
