import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Search, 
  FileText, 
  FileDown, 
  Eye, 
  Target, 
  MessageSquare, 
  CheckSquare, 
  ArrowRight,
  Loader2,
  Trash2,
  RefreshCw,
  Edit2,
  Mail
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePautas, PautaCompleta, PautaDB } from "@/hooks/usePautas";
import { useMembros, useReunioes } from "@/hooks/useTarefas";
import { exportarPautaCompleta } from "@/utils/pdfExport";
import type { ConteudoPauta } from "@/data/pautasConteudo";
import { EditarPautaDialog } from "@/components/pautas/EditarPautaDialog";
import { EnviarEmailDialog } from "@/components/pautas/EnviarEmailDialog";

const statusConfig: Record<string, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground border-border" },
  pendente: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/30" },
  em_discussao: { label: "Em Discussão", color: "bg-info/10 text-info border-info/30" },
  aprovada: { label: "Aprovada", color: "bg-success/10 text-success border-success/30" },
  rejeitada: { label: "Rejeitada", color: "bg-destructive/10 text-destructive border-destructive/30" },
};

const Pautas = () => {
  const { pautas, loading, fetchPautas, fetchPautaCompleta, criarPauta, excluirPauta, atualizarStatus } = usePautas();
  const { membros } = useMembros();
  const { reunioes } = useReunioes();
  
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [pautaSelecionada, setPautaSelecionada] = useState<PautaCompleta | null>(null);
  const [dialogDetalhe, setDialogDetalhe] = useState(false);
  const [dialogNova, setDialogNova] = useState(false);
  const [dialogEditar, setDialogEditar] = useState(false);
  const [dialogEmail, setDialogEmail] = useState(false);
  const [pautaEditarId, setPautaEditarId] = useState<string | null>(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);

  // Form nova pauta
  const [novaPauta, setNovaPauta] = useState({
    titulo: "",
    subtitulo: "",
    contexto: "",
    responsavel_id: "",
    reuniao_id: "",
    tempo_previsto: 30,
  });

  const pautasFiltradas = pautas.filter((pauta) => {
    const matchBusca = pauta.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      pauta.subtitulo?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || pauta.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const abrirDetalhe = async (pauta: PautaDB) => {
    setCarregandoDetalhe(true);
    setDialogDetalhe(true);
    const completa = await fetchPautaCompleta(pauta.id);
    setPautaSelecionada(completa);
    setCarregandoDetalhe(false);
  };

  const handleExportarPDF = (pauta: PautaCompleta) => {
    // Converter para o formato esperado pelo exportador
    const pautaExport: ConteudoPauta = {
      id: pauta.id,
      titulo: pauta.titulo,
      subtitulo: pauta.subtitulo,
      contexto: pauta.contexto || "",
      objetivos: pauta.objetivos,
      dadosApresentados: pauta.dadosApresentados,
      discussoes: pauta.discussoes,
      deliberacoes: pauta.deliberacoes,
      encaminhamentos: pauta.encaminhamentos,
      observacoes: pauta.observacoes,
    };
    exportarPautaCompleta(pautaExport);
    toast({
      title: "PDF exportado!",
      description: `A pauta "${pauta.titulo}" foi exportada com sucesso.`,
    });
  };

  const handleCriarPauta = async () => {
    if (!novaPauta.titulo) {
      toast({
        title: "Título obrigatório",
        description: "Informe o título da pauta.",
        variant: "destructive",
      });
      return;
    }

    const result = await criarPauta({
      titulo: novaPauta.titulo,
      subtitulo: novaPauta.subtitulo || undefined,
      contexto: novaPauta.contexto || undefined,
      responsavel_id: novaPauta.responsavel_id || undefined,
      reuniao_id: novaPauta.reuniao_id || undefined,
      tempo_previsto: novaPauta.tempo_previsto,
    });

    if (result.success) {
      setDialogNova(false);
      setNovaPauta({ titulo: "", subtitulo: "", contexto: "", responsavel_id: "", reuniao_id: "", tempo_previsto: 30 });
    }
  };

  const abrirEditar = (pautaId: string) => {
    setPautaEditarId(pautaId);
    setDialogEditar(true);
  };

  const handleExcluir = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta pauta?")) {
      await excluirPauta(id);
    }
  };

  if (loading) {
    return (
      <MainLayout titulo="Pautas" subtitulo="Gerencie as pautas das reuniões">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout titulo="Pautas" subtitulo="Gerencie as pautas das reuniões">
      <div className="space-y-6 animate-fade-in">
        {/* Filtros e Ações */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pauta..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_discussao">Em Discussão</SelectItem>
                <SelectItem value="aprovada">Aprovada</SelectItem>
                <SelectItem value="rejeitada">Rejeitada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchPautas}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button className="gap-2" onClick={() => setDialogNova(true)}>
              <Plus className="w-4 h-4" />
              Nova Pauta
            </Button>
          </div>
        </div>

        {/* Lista de Pautas */}
        {pautasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Nenhuma pauta encontrada
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou criar uma nova pauta
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {pautasFiltradas.map((pauta, i) => {
              const status = statusConfig[pauta.status] || statusConfig.rascunho;
              return (
                <div
                  key={pauta.id}
                  className="p-5 rounded-xl border bg-card shadow-soft hover-lift animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{pauta.titulo}</h3>
                        {pauta.subtitulo && (
                          <p className="text-sm text-muted-foreground mt-1">{pauta.subtitulo}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={status.color}>
                        {status.label}
                      </Badge>
                    </div>

                    {pauta.contexto && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{pauta.contexto}</p>
                    )}

                    {pauta.responsavel && (
                      <p className="text-xs text-muted-foreground">
                        Responsável: <span className="font-medium">{pauta.responsavel.nome}</span>
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => abrirDetalhe(pauta)}
                        className="gap-2 flex-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => abrirEditar(pauta.id)}
                        className="gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExcluir(pauta.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dialog Detalhes da Pauta */}
        <Dialog open={dialogDetalhe} onOpenChange={setDialogDetalhe}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{pautaSelecionada?.titulo || "Carregando..."}</DialogTitle>
              <DialogDescription>{pautaSelecionada?.subtitulo}</DialogDescription>
            </DialogHeader>

            {carregandoDetalhe ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : pautaSelecionada ? (
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-6 py-4">
                  {/* Objetivos */}
                  {pautaSelecionada.objetivos.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-primary flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Objetivos
                      </h4>
                      <ul className="space-y-1 pl-4">
                        {pautaSelecionada.objetivos.map((obj, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary font-medium">{i + 1}.</span>
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Contexto */}
                  {pautaSelecionada.contexto && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-primary">Contexto</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {pautaSelecionada.contexto}
                      </p>
                    </div>
                  )}

                  {/* Dados Apresentados */}
                  {pautaSelecionada.dadosApresentados.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Dados Apresentados</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pautaSelecionada.dadosApresentados.map((secao, i) => (
                          <div key={i} className="border rounded-lg p-3 bg-card">
                            <h5 className="font-medium text-sm text-foreground mb-2">{secao.titulo}</h5>
                            <div className="space-y-1">
                              {secao.itens.map((item, j) => (
                                <div key={j} className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">{item.label}</span>
                                  <span className="font-medium text-foreground">{item.valor}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Discussões */}
                  {pautaSelecionada.discussoes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Discussões
                      </h4>
                      {pautaSelecionada.discussoes.map((disc, i) => (
                        <div key={i} className="border-l-2 border-info pl-3">
                          <h5 className="font-medium text-sm text-foreground">{disc.topico}</h5>
                          <ul className="mt-1 space-y-1">
                            {disc.pontos.map((ponto, j) => (
                              <li key={j} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="text-info">•</span>
                                {ponto}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Deliberações */}
                  {pautaSelecionada.deliberacoes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-success flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        Deliberações
                      </h4>
                      <div className="bg-success/10 border border-success/30 rounded-lg p-3">
                        <ul className="space-y-2">
                          {pautaSelecionada.deliberacoes.map((delib, i) => (
                            <li key={i} className="text-sm text-foreground flex items-start gap-2">
                              <CheckSquare className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                              {delib}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Encaminhamentos */}
                  {pautaSelecionada.encaminhamentos.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-primary flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Encaminhamentos
                      </h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-2 font-medium">Ação</th>
                              <th className="text-left p-2 font-medium">Responsável</th>
                              <th className="text-left p-2 font-medium">Prazo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pautaSelecionada.encaminhamentos.map((enc, i) => (
                              <tr key={i} className="border-t">
                                <td className="p-2 text-muted-foreground">{enc.acao}</td>
                                <td className="p-2 font-medium">{enc.responsavel}</td>
                                <td className="p-2 text-muted-foreground">{enc.prazo}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  {pautaSelecionada.observacoes && (
                    <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                      <p className="text-sm text-foreground italic">
                        <strong>Observação:</strong> {pautaSelecionada.observacoes}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : null}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogDetalhe(false)}>
                Fechar
              </Button>
              {pautaSelecionada && (
                <>
                  <Button variant="outline" onClick={() => setDialogEmail(true)} className="gap-2">
                    <Mail className="w-4 h-4" />
                    Enviar por E-mail
                  </Button>
                  <Button variant="outline" onClick={() => { setDialogDetalhe(false); abrirEditar(pautaSelecionada.id); }} className="gap-2">
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button onClick={() => handleExportarPDF(pautaSelecionada)} className="gap-2">
                    <FileDown className="w-4 h-4" />
                    Exportar PDF
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Nova Pauta */}
        <Dialog open={dialogNova} onOpenChange={setDialogNova}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Pauta</DialogTitle>
              <DialogDescription>
                Crie uma nova pauta para reunião
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  placeholder="Ex: Análise de Performance Q4"
                  value={novaPauta.titulo}
                  onChange={(e) => setNovaPauta(prev => ({ ...prev, titulo: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Subtítulo</Label>
                <Input
                  placeholder="Ex: Indicadores e Metas"
                  value={novaPauta.subtitulo}
                  onChange={(e) => setNovaPauta(prev => ({ ...prev, subtitulo: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Contexto</Label>
                <Textarea
                  placeholder="Descreva o contexto e objetivo da pauta..."
                  value={novaPauta.contexto}
                  onChange={(e) => setNovaPauta(prev => ({ ...prev, contexto: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Select 
                    value={novaPauta.responsavel_id} 
                    onValueChange={(v) => setNovaPauta(prev => ({ ...prev, responsavel_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {membros.filter(m => m.tipo === 'diretoria' || m.tipo === 'superintendencia').map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reunião</Label>
                  <Select 
                    value={novaPauta.reuniao_id} 
                    onValueChange={(v) => setNovaPauta(prev => ({ ...prev, reuniao_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {reunioes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tempo Previsto (minutos)</Label>
                <Input
                  type="number"
                  value={novaPauta.tempo_previsto}
                  onChange={(e) => setNovaPauta(prev => ({ ...prev, tempo_previsto: parseInt(e.target.value) || 30 }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogNova(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCriarPauta}>
                Criar Pauta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Editar Pauta */}
        <EditarPautaDialog
          open={dialogEditar}
          onOpenChange={setDialogEditar}
          pautaId={pautaEditarId}
          onSaved={fetchPautas}
        />

        {/* Dialog Enviar E-mail */}
        {pautaSelecionada && (
          <EnviarEmailDialog
            open={dialogEmail}
            onOpenChange={setDialogEmail}
            pautaId={pautaSelecionada.id}
            pautaTitulo={pautaSelecionada.titulo}
            membros={membros}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Pautas;
