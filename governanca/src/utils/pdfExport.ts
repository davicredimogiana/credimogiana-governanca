import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ReuniaoDB, TarefaDB, MembroDB } from '@/hooks/useTarefas';
import type { ConteudoPauta } from '@/data/pautasConteudo';

// Configurações de cores da Credimogiana
const COLORS = {
  primary: [0, 111, 101] as [number, number, number],      // Teal
  secondary: [141, 198, 63] as [number, number, number],   // Verde limão
  text: [51, 51, 51] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// Adiciona cabeçalho padrão aos PDFs
function addHeader(doc: jsPDF, titulo: string, subtitulo?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Background do cabeçalho
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Título
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Governança Mogiana', 14, 15);
  
  // Subtítulo do relatório
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(titulo, 14, 25);
  
  // Data de geração
  doc.setFontSize(9);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth - 14, 15, { align: 'right' });
  
  if (subtitulo) {
    doc.setFontSize(10);
    doc.text(subtitulo, pageWidth - 14, 25, { align: 'right' });
  }
  
  // Reset cor do texto
  doc.setTextColor(...COLORS.text);
  
  return 45; // Retorna a posição Y após o header
}

// Adiciona rodapé com numeração de página
function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'Credimogiana - Sistema de Governança',
      14,
      pageHeight - 10
    );
  }
}

// Exportar relatório de reuniões
export function exportarRelatorioReunioes(reunioes: ReuniaoDB[], filtros?: { tipo?: string; status?: string }) {
  const doc = new jsPDF();
  
  let subtitulo = 'Todas as reuniões';
  if (filtros?.tipo && filtros.tipo !== 'todos') {
    subtitulo = `Tipo: ${filtros.tipo}`;
  }
  if (filtros?.status && filtros.status !== 'todos') {
    subtitulo += ` | Status: ${filtros.status}`;
  }
  
  let yPos = addHeader(doc, 'Relatório de Reuniões', subtitulo);
  
  // Estatísticas resumidas
  const stats = {
    total: reunioes.length,
    agendadas: reunioes.filter(r => r.status === 'agendada').length,
    concluidas: reunioes.filter(r => r.status === 'concluida').length,
    canceladas: reunioes.filter(r => r.status === 'cancelada').length,
  };
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total: ${stats.total} reuniões | Agendadas: ${stats.agendadas} | Concluídas: ${stats.concluidas} | Canceladas: ${stats.canceladas}`, 14, yPos);
  yPos += 12;
  
  // Tabela de reuniões
  const tipoLabels: Record<string, string> = {
    diretoria: 'Diretoria',
    gestores: 'Gestores',
    lideres: 'Líderes',
    geral: 'Geral',
  };
  
  const statusLabels: Record<string, string> = {
    agendada: 'Agendada',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  };
  
  const tableData = reunioes.map(r => [
    r.titulo,
    format(new Date(r.data), 'dd/MM/yyyy', { locale: ptBR }),
    r.horario.substring(0, 5),
    `${r.duracao} min`,
    tipoLabels[r.tipo] || r.tipo,
    statusLabels[r.status] || r.status,
    r.local || r.plataforma || '-',
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Título', 'Data', 'Hora', 'Duração', 'Tipo', 'Status', 'Local/Plataforma']],
    body: tableData,
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      6: { cellWidth: 35 },
    },
    margin: { left: 14, right: 14 },
  });
  
  addFooter(doc);
  doc.save(`reunioes_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`);
}

// Exportar relatório de tarefas/acompanhamento
export function exportarRelatorioTarefas(tarefas: TarefaDB[], filtros?: { status?: string; responsavel?: string }) {
  const doc = new jsPDF();
  
  let subtitulo = 'Todas as tarefas';
  if (filtros?.status && filtros.status !== 'todos') {
    subtitulo = `Status: ${filtros.status}`;
  }
  
  let yPos = addHeader(doc, 'Relatório de Acompanhamento - Tarefas Delegadas', subtitulo);
  
  // Estatísticas resumidas
  const stats = {
    total: tarefas.length,
    pendentes: tarefas.filter(t => t.status === 'pendente').length,
    emAndamento: tarefas.filter(t => t.status === 'em_andamento').length,
    concluidas: tarefas.filter(t => t.status === 'concluida').length,
    naoRealizadas: tarefas.filter(t => t.status === 'nao_realizada').length,
  };
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total: ${stats.total} | Pendentes: ${stats.pendentes} | Em Andamento: ${stats.emAndamento} | Concluídas: ${stats.concluidas} | Não Realizadas: ${stats.naoRealizadas}`, 14, yPos);
  yPos += 12;
  
  const statusLabels: Record<string, string> = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    nao_realizada: 'Não Realizada',
  };
  
  const tableData = tarefas.map(t => [
    t.descricao,
    t.responsavel?.nome || '-',
    t.reuniao?.titulo || '-',
    format(new Date(t.prazo), 'dd/MM/yyyy', { locale: ptBR }),
    statusLabels[t.status] || t.status,
    t.observacoes || '-',
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Descrição', 'Responsável', 'Reunião', 'Prazo', 'Status', 'Observações']],
    body: tableData,
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      5: { cellWidth: 35 },
    },
    margin: { left: 14, right: 14 },
  });
  
  addFooter(doc);
  doc.save(`tarefas_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`);
}

