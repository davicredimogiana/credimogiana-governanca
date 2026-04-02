import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Ata, DecisaoIA, AcaoIA, RiscoIA, OportunidadeIA } from "@/types/api";

import {
  FileText,
  CheckCircle2,
  ListChecks,
  AlertTriangle,
  Lightbulb,
  Download,
  Calendar,
  User,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { exportarAtaPDF } from "@/utils/pdfExport";
import React from "react";
import type { Ata } from "@/types/api";


interface DecisaoIA {
  id: string;
  descricao: string;
  responsavel: string | null;
  prazo: string | null;
  status: string;
}

interface AcaoIA {
  id: string;
  descricao: string;
  responsavel: string | null;
  prazo: string | null;
  status: string;
}

interface RiscoIA {
  id: string;
  descricao: string;
  severidade: string | null;
  mencoes: number;
}

interface OportunidadeIA {
  id: string;
  descricao: string;
  potencial: string | null;
  mencoes: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ata: Ata | null;
  decisoes: DecisaoIA[];
  acoes: AcaoIA[];
  riscos: RiscoIA[];
  oportunidades: OportunidadeIA[];
}

const INVALID_RESUMO_PATTERNS = [
  "parece que",
  "transcrição fornecida",
  "não contém informações",
  "não forneceu detalhes",
  "não foi possível",
  "está incompleta",
  "forneça os detalhes",
  "forneça informações",
  "não há informações suficientes",
  "não consegui identificar",
  "não é possível gerar",
  "não possui informações",
];

function isResumoInvalido(resumo: string | null | undefined): boolean {
  if (!resumo || resumo.trim().length < 30) return true;
  const lower = resumo.toLowerCase();
  return INVALID_RESUMO_PATTERNS.some((pattern) => lower.includes(pattern));
}

function extrairResumoDoMarkdown(markdown: string): string {
  const visaoGeralMatch = markdown.match(
    /## 1\. VIS[ÃA]O GERAL E CONTEXTO[\s\S]*?\n\n([\s\S]*?)(?=\n---|\n## \d|$)/i
  );
  if (visaoGeralMatch && visaoGeralMatch[1] && visaoGeralMatch[1].trim().length > 50) {
    return visaoGeralMatch[1].trim();
  }

  const resumoMatch = markdown.match(
    /## (?:\d+\.\s*)?RESUMO[\s\S]*?\n\n([\s\S]*?)(?=\n---|\n## \d|$)/i
  );
  if (resumoMatch && resumoMatch[1] && resumoMatch[1].trim().length > 50) {
    return resumoMatch[1].trim();
  }

  const paragrafosMatch = markdown.match(
    /^#[^\n]+\n\n([\s\S]{100,1500}?)(?=\n\n|\n##|\n---)/
  );
  if (paragrafosMatch && paragrafosMatch[1]) {
    return paragrafosMatch[1].trim();
  }

  return "";
}

const severidadeConfig: Record<string, { label: string; className: string }> = {
  alta: { label: "Alta", className: "bg-red-100 text-red-700" },
  media: { label: "Média", className: "bg-amber-100 text-amber-700" },
  baixa: { label: "Baixa", className: "bg-green-100 text-green-700" },
};

const potencialConfig: Record<string, { label: string; className: string }> = {
  alto: { label: "Alto", className: "bg-purple-100 text-purple-700" },
  medio: { label: "Médio", className: "bg-blue-100 text-blue-700" },
  baixo: { label: "Baixo", className: "bg-gray-100 text-gray-700" },
};

function renderMarkdown(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let inList = false;
  let tableRows: string[][] = [];
  let inTable = false;

  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="list-disc list-inside space-y-1 mb-4 text-muted-foreground"
        >
          {listItems.map((item, i) => (
            <li key={i} className="text-sm">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headers = tableRows[0];
      const dataRows = tableRows.slice(2);

      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10">
                {headers.map((cell, i) => (
                  <th
                    key={i}
                    className="border border-border px-3 py-2 text-left font-semibold text-primary"
                  >
                    {cell.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="border border-border px-3 py-2 text-muted-foreground"
                    >
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
    inTable = false;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (!inTable) {
        flushList();
        inTable = true;
      }

      const cells = trimmed
        .split("|")
        .filter((c) => c.trim() !== "" && !c.match(/^[-:]+$/));

      if (cells.length > 0 && !trimmed.match(/^\|[-:|]+\|$/)) {
        tableRows.push(cells);
      }
      return;
    } else if (inTable) {
      flushTable();
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={index} className="text-xl font-bold text-primary mt-6 mb-3">
          {trimmed.slice(2)}
        </h1>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={index} className="text-lg font-semibold text-primary mt-5 mb-2">
          {trimmed.slice(3)}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={index} className="text-base font-semibold text-foreground mt-4 mb-2">
          {trimmed.slice(4)}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(trimmed.slice(2));
      return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      inList = true;
      listItems.push(trimmed.replace(/^\d+\.\s/, ""));
      return;
    }

    if (trimmed === "") {
      flushList();
      return;
    }

    flushList();
    elements.push(
      <p key={index} className="text-sm text-muted-foreground mb-3 leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList();
  flushTable();

  return <div className="prose-sm">{elements}</div>;
}

export function VisualizarAtaDialog({
  open,
  onOpenChange,
  ata,
  decisoes,
  acoes,
  riscos,
  oportunidades,
}: Props) {
  if (!ata) return null;

  const titulo = ata.reuniao?.titulo || `Ata de ${format(new Date(ata.geradaEm), "dd/MM/yyyy")}`;
  const dataFormatada = format(new Date(ata.geradaEm), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const handleExportPDF = () => {
    exportarAtaPDF(ata, decisoes, acoes, riscos, oportunidades);
  };

  let resumoExibir = ata.analise?.resumo || "";

  if (isResumoInvalido(resumoExibir)) {
    resumoExibir = extrairResumoDoMarkdown(ata.conteudoMarkdown);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-90 mb-1">ATA DE REUNIÃO</p>
              <h2 className="text-2xl font-bold mb-2">{titulo}</h2>
              <div className="flex items-center gap-4 text-sm opacity-90">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {dataFormatada}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleExportPDF}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Imprimir PDF
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(95vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Resumo Executivo */}
            {(() => {
              const resumoOriginal = ata.analise?.resumo;
              let resumoExibir = resumoOriginal || '';
              
              if (isResumoInvalido(resumoOriginal)) {
                resumoExibir = extrairResumoDoMarkdown(ata.conteudoMarkdown);
              }
              
              if (!resumoExibir) return null;
              
              return (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <FileText className="w-5 h-5" />
                      Resumo Executivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {resumoExibir}
                    </p>
                  </CardContent>
                </Card>
              );
            })()}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">{decisoes.length}</p>
                  <p className="text-xs text-green-600">Decisões</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <ListChecks className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">{acoes.length}</p>
                  <p className="text-xs text-blue-600">Ações</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-700">{riscos.length}</p>
                  <p className="text-xs text-amber-600">Riscos</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-700">{oportunidades.length}</p>
                  <p className="text-xs text-purple-600">Oportunidades</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decisoes.length > 0 && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-green-700 text-base">
                      <CheckCircle2 className="w-5 h-5" />
                      Decisões ({decisoes.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {decisoes.map((d) => (
                      <div key={d.id} className="p-3 bg-white rounded-lg border border-green-100">
                        <p className="text-sm font-medium text-foreground mb-1">{d.descricao}</p>
                        {(d.responsavel || d.prazo) && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {d.responsavel && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {d.responsavel}
                              </span>
                            )}
                            {d.prazo && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {d.prazo}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {acoes.length > 0 && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-700 text-base">
                      <ListChecks className="w-5 h-5" />
                      Ações ({acoes.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {acoes.map((a) => (
                      <div key={a.id} className="p-3 bg-white rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-foreground mb-1">{a.descricao}</p>
                        {(a.responsavel || a.prazo) && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {a.responsavel && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {a.responsavel}
                              </span>
                            )}
                            {a.prazo && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {a.prazo}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {riscos.length > 0 && (
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-amber-700 text-base">
                      <AlertTriangle className="w-5 h-5" />
                      Riscos ({riscos.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {riscos.map((r) => (
                      <div key={r.id} className="p-3 bg-white rounded-lg border border-amber-100">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{r.descricao}</p>
                          {r.severidade && severidadeConfig[r.severidade] && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${severidadeConfig[r.severidade].className}`}
                            >
                              {severidadeConfig[r.severidade].label}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {oportunidades.length > 0 && (
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-purple-700 text-base">
                      <Lightbulb className="w-5 h-5" />
                      Oportunidades ({oportunidades.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {oportunidades.map((o) => (
                      <div key={o.id} className="p-3 bg-white rounded-lg border border-purple-100">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{o.descricao}</p>
                          {o.potencial && potencialConfig[o.potencial] && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${potencialConfig[o.potencial].className}`}
                            >
                              {potencialConfig[o.potencial].label}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="border-border bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  Conteúdo Completo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background rounded-lg p-4 border">
                  {renderMarkdown(ata.conteudoMarkdown)}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}