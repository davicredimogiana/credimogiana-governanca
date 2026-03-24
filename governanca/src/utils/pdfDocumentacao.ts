import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Cores do design system
const COLORS = {
  primary: [33, 115, 104] as [number, number, number],
  secondary: [112, 160, 52] as [number, number, number],
  accent: [255, 107, 107] as [number, number, number],
  blue: [59, 130, 246] as [number, number, number],
  text: [30, 41, 59] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  background: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  codeBg: [241, 245, 249] as [number, number, number],
  codeText: [15, 118, 110] as [number, number, number],
};

type DocWithAutoTable = jsPDF & { lastAutoTable: { finalY: number } };

const addHeader = (doc: jsPDF, titulo: string) => {
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Governança Mogiana', 15, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(titulo, 15, 27);

  doc.setFontSize(9);
  doc.text(`Gerado em: 10/02/2026`, 195, 27, { align: 'right' });
};

// Rodapé com totalPages preenchido depois
const addFooter = (doc: jsPDF, pageNumber: number, totalPagesPlaceholder = 0) => {
  doc.setFillColor(...COLORS.background);
  doc.rect(0, 280, 210, 17, 'F');
  doc.setDrawColor(...COLORS.muted);
  doc.setLineWidth(0.3);
  doc.line(15, 280, 195, 280);

  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestão de Reuniões — Credimogiana', 15, 290);
  doc.text(`Página ${pageNumber}${totalPagesPlaceholder > 0 ? ` de ${totalPagesPlaceholder}` : ''}`, 195, 290, { align: 'right' });
};

const addSectionTitle = (doc: jsPDF, y: number, numero: string, titulo: string): number => {
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(15, y, 180, 11, 2, 2, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(numero ? `${numero}. ${titulo}` : titulo, 20, y + 7.5);

  return y + 19;
};

const addSubsection = (doc: jsPDF, y: number, titulo: string): number => {
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 15, y);
  return y + 8;
};

const addParagraph = (doc: jsPDF, y: number, texto: string, indent = 15, maxWidth = 180): number => {
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(texto, maxWidth);
  doc.text(lines, indent, y);
  return y + lines.length * 5 + 2;
};

const addBulletPoint = (doc: jsPDF, y: number, texto: string, indent = 23): number => {
  doc.setTextColor(...COLORS.secondary);
  doc.setFontSize(12);
  doc.text('•', indent - 5, y);
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(texto, 170 - indent);
  doc.text(lines, indent, y);
  return y + lines.length * 5 + 2;
};

const addCodeBlock = (doc: jsPDF, y: number, lines: string[]): number => {
  const lineH = 4.5;
  const paddingV = 5;
  const maxLineWidth = 168; // largura utilizável em mm (180 - 2*6 de padding)
  const fontSize = 7.5;
  const indent = '  '; // indentação de continuação

  doc.setFontSize(fontSize);
  doc.setFont('courier', 'normal');

  // Pré-processar linhas para wrap automático
  const wrappedLines: string[] = [];
  lines.forEach((line) => {
    if (doc.getTextWidth(line) <= maxLineWidth) {
      wrappedLines.push(line);
    } else {
      // Quebra a linha longa em pedaços
      const words = line.split('');
      let current = '';
      let isFirst = true;
      for (let i = 0; i < words.length; i++) {
        const test = current + words[i];
        if (doc.getTextWidth(test) > maxLineWidth - (isFirst ? 0 : doc.getTextWidth(indent))) {
          wrappedLines.push(current);
          current = isFirst ? indent + words[i] : indent + words[i];
          isFirst = false;
        } else {
          current = test;
        }
      }
      if (current) wrappedLines.push(current);
    }
  });

  const height = wrappedLines.length * lineH + paddingV * 2;

  doc.setFillColor(...COLORS.codeBg);
  doc.roundedRect(15, y, 180, height, 2, 2, 'F');
  doc.setDrawColor(200, 215, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, y, 180, height, 2, 2, 'S');

  doc.setTextColor(...COLORS.codeText);
  doc.setFontSize(fontSize);
  doc.setFont('courier', 'normal');

  wrappedLines.forEach((line, i) => {
    doc.text(line, 20, y + paddingV + i * lineH + 3);
  });

  doc.setFont('helvetica', 'normal');
  return y + height + 6;
};

const checkPageBreak = (doc: jsPDF, y: number, needed: number, currentPage: number[]): number => {
  if (y + needed > 270) {
    addFooter(doc, currentPage[0]);
    doc.addPage();
    currentPage[0]++;
    addHeader(doc, 'Documentação Técnica');
    return 50;
  }
  return y;
};

