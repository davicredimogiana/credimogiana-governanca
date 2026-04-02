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

  // ✅ CORREÇÃO: usar camelCase
  const dataAta = ata?.geradaEm ? new Date(ata.geradaEm) : null;

  const dataValida = dataAta && !isNaN(dataAta.getTime());

  const titulo =
    ata?.analise?.resumo?.substring(0, 60) ||
    `Ata de ${dataValida ? format(dataAta, "dd/MM/yyyy") : "Data inválida"}`;

  const dataFormatada = dataValida
    ? format(dataAta, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "Data inválida";

  let yPos = addHeader(doc, "Ata de Reunião", titulo);

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

  if (ata?.analise?.tomGeral) {
    doc.text(`Tom: ${ata.analise.tomGeral}`, pageWidth / 2, yPos + 8);
  }

  if (ata?.analise?.urgencia) {
    doc.text(`Urgência: ${ata.analise.urgencia}`, pageWidth - 50, yPos + 8);
  }

  yPos += 28;

  // RESUMO
  const resumo = ata?.analise?.resumo;

  if (resumo) {
    checkNewPage(40);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("Resumo Executivo", 14, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const lines = doc.splitTextToSize(resumo, pageWidth - 28);
    doc.text(lines, 14, yPos);
    yPos += lines.length * 4 + 10;
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
  doc.text("Conteúdo Completo", 14, yPos);
  yPos += 10;

  const conteudo = ata?.conteudoMarkdown || "";

  const linhas = conteudo.split("\n");

  linhas.forEach((linha) => {
    checkNewPage(8);

    const text = linha.replace(/\*\*/g, "");

    const textLines = doc.splitTextToSize(text, pageWidth - 28);
    doc.text(textLines, 14, yPos);
    yPos += textLines.length * 4 + 2;
  });

  addFooter(doc);

  const fileName = dataValida
    ? `ata_${format(dataAta, "yyyy-MM-dd_HHmm")}.pdf`
    : `ata.pdf`;

  doc.save(fileName);
}