// Exportar ata de uma reunião específica
export function exportarAtaReuniao(reuniao: ReuniaoDB, tarefas?: TarefaDB[]) {
  const doc = new jsPDF();
  
  let yPos = addHeader(doc, 'Ata de Reunião', reuniao.titulo);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Informações da reunião
  doc.setFillColor(245, 245, 245);
  doc.rect(14, yPos, pageWidth - 28, 35, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  
  yPos += 8;
  doc.text('Informações da Reunião', 18, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${format(new Date(reuniao.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, 18, yPos);
  doc.text(`Horário: ${reuniao.horario.substring(0, 5)}`, 100, yPos);
  yPos += 6;
  doc.text(`Duração: ${reuniao.duracao} minutos`, 18, yPos);
  doc.text(`Local: ${reuniao.local || reuniao.plataforma || 'Não informado'}`, 100, yPos);
  yPos += 6;
  
  const tipoLabels: Record<string, string> = {
    diretoria: 'Diretoria',
    gestores: 'Gestores',
    lideres: 'Líderes',
    geral: 'Geral',
  };
  doc.text(`Tipo: ${tipoLabels[reuniao.tipo] || reuniao.tipo}`, 18, yPos);
  
  const statusLabels: Record<string, string> = {
    agendada: 'Agendada',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  };
  doc.text(`Status: ${statusLabels[reuniao.status] || reuniao.status}`, 100, yPos);
  
  yPos += 15;
  
  // Descrição
  if (reuniao.descricao) {
    doc.setFont('helvetica', 'bold');
    doc.text('Descrição/Objetivo:', 14, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    
    const descLines = doc.splitTextToSize(reuniao.descricao, pageWidth - 28);
    doc.text(descLines, 14, yPos);
    yPos += descLines.length * 5 + 10;
  }
  
  // Tarefas delegadas (se houver)
  if (tarefas && tarefas.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Tarefas Delegadas:', 14, yPos);
    yPos += 8;
    
    const statusTarefaLabels: Record<string, string> = {
      pendente: 'Pendente',
      em_andamento: 'Em Andamento',
      concluida: 'Concluída',
      nao_realizada: 'Não Realizada',
    };
    
    const tableData = tarefas.map(t => [
      t.descricao,
      t.responsavel?.nome || '-',
      format(new Date(t.prazo), 'dd/MM/yyyy', { locale: ptBR }),
      statusTarefaLabels[t.status] || t.status,
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Descrição', 'Responsável', 'Prazo', 'Status']],
      body: tableData,
      headStyles: {
        fillColor: COLORS.secondary,
        textColor: COLORS.text,
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: COLORS.text,
      },
      alternateRowStyles: {
        fillColor: [245, 250, 240],
      },
      margin: { left: 14, right: 14 },
    });
  }
  
  // Espaço para assinaturas
  const finalY = (doc as any).lastAutoTable?.finalY || yPos + 20;
  
  if (finalY < doc.internal.pageSize.getHeight() - 60) {
    doc.setDrawColor(...COLORS.muted);
    doc.line(14, finalY + 30, 80, finalY + 30);
    doc.line(pageWidth - 80, finalY + 30, pageWidth - 14, finalY + 30);
    
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.text('Secretário(a)', 47, finalY + 36, { align: 'center' });
    doc.text('Presidente', pageWidth - 47, finalY + 36, { align: 'center' });
  }
  
  addFooter(doc);
  doc.save(`ata_${reuniao.titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(reuniao.data), 'yyyy-MM-dd')}.pdf`);
}

// Exportar relatório de membros
export function exportarRelatorioMembros(membros: MembroDB[], filtros?: { tipo?: string }) {
  const doc = new jsPDF();
  
  let subtitulo = 'Todos os membros';
  if (filtros?.tipo && filtros.tipo !== 'todos') {
    const tipoLabels: Record<string, string> = {
      diretoria: 'Diretoria',
      gestor: 'Gestores',
      lider: 'Líderes',
      cooperado: 'Cooperados',
    };
    subtitulo = `Tipo: ${tipoLabels[filtros.tipo] || filtros.tipo}`;
  }
  
  let yPos = addHeader(doc, 'Relatório de Membros', subtitulo);
  
  // Estatísticas resumidas
  const stats = {
    total: membros.length,
    diretoria: membros.filter(m => m.tipo === 'diretoria').length,
    gestores: membros.filter(m => m.tipo === 'gestor').length,
    lideres: membros.filter(m => m.tipo === 'lider').length,
    cooperados: membros.filter(m => m.tipo === 'cooperado').length,
  };
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total: ${stats.total} | Diretoria: ${stats.diretoria} | Gestores: ${stats.gestores} | Líderes: ${stats.lideres} | Cooperados: ${stats.cooperados}`, 14, yPos);
  yPos += 12;
  
  const tipoLabels: Record<string, string> = {
    diretoria: 'Diretoria',
    gestor: 'Gestor',
    lider: 'Líder',
    cooperado: 'Cooperado',
  };
  
  const tableData = membros.map(m => [
    m.nome,
    m.email,
    m.cargo,
    tipoLabels[m.tipo] || m.tipo,
    m.ativo ? 'Ativo' : 'Inativo',
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Nome', 'E-mail', 'Cargo', 'Tipo', 'Status']],
    body: tableData,
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 50 },
      2: { cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
  });
  
  addFooter(doc);
  doc.save(`membros_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`);
}

// Exportar PDF de uma pauta completa com conteúdo
export function exportarPautaCompleta(pauta: ConteudoPauta) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let yPos = addHeader(doc, pauta.titulo, pauta.subtitulo);
  
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
  };
  
  // Objetivos
  checkNewPage(40);
  doc.setFillColor(245, 250, 240);
  doc.roundedRect(14, yPos, pageWidth - 28, 8 + pauta.objetivos.length * 6, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Objetivos', 18, yPos + 6);
  yPos += 12;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  pauta.objetivos.forEach((obj, i) => {
    doc.text(`${i + 1}. ${obj}`, 22, yPos);
    yPos += 6;
  });
  yPos += 8;
  
  // Contexto
  checkNewPage(30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Contexto', 14, yPos);
  yPos += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  const contextoLines = doc.splitTextToSize(pauta.contexto, pageWidth - 28);
  doc.text(contextoLines, 14, yPos);
  yPos += contextoLines.length * 4 + 10;
  
  // Dados Apresentados
  pauta.dadosApresentados.forEach((secao) => {
    checkNewPage(40);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.secondary);
    doc.text(secao.titulo, 14, yPos);
    yPos += 6;
    
    const tableData = secao.itens.map(item => [item.label, item.valor]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Indicador', 'Valor']],
      body: tableData,
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: COLORS.text,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
      tableWidth: pageWidth - 28,
    });
    
    yPos = (doc as any).lastAutoTable?.finalY + 8 || yPos + 40;
  });
  
  // Discussões
  checkNewPage(30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Discussões', 14, yPos);
  yPos += 8;
  
  pauta.discussoes.forEach((disc) => {
    checkNewPage(25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(disc.topico, 14, yPos);
    yPos += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    disc.pontos.forEach((ponto) => {
      checkNewPage(8);
      const pontoLines = doc.splitTextToSize(`• ${ponto}`, pageWidth - 36);
      doc.text(pontoLines, 20, yPos);
      yPos += pontoLines.length * 4 + 2;
    });
    yPos += 4;
  });
  
  // Deliberações
  checkNewPage(30);
  doc.setFillColor(...COLORS.secondary);
  doc.roundedRect(14, yPos, pageWidth - 28, 8, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Deliberações', 18, yPos + 6);
  yPos += 14;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  pauta.deliberacoes.forEach((delib, i) => {
    checkNewPage(8);
    const delibLines = doc.splitTextToSize(`${i + 1}. ${delib}`, pageWidth - 36);
    doc.text(delibLines, 18, yPos);
    yPos += delibLines.length * 4 + 3;
  });
  yPos += 6;
  
  // Encaminhamentos
  checkNewPage(50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Encaminhamentos', 14, yPos);
  yPos += 6;
  
  const encaminhamentosData = pauta.encaminhamentos.map(e => [e.acao, e.responsavel, e.prazo]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Ação', 'Responsável', 'Prazo']],
    body: encaminhamentosData,
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: [245, 250, 240],
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
  });
  
  yPos = (doc as any).lastAutoTable?.finalY + 8 || yPos + 40;
  
  // Observações
  if (pauta.observacoes) {
    checkNewPage(25);
    
    doc.setFillColor(255, 250, 240);
    doc.roundedRect(14, yPos, pageWidth - 28, 20, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.muted);
    const obsLines = doc.splitTextToSize(`Observação: ${pauta.observacoes}`, pageWidth - 36);
    doc.text(obsLines, 18, yPos + 6);
  }
  
  addFooter(doc);
  doc.save(`pauta_${pauta.id}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`);
}

// Interfaces para exportação de ata
interface AtaParaPDF {
  id: string;
  conteudoMarkdown: string;
  analise?: {
    resumo?: string | null;
  } | null;
  geradaEm: string;
  reuniao?: {
    titulo: string;
    data: string;
  } | null;
}

interface DecisaoIA {
  id: string;
  descricao: string;
  responsavel: string | null;
  prazo: string | null;
}

interface AcaoIA {
  id: string;
  descricao: string;
  responsavel: string | null;
  prazo: string | null;
}

interface RiscoIA {
  id: string;
  descricao: string;
  severidade: string | null;
}

interface OportunidadeIA {
  id: string;
  descricao: string;
  potencial: string | null;
}

// Exportar PDF de uma ata completa
export function exportarAtaPDF(
  ata: any,
  decisoes: any[],
  acoes: any[],
  riscos: any[],
  oportunidades: any[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const titulo = ata.reuniao?.titulo || `Ata de ${format(new Date(ata.geradaEm), "dd/MM/yyyy")}`;
  const dataFormatada = format(new Date(ata.geradaEm), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  let yPos = addHeader(doc, 'Ata de Reunião', titulo);
  
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
  };

  // INFO
  doc.setFillColor(245, 250, 250);
  doc.roundedRect(14, yPos, pageWidth - 28, 20, 3, 3, "F");

  doc.setFontSize(10);
  doc.text(`Data: ${dataFormatada}`, 18, yPos + 8);
  
  
  
  let infoX = 18;
  }
  }

  yPos += 28;
  
  // Resumo Executivo
  if (ata.analise?.resumo) {
    checkNewPage(40);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("Resumo Executivo", 14, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    const resumoLines = doc.splitTextToSize(ata.analise?.resumo, pageWidth - 36);
    doc.text(resumoLines, 18, yPos);
    yPos += resumoLines.length * 4 + 10;
  }

  // DECISÕES
  if (decisoes.length > 0) {
    checkNewPage(40);

    doc.setFontSize(11);
    doc.text(`Decisões (${decisoes.length})`, 14, yPos);
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [["Descrição", "Responsável", "Prazo"]],
      body: decisoes.map((d) => [
        d.descricao,
        d.responsavel || "-",
        d.prazo || "-",
      ]),
    });

    yPos = (doc as any).lastAutoTable?.finalY + 10;
  }

  // AÇÕES
  if (acoes.length > 0) {
    checkNewPage(40);

    doc.setFontSize(11);
    doc.text(`Ações (${acoes.length})`, 14, yPos);
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [["Descrição", "Responsável", "Prazo"]],
      body: acoes.map((a) => [
        a.descricao,
        a.responsavel || "-",
        a.prazo || "-",
      ]),
    });

    yPos = (doc as any).lastAutoTable?.finalY + 10;
  }

  // CONTEÚDO
  checkNewPage(40);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.white);
  doc.text('Conteúdo Completo', 18, yPos + 6);
  yPos += 14;
  
  // Parse markdown para texto simples
  const lines = ata.conteudoMarkdown.split('\n');
  doc.setTextColor(...COLORS.text);
  
  lines.forEach((line) => {
    checkNewPage(8);

    const text = linha.replace(/\*\*/g, "");

    const textLines = doc.splitTextToSize(text, pageWidth - 28);
    doc.text(textLines, 14, yPos);
    yPos += textLines.length * 4 + 2;
  });

  addFooter(doc);
  
  const fileName = ata.reuniao?.titulo 
    ? `ata_${ata.reuniao.titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(ata.geradaEm), 'yyyy-MM-dd')}.pdf`
    : `ata_${format(new Date(ata.geradaEm), 'yyyy-MM-dd_HHmm')}.pdf`;
  
  doc.save(fileName);
}