export const exportarDocumentacao = () => {
  const doc = new jsPDF();
  const pageRef = [1]; // Usamos array para mutabilidade em closures

  // =====================
  // PÁGINA 1: CAPA
  // =====================
  // Fundo gradiente simulado
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 297, 'F');

  // Barra decorativa
  doc.setFillColor(...COLORS.secondary);
  doc.rect(0, 160, 210, 6, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('CREDIMOGIANA — COOPERATIVA DE CRÉDITO', 105, 70, { align: 'center' });

  doc.setFontSize(38);
  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENTAÇÃO', 105, 100, { align: 'center' });
  doc.text('DO SISTEMA', 105, 118, { align: 'center' });

  doc.setFontSize(22);
  doc.setFont('helvetica', 'normal');
  doc.text('Governança Mogiana', 105, 148, { align: 'center' });

  // Badge versão
  doc.setFillColor(...COLORS.secondary);
  doc.roundedRect(82, 172, 46, 10, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Versão 2.0.0', 105, 179, { align: 'center' });

  // Informações adicionais
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 230, 225);
  doc.text('Sistema de Gestão de Reuniões com IA', 105, 210, { align: 'center' });
  doc.text('Transcrição Automática • Atas Inteligentes • Governança Corporativa', 105, 220, { align: 'center' });

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(11);
  doc.text(new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' }), 105, 260, { align: 'center' });

  addFooter(doc, pageRef[0]);

  // =====================
  // PÁGINA 2: ÍNDICE
  // =====================
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Índice');

  let y = 50;

  doc.setFillColor(...COLORS.background);
  doc.roundedRect(15, y - 5, 180, 225, 3, 3, 'F');
  y += 5;

  const indice = [
    { num: '1', titulo: 'Visão Geral do Projeto', pagina: 3 },
    { num: '2', titulo: 'Arquitetura do Sistema', pagina: 4 },
    { num: '3', titulo: 'Módulos e Funcionalidades', pagina: 5 },
    { num: '4', titulo: 'Banco de Dados (20 tabelas)', pagina: 6 },
    { num: '5', titulo: 'Integrações N8N — Payloads Completos', pagina: 8 },
    { num: '6', titulo: 'Armazenamento em Nuvem', pagina: 10 },
    { num: '7', titulo: 'Backend Functions (8 funções)', pagina: 11 },
    { num: '8', titulo: 'Endpoints e Webhooks', pagina: 13 },
    { num: '9', titulo: 'Segurança e RLS', pagina: 14 },
    { num: '10', titulo: 'Guia de Correção N8N — Payload Completo', pagina: 15 },
    { num: '11', titulo: 'Informações Finais', pagina: 16 },
  ];

  indice.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.primary);
    doc.text(`${item.num}.`, 22, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    doc.text(item.titulo, 32, y);
    doc.setTextColor(...COLORS.muted);
    doc.text(item.pagina.toString(), 190, y, { align: 'right' });

    // Linha pontilhada
    doc.setDrawColor(...COLORS.muted);
    doc.setLineDashPattern([0.8, 2], 0);
    const txtW = doc.getTextWidth(item.titulo);
    doc.line(34 + txtW + 3, y - 1, 185, y - 1);
    doc.setLineDashPattern([], 0);

    y += 14;
  });

  addFooter(doc, pageRef[0]);

  // =====================
  // PÁGINA 3: VISÃO GERAL
  // =====================
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Documentação Técnica');

  y = 50;
  y = addSectionTitle(doc, y, '1', 'Visão Geral do Projeto');

  y = addSubsection(doc, y, 'Informações Gerais');
  y = addBulletPoint(doc, y, 'Nome: Governança Mogiana');
  y = addBulletPoint(doc, y, 'Organização: Credimogiana (Cooperativa de Crédito)');
  y = addBulletPoint(doc, y, 'Versão: 2.0.0');
  y = addBulletPoint(doc, y, 'URL: [insira-a-url-de-producao]');

  y += 5;
  y = addSubsection(doc, y, 'Objetivo do Sistema');
  y = addParagraph(doc, y,
    'Sistema de gestão de reuniões corporativas com transcrição automática via IA, ' +
    'geração de atas inteligentes e acompanhamento de tarefas delegadas. Projetado para ' +
    'otimizar a governança corporativa da cooperativa, garantindo rastreabilidade de decisões ' +
    'e eficiência na comunicação organizacional. O sistema processa gravações de áudio/vídeo, ' +
    'extrai decisões, ações, riscos e oportunidades usando inteligência artificial, e distribui ' +
    'as atas por e-mail automaticamente para os destinatários configurados.'
  );

  y += 5;
  y = addSubsection(doc, y, 'Tecnologias Utilizadas');

  // Frontend
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(15, y, 55, 55, 2, 2, 'F');
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('FRONTEND', 42, y + 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  doc.text('React + Vite + TypeScript', 42, y + 16, { align: 'center' });
  doc.text('Tailwind CSS + shadcn/ui', 42, y + 24, { align: 'center' });
  doc.text('TanStack Query', 42, y + 32, { align: 'center' });
  doc.text('jsPDF + autoTable', 42, y + 40, { align: 'center' });
  doc.text('React Router v6', 42, y + 48, { align: 'center' });

  // Backend
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(80, y, 55, 55, 2, 2, 'F');
  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BACKEND', 107, y + 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  doc.text('Lovable Cloud', 107, y + 16, { align: 'center' });
  doc.text('PostgreSQL + RLS', 107, y + 24, { align: 'center' });
  doc.text('Edge Functions (Deno)', 107, y + 32, { align: 'center' });
  doc.text('Realtime Subscriptions', 107, y + 40, { align: 'center' });
  doc.text('78 políticas RLS', 107, y + 48, { align: 'center' });

  // Automação
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(145, y, 50, 55, 2, 2, 'F');
  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('AUTOMAÇÃO', 170, y + 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  doc.text('N8N Workflows', 170, y + 16, { align: 'center' });
  doc.text('OpenAI Whisper', 170, y + 24, { align: 'center' });
  doc.text('GPT / Gemini', 170, y + 32, { align: 'center' });
  doc.text('Google Drive API', 170, y + 40, { align: 'center' });
  doc.text('Nodemailer (SMTP)', 170, y + 48, { align: 'center' });

  addFooter(doc, pageRef[0]);

  // =====================
  // PÁGINA 4: ARQUITETURA
  // =====================
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Documentação Técnica');

  y = 50;
  y = addSectionTitle(doc, y, '2', 'Arquitetura do Sistema');

  y = addSubsection(doc, y, 'Diagrama de Fluxo — Upload e Processamento');

  // ── Diagrama visual com primitivas jsPDF ──────────────────────────────
  const drawArrowDown = (cx: number, fromY: number, toY: number) => {
    doc.setDrawColor(...COLORS.muted);
    doc.setLineWidth(0.6);
    doc.line(cx, fromY, cx, toY - 2);
    // ponta da seta
    doc.line(cx, toY, cx - 2.5, toY - 4);
    doc.line(cx, toY, cx + 2.5, toY - 4);
  };

  const blockW = 178;
  const blockX = 16;
  const blockCX = blockX + blockW / 2;

  // Bloco 1: Frontend
  const b1Y = y;
  const b1H = 16;
  doc.setFillColor(33, 115, 104);
  doc.roundedRect(blockX, b1Y, blockW, b1H, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('FRONTEND (React / TypeScript)', blockCX, b1Y + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Dashboard  |  Reunioes  |  Pautas  |  Atas  |  Membros  |  Config', blockCX, b1Y + 12, { align: 'center' });

  // Seta 1->2
  drawArrowDown(blockCX, b1Y + b1H, b1Y + b1H + 10);

  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.text('HTTP / Realtime', blockCX + 5, b1Y + b1H + 6, { align: 'left' });

  // Bloco 2: Edge Functions
  const b2Y = b1Y + b1H + 10;
  const b2H = 20;
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(blockX, b2Y, blockW, b2H, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('EDGE FUNCTIONS (Deno — 8 funcoes)', blockCX, b2Y + 7, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('upload-drive  •  upload-audio  •  upload-chunk  •  get-upload-url', blockCX, b2Y + 13, { align: 'center' });
  doc.text('status-update  •  ega-webhook  •  send-email-ata  •  send-email-pauta', blockCX, b2Y + 18, { align: 'center' });

  // Setas 2->3 (esquerda) e 2->4 (direita)
  const b3X = blockX;
  const b3W = 82;
  const b4X = blockX + b3W + 14;
  const b4W = blockW - b3W - 14;
  const b34Y = b2Y + b2H + 10;

  drawArrowDown(b3X + b3W / 2, b2Y + b2H, b34Y);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('PostgreSQL', b3X + b3W / 2 + 2, b2Y + b2H + 6, { align: 'left' });

  drawArrowDown(b4X + b4W / 2, b2Y + b2H, b34Y);
  doc.setTextColor(...COLORS.muted);
  doc.text('Webhook POST', b4X + b4W / 2 + 2, b2Y + b2H + 6, { align: 'left' });

  // Bloco 3: Banco de Dados
  const b3H = 18;
  doc.setFillColor(112, 160, 52);
  doc.roundedRect(b3X, b34Y, b3W, b3H, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('BANCO DE DADOS', b3X + b3W / 2, b34Y + 7, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('20 tabelas PostgreSQL', b3X + b3W / 2, b34Y + 13, { align: 'center' });

  // Bloco 4: N8N
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(b4X, b34Y, b4W, b3H, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('N8N WORKFLOWS', b4X + b4W / 2, b34Y + 7, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('ega-trigger -> Whisper -> GPT -> ega-hook', b4X + b4W / 2, b34Y + 13, { align: 'center' });

  // Seta 4->5
  const b5Y = b34Y + b3H + 10;
  drawArrowDown(b4X + b4W / 2, b34Y + b3H, b5Y);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('Google Drive API', b4X + b4W / 2 + 2, b34Y + b3H + 6, { align: 'left' });

  // Bloco 5: Google Drive (centralizado)
  const b5W = 110;
  const b5X = blockX + (blockW - b5W) / 2;
  const b5H = 16;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(b5X, b5Y, b5W, b5H, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('GOOGLE DRIVE', b5X + b5W / 2, b5Y + 7, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('01_Gravacoes/  |  03_Atas/  |  06_Auditoria/', b5X + b5W / 2, b5Y + 13, { align: 'center' });

  y = b5Y + b5H + 10;
  // ─────────────────────────────────────────────────────────────────────

  y += 3;
  y = addSubsection(doc, y, 'Componentes Principais');
  y = addBulletPoint(doc, y, 'Frontend React: Interface completa com 11 módulos e componentes reutilizáveis');
  y = addBulletPoint(doc, y, 'Edge Functions: 8 funções serverless Deno para toda a lógica de backend');
  y = addBulletPoint(doc, y, 'N8N: Orquestração de fluxos — transcrição, análise IA e callbacks de status');
  y = addBulletPoint(doc, y, 'Banco de Dados: 20 tabelas PostgreSQL com 78 políticas RLS');
  y = addBulletPoint(doc, y, 'Google Drive: Armazenamento de gravações, atas PDF e arquivos de auditoria');
  y = addBulletPoint(doc, y, 'Email SMTP: Envio automático de atas e pautas via Nodemailer no N8N');

  addFooter(doc, pageRef[0]);

  // =====================
  // PÁGINA 5: MÓDULOS
  // =====================
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Documentação Técnica');

  y = 50;
  y = addSectionTitle(doc, y, '3', 'Módulos e Funcionalidades');

  const modulos = [
    {
      nome: 'Painel Geral',
      rota: '/',
      desc: 'Dashboard com métricas principais: próxima reunião, resumo de governança, atas recentes e ações em andamento. Visão consolidada do estado atual da cooperativa.',
    },
    {
      nome: 'Reuniões',
      rota: '/reunioes',
      desc: 'Gerenciamento completo de reuniões: agendamento, calendário visual, upload de gravações (MP3/MP4), assinaturas digitais de participantes e acompanhamento de status de processamento.',
    },
    {
      nome: 'Pautas',
      rota: '/pautas',
      desc: 'Gestão de agendas com editor completo: objetivos, dados apresentados por seção, tópicos de discussão com pontos, deliberações e encaminhamentos com responsável e prazo. Exportação em PDF e envio por e-mail.',
    },
    {
      nome: 'Atas',
      rota: '/atas',
      desc: 'Recepção e visualização de atas geradas por IA. Exibe resumo executivo, conteúdo em Markdown formatado, decisões, ações, riscos e oportunidades extraídos automaticamente. Envio por e-mail para destinatários.',
    },
    {
      nome: 'Acompanhamento',
      rota: '/acompanhamento',
      desc: 'Checklist de tarefas delegadas com filtros por status (pendente, em andamento, concluída), responsável e tags coloridas. Histórico de envios de e-mails com rastreamento de leitura.',
    },
    {
      nome: 'Membros',
      rota: '/membros',
      desc: 'Cadastro e gestão de cooperados por tipo: Diretoria, Gestores, Líderes e Cooperados. Controle de membros ativos/inativos.',
    },
    {
      nome: 'Destinatários',
      rota: '/destinatarios',
      desc: 'Configuração de quem recebe e-mails de atas e pautas. Importação via CSV, vinculação com membros, agrupamento por tipo de reunião.',
    },
    {
      nome: 'Configurações',
      rota: '/configuracoes',
      desc: 'Parâmetros globais do sistema: configuração de SMTP, templates de e-mail, parâmetros do webhook N8N e preferências de notificação.',
    },
    {
      nome: 'Documentação',
      rota: '/documentacao',
      desc: 'Esta página — documentação técnica completa do sistema com arquitetura, payloads, banco de dados e guias de integração. Exportação em PDF.',
    },
  ];

  modulos.forEach((modulo) => {
    y = checkPageBreak(doc, y, 30, pageRef);

    doc.setFillColor(...COLORS.background);
    doc.roundedRect(15, y, 180, 8, 1, 1, 'F');
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(modulo.nome, 20, y + 5.5);
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    doc.text(modulo.rota, 190, y + 5.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 11;
    y = addParagraph(doc, y, modulo.desc, 20, 170);
    y += 3;
  });

  addFooter(doc, pageRef[0]);

  // =====================
  // PÁGINA 6-7: BANCO DE DADOS
  // =====================
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Documentação Técnica');

  y = 50;
  y = addSectionTitle(doc, y, '4', 'Banco de Dados');

  y = addSubsection(doc, y, 'Visão Geral — 20 Tabelas PostgreSQL');
  y = addParagraph(doc, y,
    'O banco de dados é composto por 20 tabelas organizadas em três domínios: ' +
    'Gestão de Reuniões e Pautas, Processamento de IA e Comunicação. ' +
    'Todas as tabelas possuem Row Level Security (RLS) habilitado com políticas granulares.'
  );

  y += 3;

  const tabelas = [
    { nome: 'membros', desc: 'Cooperados, gestores, diretores e líderes cadastrados', cols: 'id, nome, cargo, email, tipo, ativo, foto' },
    { nome: 'reunioes', desc: 'Reuniões agendadas e concluídas', cols: 'id, titulo, data, horario, tipo, status, local, plataforma, duracao' },
    { nome: 'pautas', desc: 'Agendas vinculadas a reuniões', cols: 'id, reuniao_id, titulo, subtitulo, contexto, status, responsavel_id' },
    { nome: 'pauta_objetivos', desc: 'Objetivos de cada pauta', cols: 'id, pauta_id, texto, ordem' },
    { nome: 'pauta_dados', desc: 'Dados apresentados por seção da pauta', cols: 'id, pauta_id, secao_titulo, label, valor, ordem' },
    { nome: 'pauta_discussoes', desc: 'Tópicos de discussão da pauta', cols: 'id, pauta_id, topico, ordem' },
    { nome: 'pauta_discussao_pontos', desc: 'Pontos detalhados de cada discussão', cols: 'id, discussao_id, texto, ordem' },
    { nome: 'pauta_deliberacoes', desc: 'Deliberações tomadas na reunião', cols: 'id, pauta_id, texto, ordem' },
    { nome: 'pauta_encaminhamentos', desc: 'Ações/encaminhamentos com responsável e prazo', cols: 'id, pauta_id, acao, responsavel, prazo, ordem' },
    { nome: 'pauta_itens', desc: 'Itens de pauta para contexto do N8N (Concierge Lógico)', cols: 'id, pauta_id, tema, responsavel_id, hora_inicio, hora_fim, ordem' },
    { nome: 'tarefas_delegadas', desc: 'Checklist de acompanhamento de tarefas', cols: 'id, descricao, responsavel_id, prazo, status, reuniao_id, tags' },
    { nome: 'atas', desc: 'Atas geradas por IA com conteúdo Markdown', cols: 'id, reuniao_id, conteudo_markdown, resumo_executivo, status, link_drive, total_decisoes, total_acoes' },
    { nome: 'decisoes_ia', desc: 'Decisões extraídas automaticamente da ata pela IA', cols: 'id, ata_id, descricao, responsavel, prazo, status' },
    { nome: 'acoes_ia', desc: 'Ações extraídas automaticamente da ata pela IA', cols: 'id, ata_id, descricao, responsavel, prazo, status' },
    { nome: 'riscos_ia', desc: 'Riscos identificados na reunião pela IA', cols: 'id, ata_id, descricao, severidade, mencoes' },
    { nome: 'oportunidades_ia', desc: 'Oportunidades identificadas na reunião pela IA', cols: 'id, ata_id, descricao, potencial, mencoes' },
    { nome: 'processamentos_gravacao', desc: 'Status e progresso do processamento de uploads', cols: 'id, reuniao_id, nome_arquivo, status, progresso, etapa_atual, link_drive, participantes, assinaturas' },
    { nome: 'destinatarios', desc: 'Lista de destinatários para envio de e-mails', cols: 'id, nome, email, cargo, grupo, ativo, membro_id, origem' },
    { nome: 'configuracoes', desc: 'Configurações globais do sistema (chave-valor JSON)', cols: 'id, chave, valor' },
    { nome: 'envios_email', desc: 'Histórico de e-mails enviados com rastreamento de leitura', cols: 'id, ata_id, destinatario_nome, destinatario_email, enviado_em, lido, lido_em' },
  ];

  autoTable(doc, {
    startY: y,
    head: [['#', 'Tabela', 'Descrição', 'Principais Colunas']],
    body: tabelas.map((t, i) => [i + 1, t.nome, t.desc, t.cols]),
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 35, fontStyle: 'bold', textColor: [15, 118, 110] },
      2: { cellWidth: 60 },
      3: { cellWidth: 77, fontStyle: 'italic', textColor: [100, 116, 139] },
    },
    margin: { left: 15, right: 15 },
    didDrawPage: () => {
      addHeader(doc, 'Documentação Técnica');
      pageRef[0]++;
      addFooter(doc, pageRef[0] - 1);
    },
  });

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 10;

  y = addSubsection(doc, y, 'Políticas de Segurança (RLS)');
  y = addParagraph(doc, y,
    'Todas as 20 tabelas possuem Row Level Security habilitado. O sistema conta com ' +
    '78 políticas RLS distribuídas para garantir que cada operação (SELECT, INSERT, UPDATE, DELETE) ' +
    'seja devidamente controlada. Ver seção 9 para detalhes completos de segurança.'
  );

  addFooter(doc, pageRef[0]);

  // =====================
  // PÁGINA 8-9: INTEGRAÇÕES N8N
  // =====================
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Documentação Técnica');

  y = 50;
  y = addSectionTitle(doc, y, '5', 'Integrações N8N — Payloads Completos');

  // Fluxo 1
  y = addSubsection(doc, y, 'Fluxo 1: EGA Trigger — Upload de Gravação');
  y = addParagraph(doc, y, 'Webhook N8N: https://[sua-url-n8n]/webhook/ega-trigger');
  y = addParagraph(doc, y, 'Acionado pela Edge Function upload-drive após arquivo estar disponível no Google Drive.');

  y += 3;
  y = addParagraph(doc, y, 'Payload JSON enviado pelo sistema ao N8N:', 15);
  y += 2;

  y = addCodeBlock(doc, y, [
    '{',
    '  "client_id": "[id-do-seu-cliente]",',
    '  "processamento_id": "uuid-do-processamento",',
    '  "file_id": "ID_do_arquivo_no_Google_Drive",',
    '  "link_drive": "https://drive.google.com/file/d/...",',
    '  "reuniao_id": "uuid-da-reuniao",',
    '  "nome_reuniao": "Reunião de Diretoria — Fevereiro/2026",',
    '  "data_reuniao": "2026-02-06",',
    '  "tipo_reuniao": "diretoria",',
    '  "participantes": ["Nome 1", "Nome 2", "Nome 3"],',
    '  "assinaturas": [',
    '    { "nome": "Fulano", "imagem": "data:image/png;base64,...", "hora": "09:15" }',
    '  ],',
    '  "tarefas_discutidas": ["Tarefa 1", "Tarefa 2"],',
    '  "pauta_id": "uuid-da-pauta",',
    '  "pauta_contexto": [',
    '    {',
    '      "tema": "Aprovação de Crédito",',
    '      "responsavel_nome": "Maria Silva",',
    '      "responsavel_cargo": "Gerente",',
    '      "hora_inicio": "09:00",',
    '      "hora_fim": "09:30"',
    '    }',
    '  ],',
    '  "folder_id": "[id-da-pasta-google-drive]",',
    '  "callback_url": "https://[sua-url-backend]/functions/v1/status-update"',
    '}',
  ]);

  addFooter(doc, pageRef[0]);

  // Página 9: Continuação N8N
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Documentação Técnica');

  y = 50;

  // Fluxo 2
  y = addSubsection(doc, y, 'Fluxo 2: EGA Webhook — Recepção da Ata Processada');
  y = addParagraph(doc, y, 'Endpoint interno: /functions/v1/ega-webhook (POST, sem JWT)');
  y = addParagraph(doc, y, 'Chamado pelo N8N após processar a gravação com Whisper + IA. Salva ata e extrações no banco.');

  y += 3;
  y = addParagraph(doc, y, 'Payload JSON que o N8N deve enviar:', 15);
  y += 2;

  y = addCodeBlock(doc, y, [
    '{',
    '  "reuniao_id": "uuid-do-processamento",',
    '  "titulo": "Reunião de Diretoria — Fevereiro/2026",',
    '  "data": "2026-02-06",',
    '  "resumo": "Texto real do resumo executivo gerado pela IA...",',
    '  "ata_markdown": "# ATA DE REUNIÃO\\n\\n## VISÃO GERAL E CONTEXTO\\n...",',
    '  "link_drive": "https://drive.google.com/file/d/[ata-pdf-id]",',
    '  "link_auditoria": "https://drive.google.com/file/d/[transcricao-id]",',
    '  "total_decisoes": 5,',
    '  "total_acoes": 3,',
    '  "total_riscos": 2,',
    '  "total_oportunidades": 4,',
    '  "decisoes": [',
    '    { "descricao": "Aprovado aumento de limite", "responsavel": "João", "prazo": "2026-03-01" }',
    '  ],',
    '  "acoes": [',
    '    { "descricao": "Elaborar relatório de inadimplência", "responsavel": "Ana", "prazo": "2026-02-28" }',
    '  ],',
    '  "riscos": [',
    '    { "descricao": "Aumento da taxa SELIC", "severidade": "alta", "mencoes": 3 }',
    '  ],',
    '  "oportunidades": [',
    '    { "descricao": "Expansão para novo município", "potencial": "alto", "mencoes": 2 }',
    '  ]',
    '}',
  ]);

  y += 3;

  // Fluxo 3
  y = addSubsection(doc, y, 'Fluxo 3: Status Update — Callbacks de Progresso');
  y = addParagraph(doc, y, 'Endpoint: /functions/v1/status-update (POST, sem JWT)');

  y = addCodeBlock(doc, y, [
    '{ "processamento_id": "uuid", "status": "transcrevendo", "etapa_atual": "Transcrevendo áudio...", "progresso": 40 }',
    '{ "processamento_id": "uuid", "status": "analisando", "etapa_atual": "IA analisando conteúdo...", "progresso": 70 }',
    '{ "processamento_id": "uuid", "status": "concluido", "progresso": 100, "link_drive": "https://..." }',
    '{ "processamento_id": "uuid", "status": "erro", "erro_mensagem": "Falha na transcrição..." }',
  ]);

  y += 3;
  y = addParagraph(doc, y, 'Valores válidos para status: enviando • enviado_drive • transcrevendo • analisando • concluido • erro');

  addFooter(doc, pageRef[0]);

  // =====================
  // PÁGINA 10: ARMAZENAMENTO
  // =====================
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Documentação Técnica');

  y = 50;
  y = addSectionTitle(doc, y, '6', 'Armazenamento em Nuvem');

  y = addSubsection(doc, y, 'Google Drive — Configuração Atual');
  y = addBulletPoint(doc, y, 'ID da Pasta Raiz: [insira-aqui-o-id-da-pasta-raiz]');
  y = addBulletPoint(doc, y, 'Autenticação: Service Account via credenciais no N8N');
  y = addBulletPoint(doc, y, 'Acesso: API Google Drive v3');

  y += 5;
  y = addSubsection(doc, y, 'Estrutura de Pastas no Drive');

  autoTable(doc, {
    startY: y,
    head: [['Pasta', 'Conteúdo', 'Retenção']],
    body: [
      ['01_Gravacoes/', 'Upload inicial do arquivo de áudio/vídeo', 'Temporário — limpa após processamento'],
      ['03_Atas/', 'PDFs das atas geradas pela IA', 'Permanente'],
      ['06_Auditoria/', 'Transcrições brutas para análise forense', 'Permanente'],
      ['07_Arquivos_Processados/', 'Gravações finalizadas e arquivadas', 'Permanente'],
    ],
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
  });

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 12;

  y = addSubsection(doc, y, 'Fluxo de Upload (Modo Atual — Upload Direto)');
  y = addParagraph(doc, y,
    'O sistema utiliza upload direto via URL pré-assinada para suportar arquivos grandes ' +
    '(vídeos de reunião podem ter vários GB). O modo legacy com Base64 foi descontinuado ' +
    'pois causava timeout nas Edge Functions para arquivos acima de 15 MB.'
  );

  y += 3;
  y = addCodeBlock(doc, y, [
    '1. Frontend solicita URL pre-assinada -> get-upload-url',
    '2. Frontend faz upload direto para o Drive usando a URL pre-assinada',
    '3. Frontend notifica conclusao -> upload-drive (action: "notify-complete")',
    '4. Edge Function envia payload para N8N (sem binario - apenas file_id)',
    '5. N8N acessa o arquivo diretamente do Drive pelo file_id',
    '6. N8N processa e retorna callbacks para status-update',
    '7. N8N entrega ata completa para ega-webhook',
  ]);

  y += 5;
  y = addSubsection(doc, y, 'Compatibilidade com Microsoft OneDrive');
  y = addParagraph(doc, y, 'Para migrar para OneDrive, as seguintes alterações são necessárias no N8N:');
  y = addBulletPoint(doc, y, 'Substituir nodes "Google Drive" por "Microsoft OneDrive"');
  y = addBulletPoint(doc, y, 'Configurar OAuth2 via Azure Active Directory (Microsoft Graph API)');
  y = addBulletPoint(doc, y, 'Adaptar IDs de pasta para formato SharePoint/OneDrive (DriveItem ID)');
  y = addBulletPoint(doc, y, 'Atualizar variáveis de ambiente no N8N (tenant_id, client_id, secret)');
  y = addBulletPoint(doc, y, 'Nenhuma alteração necessária nas Edge Functions da aplicação');

  addFooter(doc, pageRef[0]);

  // =====================
  // PÁGINA 11-12: EDGE FUNCTIONS
  // =====================
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Documentação Técnica');

  y = 50;
  y = addSectionTitle(doc, y, '7', 'Backend Functions (Edge Functions)');

  y = addParagraph(doc, y,
    'O sistema possui 8 Edge Functions Deno deployadas sem verificação JWT (configurado em ' +
    'supabase/config.toml). Todas retornam JSON com campo "success" booleano e suportam CORS.'
  );

  y += 3;

  const edgeFunctions = [
    {
      nome: 'upload-drive',
      arquivo: 'supabase/functions/upload-drive/index.ts',
      objetivo: 'Orquestrar upload de gravação e iniciar processamento no N8N',
      metodo: 'POST',
      modos: [
        'Modo notify-complete: recebe file_id + processamento_id pós-upload direto',
        'Modo legacy: recebe arquivo em Base64 (deprecated para arquivos > 15 MB)',
        'Busca contexto da pauta (itens, responsáveis, horários) para enriquecer o payload N8N',
        'Atualiza status para "enviado_drive" e notifica o webhook ega-trigger',
      ],
    },
    {
      nome: 'upload-audio',
      arquivo: 'supabase/functions/upload-audio/index.ts',
      objetivo: 'Upload direto de chunks de áudio para suporte a arquivos grandes',
      metodo: 'POST',
      modos: [
        'Recebe arquivo de áudio em partes (streaming)',
        'Gerencia montagem dos chunks no servidor',
        'Integra com get-upload-url para URL pré-assinada',
      ],
    },
    {
      nome: 'upload-chunk',
      arquivo: 'supabase/functions/upload-chunk/index.ts',
      objetivo: 'Upload multipart para arquivos de vídeo muito grandes',
      metodo: 'POST',
      modos: [
        'Suporte a upload multipart (RFC 1867)',
        'Gerencia sessão de upload com múltiplas partes',
        'Compatível com gravações de vídeo de alta resolução',
      ],
    },
    {
      nome: 'get-upload-url',
      arquivo: 'supabase/functions/get-upload-url/index.ts',
      objetivo: 'Gerar URL pré-assinada para upload direto ao Google Drive',
      metodo: 'POST',
      modos: [
        'Autentica com Google Drive API via Service Account',
        'Retorna URL de upload válida por tempo limitado',
        'Cria registro inicial em processamentos_gravacao',
        'Retorna processamento_id para rastreamento',
      ],
    },
    {
      nome: 'status-update',
      arquivo: 'supabase/functions/status-update/index.ts',
      objetivo: 'Receber callbacks do N8N para atualizar progresso em tempo real',
      metodo: 'POST',
      modos: [
        'Atualiza: status, etapa_atual, progresso (0-100), link_drive',
        'Salva erro_mensagem quando status = "erro"',
        'Define progresso = 100 automaticamente quando status = "concluido"',
        'Retorna o registro atualizado para confirmação',
      ],
    },
    {
      nome: 'ega-webhook',
      arquivo: 'supabase/functions/ega-webhook/index.ts',
      objetivo: 'Receber ata processada pelo N8N e salvar todas as extrações no banco',
      metodo: 'POST',
      modos: [
        'Valida e limpa resumo_executivo (detecta erros de IA e usa fallback do Markdown)',
        'Insere/atualiza registro na tabela atas com conteúdo Markdown',
        'Insere decisões em decisoes_ia, ações em acoes_ia',
        'Insere riscos em riscos_ia, oportunidades em oportunidades_ia',
        'Atualiza processamentos_gravacao para status "concluido"',
      ],
    },
    {
      nome: 'send-email-ata',
      arquivo: 'supabase/functions/send-email-ata/index.ts',
      objetivo: 'Enviar e-mail com a ata para os destinatários configurados',
      metodo: 'POST',
      modos: [
        'Busca destinatários configurados no banco por grupo',
        'Extrai resumo real do Markdown se resumo_executivo for inválido',
        'Gera HTML do e-mail com conteúdo formatado da ata',
        'Registra envio em envios_email com timestamp',
        'Suporte a múltiplos destinatários em batch',
      ],
    },
    {
      nome: 'send-email-pauta',
      arquivo: 'supabase/functions/send-email-pauta/index.ts',
      objetivo: 'Enviar e-mail com a pauta antes da reunião',
      metodo: 'POST',
      modos: [
        'Busca dados completos da pauta (objetivos, itens, encaminhamentos)',
        'Gera HTML formatado com todos os itens da pauta',
        'Envia para destinatários configurados por tipo de reunião',
        'Registra envio para rastreamento',
      ],
    },
  ];

  edgeFunctions.forEach((func) => {
    y = checkPageBreak(doc, y, 50, pageRef);

    // Header da função
    doc.setFillColor(...COLORS.background);
    doc.roundedRect(15, y, 180, 10, 2, 2, 'F');
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(15, y, 30, 10, 2, 2, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(func.metodo, 30, y + 6.5, { align: 'center' });
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(10);
    doc.text(func.nome, 50, y + 6.5);
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(func.arquivo, 190, y + 6.5, { align: 'right' });

    y += 13;
    y = addParagraph(doc, y, func.objetivo, 20, 170);

    func.modos.forEach((m) => {
      y = addBulletPoint(doc, y, m, 25);
    });

    y += 5;
  });

  addFooter(doc, pageRef[0]);

  // =====================
  // PÁGINA 13: ENDPOINTS
  // =====================
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Documentação Técnica');

  y = 50;
  y = addSectionTitle(doc, y, '8', 'Endpoints e Webhooks');

  y = addSubsection(doc, y, 'Edge Functions Internas (Lovable Cloud)');

  autoTable(doc, {
    startY: y,
    head: [['Endpoint', 'Método', 'JWT', 'Origem', 'Destino']],
    body: [
      ['/functions/v1/upload-drive', 'POST', 'Não', 'Frontend', 'N8N'],
      ['/functions/v1/upload-audio', 'POST', 'Não', 'Frontend', 'Drive'],
      ['/functions/v1/upload-chunk', 'POST', 'Não', 'Frontend', 'Drive'],
      ['/functions/v1/get-upload-url', 'POST', 'Não', 'Frontend', 'Drive API'],
      ['/functions/v1/status-update', 'POST', 'Não', 'N8N', 'Banco de Dados'],
      ['/functions/v1/ega-webhook', 'POST', 'Não', 'N8N', 'Banco de Dados'],
      ['/functions/v1/send-email-ata', 'POST', 'Não', 'Frontend/N8N', 'E-mail SMTP'],
      ['/functions/v1/send-email-pauta', 'POST', 'Não', 'Frontend', 'E-mail SMTP'],
    ],
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [15, 118, 110] },
      2: { halign: 'center' },
    },
    margin: { left: 15, right: 15 },
  });

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 12;

  y = addSubsection(doc, y, 'Webhooks Externos N8N');

  autoTable(doc, {
    startY: y,
    head: [['Webhook URL', 'Método', 'Chamado por', 'Finalidade']],
    body: [
      ['[sua-url-n8n]/webhook/ega-trigger', 'POST', 'upload-drive', 'Inicia processamento da gravação'],
    ],
    theme: 'striped',
    headStyles: { fillColor: COLORS.secondary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 15, right: 15 },
  });

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 12;

  y = addSubsection(doc, y, 'Autenticação e Headers');
  y = addParagraph(doc, y,
    'As Edge Functions operam sem verificação JWT (verify_jwt = false no config.toml), ' +
    'pois recebem chamadas de sistemas externos (N8N). O frontend inclui a Anon Key nos headers.'
  );

  y += 3;
  y = addCodeBlock(doc, y, [
    '// Headers para chamadas do Frontend',
    'Content-Type: application/json',
    'apikey: [insira-sua-chave-anon-aqui]',
    'Authorization: Bearer [insira-sua-chave-anon-aqui]',
    '',
    '// Headers para chamadas do N8N (sem autenticação)',
    'Content-Type: application/json',
  ]);

  addFooter(doc, pageRef[0]);

  // =====================
  // PÁGINA 14: SEGURANÇA E RLS
  // =====================
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Documentação Técnica');

  y = 50;
  y = addSectionTitle(doc, y, '9', 'Segurança e Row Level Security (RLS)');

  y = addSubsection(doc, y, 'Visão Geral');
  y = addParagraph(doc, y,
    'O sistema implementa Row Level Security (RLS) em todas as 20 tabelas PostgreSQL. ' +
    'Ao total são 78 políticas RLS que controlam granularmente quais operações ' +
    '(SELECT, INSERT, UPDATE, DELETE) são permitidas para cada contexto de acesso.'
  );

  y += 3;
  y = addSubsection(doc, y, 'Distribuição de Políticas RLS por Tabela');

  autoTable(doc, {
    startY: y,
    head: [['Tabela', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'Total']],
    body: [
      ['membros', '✓', '✓', '✓', '✓', '4'],
      ['reunioes', '✓', '✓', '✓', '✓', '4'],
      ['pautas', '✓', '✓', '✓', '✓', '4'],
      ['pauta_objetivos', '✓', '✓', '✓', '✓', '4'],
      ['pauta_dados', '✓', '✓', '✓', '✓', '4'],
      ['pauta_discussoes', '✓', '✓', '✓', '✓', '4'],
      ['pauta_discussao_pontos', '✓', '✓', '✓', '✓', '4'],
      ['pauta_deliberacoes', '✓', '✓', '✓', '✓', '4'],
      ['pauta_encaminhamentos', '✓', '✓', '✓', '✓', '4'],
      ['pauta_itens', '✓', '✓', '✓', '✓', '4'],
      ['tarefas_delegadas', '✓', '✓', '✓', '✓', '4'],
      ['atas', '✓', '✓', '✓', '✓', '4'],
      ['decisoes_ia', '✓', '✓', '✓', '✓', '4'],
      ['acoes_ia', '✓', '✓', '✓', '✓', '4'],
      ['riscos_ia', '✓', '✓', '✓', '✓', '4'],
      ['oportunidades_ia', '✓', '✓', '✓', '✓', '4'],
      ['processamentos_gravacao', '✓', '✓', '✓', '—', '3'],
      ['destinatarios', '✓', '✓', '✓', '✓', '4'],
      ['configuracoes', '✓', '✓', '✓', '—', '3'],
      ['envios_email', '✓', '✓', '—', '—', '2'],
      ['TOTAL', '', '', '', '', '78'],
    ],
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 3, halign: 'center' },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', textColor: [15, 118, 110] },
    },
    margin: { left: 15, right: 15 },
  });

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 10;

  y = addSubsection(doc, y, 'Princípios de Segurança');
  y = addBulletPoint(doc, y, 'RLS habilitado em 100% das tabelas — nenhuma tabela com acesso irrestrito');
  y = addBulletPoint(doc, y, 'Edge Functions sem JWT para webhooks externos (N8N) — isoladas por design');
  y = addBulletPoint(doc, y, 'Chave de serviço (SERVICE_ROLE_KEY) usada apenas nas Edge Functions via variáveis de ambiente');
  y = addBulletPoint(doc, y, 'Frontend usa apenas a Anon Key — sem acesso privilegiado ao banco');
  y = addBulletPoint(doc, y, 'Dados sensíveis (assinaturas, gravações) nunca trafegam pelo banco — apenas links Drive');

  addFooter(doc, pageRef[0]);

  // =====================
  // PÁGINA 15: GUIA N8N
  // =====================
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Documentação Técnica');

  y = 50;
  y = addSectionTitle(doc, y, '10', 'Guia de Correção N8N — Payload Completo para ega-webhook');

  // Alerta destacado
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(15, y, 180, 20, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, y, 180, 20, 2, 2, 'S');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠ ATENÇÃO — Problema Identificado', 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('As tabelas decisoes_ia, acoes_ia, riscos_ia e oportunidades_ia estão vazias porque o N8N', 20, y + 13);
  doc.text('não está enviando os arrays correspondentes no payload para o ega-webhook.', 20, y + 18);

  y += 28;

  y = addSubsection(doc, y, 'O que precisa ser corrigido no N8N');
  y = addParagraph(doc, y,
    'O node de IA no fluxo N8N precisa extrair e estruturar os dados da transcrição ' +
    'em JSON antes de chamar o ega-webhook. O payload deve incluir obrigatoriamente ' +
    'os campos: resumo, decisoes, acoes, riscos e oportunidades.'
  );

  y += 3;
  y = addParagraph(doc, y, 'Payload COMPLETO que o N8N deve enviar para /functions/v1/ega-webhook:', 15);
  y += 2;

  y = addCodeBlock(doc, y, [
    '{',
    '  // -- Metadados da reuniao -------------------------------------------',
    '  "reuniao_id": "uuid-do-processamento-gravacao",',
    '  "titulo": "Reuniao de Diretoria - Fevereiro/2026",',
    '  "data": "2026-02-06",',
    '',
    '  // -- Conteudo gerado pela IA ----------------------------------------',
    '  "resumo": "Texto claro e objetivo do resumo executivo (nao erro de IA)",',
    '  "ata_markdown": "# ATA DE REUNIAO\\n\\n## VISAO GERAL E CONTEXTO\\n...",',
    '',
    '  // -- Links de arquivos no Drive -------------------------------------',
    '  "link_drive": "https://drive.google.com/file/d/[id-ata-pdf]/view",',
    '  "link_auditoria": "https://drive.google.com/file/d/[id-transcricao]/view",',
    '',
    '  // -- Totalizadores --------------------------------------------------',
    '  "total_decisoes": 3,',
    '  "total_acoes": 2,',
    '  "total_riscos": 1,',
    '  "total_oportunidades": 2,',
    '',
    '  // -- Arrays de extracao IA (OBRIGATORIOS para popular o banco) ------',
    '  "decisoes": [',
    '    { "descricao": "Aprovado novo limite de credito", "responsavel": "Joao", "prazo": "2026-03-01" }',
    '  ],',
    '  "acoes": [',
    '    { "descricao": "Elaborar relatorio mensal", "responsavel": "Ana", "prazo": "2026-02-28" }',
    '  ],',
    '  "riscos": [',
    '    { "descricao": "Inadimplencia acima da meta", "severidade": "alta", "mencoes": 3 }',
    '  ],',
    '  "oportunidades": [',
    '    { "descricao": "Expansao para novos municipios", "potencial": "alto", "mencoes": 2 }',
    '  ]',
    '}',
  ]);

  y += 5;
  y = addSubsection(doc, y, 'Prompt sugerido para o node de IA no N8N');
  y = addParagraph(doc, y,
    'Instrua a IA a analisar a transcrição completa e retornar um JSON estruturado ' +
    'com os campos acima. Exemplo de prompt (adaptar ao modelo usado):'
  );

  y = addCodeBlock(doc, y, [
    'Analise a transcrição da reunião e extraia em JSON:',
    '- resumo: parágrafo objetivo com os principais pontos',
    '- decisoes: lista de decisões formalmente tomadas (descricao, responsavel, prazo)',
    '- acoes: lista de ações atribuídas (descricao, responsavel, prazo)',
    '- riscos: riscos mencionados (descricao, severidade: alta|media|baixa, mencoes)',
    '- oportunidades: oportunidades (descricao, potencial: alto|medio|baixo, mencoes)',
    'Retorne APENAS o JSON, sem explicações adicionais.',
  ]);

  addFooter(doc, pageRef[0]);

  // =====================
  // PÁGINA 16: CONCLUSÃO
  // =====================
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Documentação Técnica');

  y = 50;
  y = addSectionTitle(doc, y, '11', 'Informações Finais');

  y = addSubsection(doc, y, 'Sobre o Sistema');
  y = addBulletPoint(doc, y, 'Nome: Governança Mogiana v2.0.0');
  y = addBulletPoint(doc, y, 'Organização: Credimogiana — Cooperativa de Crédito');
  y = addBulletPoint(doc, y, 'URL de Produção: [insira-a-url-de-producao]');
  y = addBulletPoint(doc, y, 'Última atualização: 10/02/2026');

  y += 10;
  y = addSubsection(doc, y, 'Suporte e Manutenção');
  y = addParagraph(doc, y,
    'Para dúvidas técnicas ou solicitações de ajustes, consultar a equipe de desenvolvimento. ' +
    'O sistema foi construído sobre Lovable Cloud (PostgreSQL + Edge Functions) com N8N para automação.'
  );

  y += 10;
  y = addSubsection(doc, y, 'Resumo Técnico');

  autoTable(doc, {
    startY: y,
    head: [['Componente', 'Quantidade / Detalhe']],
    body: [
      ['Tabelas no banco de dados', '20 tabelas PostgreSQL'],
      ['Políticas RLS', '78 políticas de segurança'],
      ['Edge Functions', '8 funções serverless Deno'],
      ['Módulos do frontend', '11 páginas / rotas'],
      ['Fluxos N8N', '3 fluxos (ega-trigger, ega-webhook, status-update)'],
      ['Tipos de arquivo suportados', 'MP3, MP4, WAV, M4A, WebM'],
      ['Tamanho máximo de upload', 'Sem limite (upload direto via URL pré-assinada)'],
      ['E-mail SMTP', 'Configurável via Configurações do sistema'],
      ['Armazenamento de arquivos', 'Google Drive (4 pastas organizadas)'],
    ],
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { textColor: [15, 118, 110] },
    },
    margin: { left: 15, right: 15 },
  });

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 15;

  // Box final
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(15, y, 180, 40, 3, 3, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Governança Mogiana', 105, y + 13, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Documento gerado automaticamente pelo sistema.', 105, y + 22, { align: 'center' });
  doc.text('Credimogiana — Cooperativa de Crédito — Todos os direitos reservados.', 105, y + 30, { align: 'center' });

  addFooter(doc, pageRef[0]);

  // =====================
  // ATUALIZAR TOTAL DE PÁGINAS
  // em todos os rodapés já gerados
  // =====================
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Sobrescrever o rodapé com totalPages correto
    doc.setFillColor(...COLORS.background);
    doc.rect(150, 283, 55, 10, 'F');
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Página ${i} de ${totalPages}`, 195, 290, { align: 'right' });
  }

  // Salvar
  doc.save(`Documentacao_Governanca_Mogiana_2026-02-10.pdf`);
};

// ============================================================
// GUIA DE IMPLANTAÇÃO — exportarSetupPDF
// ============================================================
export const exportarSetupPDF = (): void => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageRef = [1];

  const newPage = () => {
    addFooter(doc, pageRef[0]);
    doc.addPage();
    pageRef[0]++;
    addHeader(doc, 'Guia de Implantacao — Time de TI');
    return 45;
  };

  const checkPageBreak = (y: number, needed = 20): number => {
    if (y + needed > 270) return newPage();
    return y;
  };

  // ── CAPA ────────────────────────────────────────────────────
  addHeader(doc, 'Guia de Implantacao — Time de TI');

  // Bloco central de capa
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(15, 50, 180, 100, 4, 4, 'F');

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Guia de Implantacao', 105, 80, { align: 'center' });
  doc.text('Governanca Mogiana', 105, 95, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.muted);
  doc.text('Sistema de Gestao de Reunioes — CrediMogiana', 105, 110, { align: 'center' });

  doc.setFontSize(10);
  doc.text('Versao 1.0.0 | Fevereiro/2026', 105, 124, { align: 'center' });
  doc.text('Destinatario: Time de TI', 105, 132, { align: 'center' });

  // Aviso
  doc.setFillColor(255, 243, 205);
  doc.roundedRect(15, 165, 180, 22, 3, 3, 'F');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('AVISO:', 22, 175);
  doc.setFont('helvetica', 'normal');
  doc.text('Documento sanitizado. Nenhuma credencial real esta inclusa.', 22, 182);
  doc.text('Os fluxos N8N ja estao configurados. Apenas o Frontend e banco precisam ser implantados.', 22, 188);

  // Indice
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(15, 200, 180, 65, 3, 3, 'F');
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Indice', 105, 212, { align: 'center' });

  const indiceItems = [
    'Pre-requisitos',
    'Passo 1 — Remix do Projeto no Lovable',
    'Passo 2 — Configurar o Banco de Dados',
    'Passo 3 — Coletar Credenciais do Novo Projeto',
    'Passo 4 — Configurar Secrets das Edge Functions',
    'Passo 5 — Atualizar URLs no N8N',
    'Passo 6 — Configuracoes Iniciais pelo Sistema',
    'Verificacao Final — Checklist',
  ];

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  indiceItems.forEach((item, i) => {
    doc.text(`${i + 1}.  ${item}`, 25, 220 + i * 6);
  });

  addFooter(doc, pageRef[0]);

  // ── PAGINA 2: PRE-REQUISITOS ────────────────────────────────
  doc.addPage();
  pageRef[0]++;
  addHeader(doc, 'Guia de Implantacao — Time de TI');
  let y = 45;

  y = addSectionTitle(doc, y, '', 'Pre-requisitos');
  y += 3;
  y = addParagraph(doc, y, 'Antes de iniciar, certifique-se de ter os seguintes acessos e contas:');
  y += 4;

  const prereqs = [
    ['Conta no Lovable', 'Acesse lovable.dev e crie uma conta. Plano gratuito e suficiente para comecar.'],
    ['Link de Remix', 'Fornecido pelo responsavel pelo projeto original. Sera um link direto para o projeto.'],
    ['Acesso ao N8N', 'Instancia N8N da CrediMogiana com os fluxos ja importados e configurados.'],
    ['Conta Google', 'Para autorizar o Google Drive onde as gravacoes de reunioes serao salvas.'],
    ['Conta de e-mail SMTP', 'Para envio das atas por e-mail. Recomendado: Resend (resend.com) — plano gratuito disponivel.'],
  ];

  prereqs.forEach(([titulo, desc]) => {
    y = checkPageBreak(y, 18);
    doc.setFillColor(...COLORS.background);
    doc.roundedRect(15, y, 180, 16, 2, 2, 'F');
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, 22, y + 6);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(desc, 168);
    doc.text(descLines, 22, y + 11);
    y += 20;
  });

  // ── PAGINA 3: PASSO 1 ───────────────────────────────────────
  y = newPage();

  y = addSectionTitle(doc, y, '1', 'Fazer o Remix do Projeto no Lovable');
  y += 3;
  y = addParagraph(doc, y, 'O Lovable permite "remixar" um projeto existente, criando uma copia independente com banco de dados e backend proprios.');
  y += 4;

  const passo1Steps = [
    'Acesse o link de remix fornecido pelo responsavel do projeto.',
    'Clique em "Remix this project".',
    'O Lovable cria automaticamente: frontend (React/Vite/TypeScript), banco de dados PostgreSQL isolado (Lovable Cloud) e 8 Edge Functions.',
    'Aguarde a inicializacao completa (cerca de 1-2 minutos).',
    'Anote a URL do projeto gerada (ex: https://seu-projeto.lovable.app).',
  ];

  passo1Steps.forEach((step, i) => {
    y = checkPageBreak(y, 12);
    doc.setFillColor(...COLORS.secondary);
    doc.circle(19, y - 1, 3, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${i + 1}`, 19, y + 0.5, { align: 'center' });
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(step, 162);
    doc.text(lines, 26, y);
    y += lines.length * 5 + 4;
  });

  y += 4;
  doc.setFillColor(255, 243, 205);
  doc.roundedRect(15, y, 180, 18, 3, 3, 'F');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Importante:', 20, y + 7);
  doc.setFont('helvetica', 'normal');
  const avisoLines = doc.splitTextToSize('Cada remix gera um banco de dados novo e vazio. As credenciais do projeto original nao sao copiadas — voce vai configurar as suas proprias nas etapas seguintes.', 168);
  doc.text(avisoLines, 20, y + 13);
  y += 22;

  // ── PASSO 2: BANCO DE DADOS ─────────────────────────────────
  y = checkPageBreak(y, 50);
  y = addSectionTitle(doc, y, '2', 'Configurar o Banco de Dados');
  y += 3;
  y = addParagraph(doc, y, 'Apos o remix, o banco esta vazio. Execute o script de migracao para criar as 20 tabelas e as 78 politicas de seguranca (RLS).');
  y += 4;

  y = addSubsection(doc, y, 'Onde esta o script?');
  y += 2;
  y = addCodeBlock(doc, y, ['supabase/migrations/20260206133532_consolidated_migration.sql']);
  y += 6;

  y = addSubsection(doc, y, 'Como executar:');
  y += 2;

  const passo2Steps = [
    'No painel do Lovable, clique em "View Backend" (icone de banco de dados).',
    'Navegue ate "SQL Editor".',
    'Abra o arquivo supabase/migrations/20260206133532_consolidated_migration.sql.',
    'Copie todo o conteudo e cole no SQL Editor.',
    'Clique em "Run" e verifique que nao ha erros.',
  ];

  passo2Steps.forEach((step, i) => {
    y = checkPageBreak(y, 10);
    y = addBulletPoint(doc, y, `${i + 1}. ${step}`);
  });

  y += 3;
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(15, y, 180, 12, 3, 3, 'F');
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Dica:', 20, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('O script e idempotente — pode ser executado mais de uma vez com seguranca.', 34, y + 5);
  y += 16;

  // Tabela de tabelas criadas
  y = checkPageBreak(y, 70);
  y = addSubsection(doc, y, 'Tabelas criadas (20 total):');
  y += 3;

  autoTable(doc as DocWithAutoTable, {
    startY: y,
    head: [['Tabela', 'Funcao']],
    body: [
      ['membros', 'Cooperados, gestores, diretores, lideres'],
      ['reunioes', 'Reunioes agendadas e concluidas'],
      ['pautas', 'Agendas vinculadas a reunioes'],
      ['pauta_objetivos / pauta_dados', 'Objetivos e dados apresentados'],
      ['pauta_discussoes / pauta_discussao_pontos', 'Topicos de discussao e seus pontos'],
      ['pauta_deliberacoes / pauta_encaminhamentos', 'Decisoes e acoes a realizar'],
      ['pauta_itens', 'Itens de pauta com horarios'],
      ['tarefas_delegadas', 'Checklist de acompanhamento pos-reuniao'],
      ['atas', 'Atas geradas pela IA'],
      ['decisoes_ia / acoes_ia', 'Decisoes e acoes extraidas pela IA'],
      ['riscos_ia / oportunidades_ia', 'Riscos e oportunidades identificados'],
      ['processamentos_gravacao', 'Status de upload e processamento de audio'],
      ['destinatarios / envios_email', 'E-mails destinatarios e historico de envios'],
      ['configuracoes', 'Configuracoes do sistema'],
    ],
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLORS.background },
    margin: { left: 15, right: 15 },
  });

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 10;

  // ── PASSO 3: CREDENCIAIS ─────────────────────────────────────
  y = newPage();
  y = addSectionTitle(doc, y, '3', 'Coletar as Credenciais do Novo Projeto');
  y += 3;
  y = addParagraph(doc, y, 'Apos o remix e a execucao do banco, o Lovable Cloud gera automaticamente as credenciais do seu novo projeto. Voce precisara copiá-las para configurar as Edge Functions.');
  y += 4;

  y = addSubsection(doc, y, 'Onde encontrar:');
  y += 2;

  const credSteps = [
    'No painel do Lovable, clique em "View Backend".',
    'Navegue ate "Project Settings" > "API".',
    'Copie os seguintes valores:',
  ];

  credSteps.forEach((s) => {
    y = addBulletPoint(doc, y, s);
  });

  y += 3;
  autoTable(doc as DocWithAutoTable, {
    startY: y,
    head: [['Variavel', 'Onde encontrar']],
    body: [
      ['SUPABASE_URL', 'Project URL (ex: https://xxxxx.supabase.co)'],
      ['SUPABASE_ANON_KEY', 'anon / public key'],
      ['SUPABASE_SERVICE_ROLE_KEY', 'service_role key — mantenha em segredo!'],
    ],
    styles: { fontSize: 8.5, cellPadding: 4 },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLORS.background },
    margin: { left: 15, right: 15 },
  });

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 8;

  doc.setFillColor(254, 226, 226);
  doc.roundedRect(15, y, 180, 14, 3, 3, 'F');
  doc.setTextColor(185, 28, 28);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Atencao:', 20, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text('A SERVICE_ROLE_KEY tem acesso total ao banco. Nunca a exponha publicamente ou no codigo fonte.', 20, y + 11);
  y += 18;

  // ── PASSO 4: SECRETS ─────────────────────────────────────────
  y = checkPageBreak(y, 40);
  y = addSectionTitle(doc, y, '4', 'Configurar os Secrets das Edge Functions');
  y += 3;
  y = addParagraph(doc, y, 'Os secrets sao variaveis de ambiente seguras usadas pelas Edge Functions. Configure-os no painel do Lovable Cloud.');
  y += 4;

  y = addSubsection(doc, y, 'Como configurar:');
  y += 2;

  const secretSteps = [
    'No painel do Lovable, acesse "Settings" > "Secrets".',
    'Adicione os seguintes secrets:',
  ];
  secretSteps.forEach((s) => { y = addBulletPoint(doc, y, s); });

  y += 3;
  autoTable(doc as DocWithAutoTable, {
    startY: y,
    head: [['Secret', 'Descricao', 'Exemplo']],
    body: [
      ['RESEND_API_KEY', 'Chave da API do Resend para envio de e-mails', 're_xxxxxxxxxxxxx'],
      ['N8N_WEBHOOK_URL', 'URL do webhook N8N para disparo de processamento', 'https://n8n.sua-instancia.com/webhook/xxx'],
      ['GOOGLE_DRIVE_FOLDER_ID', 'ID da pasta no Google Drive para salvar gravacoes', '1BxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxA'],
    ],
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLORS.background },
    margin: { left: 15, right: 15 },
    columnStyles: { 2: { font: 'courier', fontSize: 7 } },
  });

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 8;

  doc.setFillColor(219, 234, 254);
  doc.roundedRect(15, y, 180, 12, 3, 3, 'F');
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Dica:', 20, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('O SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY ja sao preenchidos automaticamente pelo Lovable Cloud.', 34, y + 5);
  y += 14;

  // Tabela de Edge Functions
  y = checkPageBreak(y, 70);
  y = addSubsection(doc, y, 'Edge Functions do sistema (8 funcoes):');
  y += 3;

  autoTable(doc as DocWithAutoTable, {
    startY: y,
    head: [['Funcao', 'Responsabilidade']],
    body: [
      ['upload-audio', 'Inicia upload de gravacao por chunks'],
      ['upload-chunk', 'Recebe cada chunk do arquivo de audio'],
      ['get-upload-url', 'Gera URL assinada para upload direto'],
      ['upload-drive', 'Envia arquivo finalizado para o Google Drive'],
      ['ega-webhook', 'Recebe a ata processada do N8N e salva no banco'],
      ['status-update', 'Atualiza o progresso do processamento em tempo real'],
      ['send-email-ata', 'Envia a ata por e-mail para os destinatarios'],
      ['send-email-pauta', 'Envia a pauta por e-mail antes da reuniao'],
    ],
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLORS.background },
    margin: { left: 15, right: 15 },
  });

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 10;

  // ── PASSO 5: N8N ─────────────────────────────────────────────
  y = newPage();
  y = addSectionTitle(doc, y, '5', 'Atualizar as URLs no N8N');
  y += 3;
  y = addParagraph(doc, y, 'Com o novo projeto criado, as URLs das Edge Functions mudaram. E necessario atualizar os fluxos N8N existentes para apontar para os novos endpoints.');
  y += 4;

  y = addSubsection(doc, y, 'URLs que precisam ser atualizadas:');
  y += 2;
  y = addParagraph(doc, y, 'Substitua [SEU-PROJETO-ID] pelo ID do seu novo projeto Lovable Cloud:');
  y += 3;

  autoTable(doc as DocWithAutoTable, {
    startY: y,
    head: [['Fluxo N8N', 'Nova URL']],
    body: [
      ['Recepcao da ata (ega-webhook)', 'https://[SEU-PROJETO-ID].supabase.co/functions/v1/ega-webhook'],
      ['Atualizacao de status (status-update)', 'https://[SEU-PROJETO-ID].supabase.co/functions/v1/status-update'],
      ['Upload para Drive (upload-drive)', 'https://[SEU-PROJETO-ID].supabase.co/functions/v1/upload-drive'],
    ],
    styles: { fontSize: 7.5, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLORS.background },
    margin: { left: 15, right: 15 },
    columnStyles: { 1: { font: 'courier', fontSize: 7 } },
  });

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 8;

  y = addSubsection(doc, y, 'Como atualizar no N8N:');
  y += 2;

  const n8nSteps = [
    'Acesse a interface do N8N (https://n8n.sua-instancia.com).',
    'Abra o fluxo "EGA - Governanca Mogiana" (ou nome equivalente).',
    'Localize os nos do tipo "HTTP Request" que apontam para as URLs antigas.',
    'Substitua as URLs pelos novos endpoints com o novo ID do projeto.',
    'Ative o fluxo e faca um teste com uma gravacao curta.',
  ];

  n8nSteps.forEach((step, i) => {
    y = checkPageBreak(y, 10);
    y = addBulletPoint(doc, y, `${i + 1}. ${step}`);
  });

  y += 4;
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(15, y, 180, 12, 3, 3, 'F');
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Dica:', 20, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Os fluxos N8N em si nao precisam ser reimportados — apenas as URLs dos endpoints mudam.', 34, y + 5);
  y += 16;

  // ── PASSO 6: CONFIGURACOES INICIAIS ──────────────────────────
  y = checkPageBreak(y, 40);
  y = addSectionTitle(doc, y, '6', 'Configuracoes Iniciais pelo Sistema');
  y += 3;
  y = addParagraph(doc, y, 'Apos o deploy, faca as configuracoes iniciais dentro da propria interface do Governanca Mogiana.');
  y += 4;

  const configSections = [
    {
      titulo: '6.1 — Configuracoes do Sistema (/configuracoes)',
      items: [
        'Acesse a URL do projeto no browser.',
        'Navegue ate Configuracoes no menu lateral.',
        'Insira o e-mail remetente (ex: governanca@credimogiana.com.br).',
        'Insira a URL do webhook N8N para disparo do processamento.',
        'Ative ou desative o envio automatico de atas apos processamento.',
      ],
    },
    {
      titulo: '6.2 — Cadastro de Membros (/membros)',
      items: [
        'Navegue ate Membros no menu lateral.',
        'Cadastre os membros da cooperativa com nome, cargo, e-mail e tipo.',
        'Tipos disponiveis: Diretoria, Gestores, Lideres, Cooperados.',
      ],
    },
    {
      titulo: '6.3 — Configuracao de Destinatarios (/destinatarios)',
      items: [
        'Navegue ate Destinatarios no menu lateral.',
        'Configure os e-mails que receberao as atas de cada tipo de reuniao.',
        'Opcoes: adicionar manualmente, importar via CSV ou importar dos membros.',
      ],
    },
  ];

  configSections.forEach((section) => {
    y = checkPageBreak(y, 40);
    y = addSubsection(doc, y, section.titulo);
    y += 2;
    section.items.forEach((item) => {
      y = checkPageBreak(y, 10);
      y = addBulletPoint(doc, y, item);
    });
    y += 4;
  });

  // ── PASSO 7: VERIFICACAO FINAL ────────────────────────────────
  y = newPage();
  y = addSectionTitle(doc, y, '7', 'Verificacao Final — Checklist');
  y += 3;
  y = addParagraph(doc, y, 'Marque cada item apos confirmar que esta funcionando corretamente:');
  y += 6;

  const checklistItems = [
    ['Projeto carrega', 'A URL do projeto abre no browser sem erros de JavaScript'],
    ['Banco de dados', 'As 20 tabelas foram criadas — verificar via SQL: SELECT count(*) FROM information_schema.tables WHERE table_schema = \'public\''],
    ['Criar reuniao', 'E possivel criar uma reuniao em /reunioes sem erros'],
    ['Upload funciona', 'Upload de gravacao inicia sem erro de autorizacao (401/403)'],
    ['N8N recebe webhook', 'O N8N recebe o evento e inicia o processamento automaticamente'],
    ['Ata gerada', 'A ata aparece em /atas apos o processamento ser concluido'],
    ['E-mail enviado', 'O e-mail da ata chega para os destinatarios configurados'],
    ['Pauta por e-mail', 'E possivel enviar pauta por e-mail em /pautas'],
    ['Acompanhamento', 'As tarefas delegadas aparecem em /acompanhamento'],
  ];

  checklistItems.forEach(([titulo, desc]) => {
    y = checkPageBreak(y, 18);
    doc.setFillColor(...COLORS.background);
    doc.roundedRect(15, y, 180, 15, 2, 2, 'F');
    doc.setFillColor(...COLORS.white);
    doc.roundedRect(18, y + 4, 6, 6, 1, 1, 'FD');
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.4);
    doc.roundedRect(18, y + 4, 6, 6, 1, 1, 'D');
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, 28, y + 6);
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(desc, 162);
    doc.text(descLines, 28, y + 11);
    y += 18;
  });

  // ── SOLUCAO DE PROBLEMAS ─────────────────────────────────────
  y = checkPageBreak(y, 50);
  y = addSectionTitle(doc, y, '', 'Solucao de Problemas Comuns');
  y += 3;

  autoTable(doc as DocWithAutoTable, {
    startY: y,
    head: [['Problema', 'Causa Provavel', 'Solucao']],
    body: [
      ['Upload trava em 0%', 'Secret GOOGLE_DRIVE_FOLDER_ID nao configurado', 'Verificar e adicionar o secret no painel'],
      ['Ata nao aparece', 'URL do ega-webhook nao atualizada no N8N', 'Atualizar a URL no fluxo N8N (Passo 5)'],
      ['E-mail nao chega', 'RESEND_API_KEY invalida ou dominio nao verificado', 'Verificar chave no painel do Resend'],
      ['Erro 401 nas funcoes', 'SERVICE_ROLE_KEY incorreta', 'Verificar a chave no painel do Lovable Cloud'],
      ['Tabelas nao existem', 'Migration nao foi executada', 'Executar o script SQL (Passo 2)'],
      ['Status "processando" eterno', 'N8N nao consegue alcancar o status-update', 'Verificar URL e conectividade do N8N'],
    ],
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLORS.background },
    margin: { left: 15, right: 15 },
  });

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 10;

  // ── RODAPE FINAL ─────────────────────────────────────────────
  y = checkPageBreak(y, 40);
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(15, y, 180, 35, 3, 3, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Governanca Mogiana', 105, y + 10, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestao de Reunioes — CrediMogiana', 105, y + 18, { align: 'center' });
  doc.text('Versao 1.0.0 | Fevereiro/2026 | Documento sanitizado para implantacao', 105, y + 25, { align: 'center' });

  addFooter(doc, pageRef[0]);

  // Atualizar total de paginas em todos os rodapes
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...COLORS.background);
    doc.rect(150, 283, 55, 10, 'F');
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pagina ${i} de ${totalPages}`, 195, 290, { align: 'right' });
  }

  doc.save('Guia_Implantacao_Governanca_Mogiana_2026-02-10.pdf');
};
