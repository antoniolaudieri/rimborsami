import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BankAnalysis, ParsedDocumentData } from '@/hooks/useDocuments';

interface DocumentWithAnalysis {
  id: string;
  file_name: string | null;
  created_at: string;
  parsed_data: ParsedDocumentData | null;
}

interface UserInfo {
  name: string;
  email: string;
}

interface ReportTotals {
  documentsAnalyzed: number;
  withAnomalies: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  totalEstimatedRefund: number;
  totalUsuryAmount: number;
  totalLateFeeAmount: number;
  totalSuspiciousCommissions: number;
}

export async function generateAnomalyReport(
  documents: DocumentWithAnalysis[],
  user: UserInfo
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  // Colors
  const primaryColor: [number, number, number] = [30, 64, 175]; // Blue
  const criticalColor: [number, number, number] = [220, 38, 38]; // Red
  const warningColor: [number, number, number] = [234, 88, 12]; // Orange
  const textColor: [number, number, number] = [31, 41, 55]; // Dark gray
  const lightGray: [number, number, number] = [107, 114, 128];

  // Filter documents with anomalies
  const documentsWithAnomalies = documents.filter((d) => {
    const bankAnalysis = d.parsed_data?.bank_analysis;
    return bankAnalysis && (
      (bankAnalysis.risk_score ?? 0) > 0 ||
      (bankAnalysis.anomalies_found?.length ?? 0) > 0 ||
      (bankAnalysis.fees_analysis?.suspicious_fees?.length ?? 0) > 0
    );
  });

  // Calculate totals
  const totals: ReportTotals = {
    documentsAnalyzed: documents.length,
    withAnomalies: documentsWithAnomalies.length,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    totalEstimatedRefund: 0,
    totalUsuryAmount: 0,
    totalLateFeeAmount: 0,
    totalSuspiciousCommissions: 0,
  };

  documentsWithAnomalies.forEach((d) => {
    const analysis = d.parsed_data?.bank_analysis;
    if (!analysis) return;

    const riskScore = analysis.risk_score || 0;
    if (riskScore >= 75) totals.criticalCount++;
    else if (riskScore >= 50) totals.highCount++;
    else if (riskScore >= 25) totals.mediumCount++;

    totals.totalEstimatedRefund += analysis.estimated_refund || 0;
    
    if (analysis.interest_analysis?.excess_amount) {
      totals.totalUsuryAmount += analysis.interest_analysis.excess_amount;
    }
    if (analysis.late_fees_analysis?.total_late_fees) {
      totals.totalLateFeeAmount += analysis.late_fees_analysis.total_late_fees;
    }
    analysis.fees_analysis?.suspicious_fees?.forEach((fee) => {
      totals.totalSuspiciousCommissions += fee.amount || 0;
    });
  });

  // Generate unique protocol number
  const protocolNumber = `RPT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const reportDate = new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let yPos = margin;

  // ===== HEADER =====
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT ANALISI ANOMALIE BANCARIE', margin, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Protocollo: ${protocolNumber}`, margin, 35);
  doc.text(`Data: ${reportDate}`, pageWidth - margin, 35, { align: 'right' });

  yPos = 55;

  // ===== USER DATA =====
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DATI RICHIEDENTE', margin, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${user.name || 'Non specificato'}`, margin, yPos);
  yPos += 5;
  doc.text(`Email: ${user.email || 'Non specificata'}`, margin, yPos);
  yPos += 5;
  doc.text(`Data analisi: ${new Date().toLocaleDateString('it-IT')}`, margin, yPos);
  yPos += 12;

  // ===== EXECUTIVE SUMMARY =====
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, yPos, contentWidth, 45, 3, 3, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RIEPILOGO ESECUTIVO', margin + 5, yPos + 8);

  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryY = yPos + 16;
  
  doc.text(`• Documenti analizzati: ${totals.documentsAnalyzed}`, margin + 5, summaryY);
  doc.text(`• Documenti con anomalie: ${totals.withAnomalies}`, margin + 5, summaryY + 6);
  
  doc.setTextColor(...criticalColor);
  doc.text(`• Rischio critico: ${totals.criticalCount}`, margin + 75, summaryY);
  doc.setTextColor(...warningColor);
  doc.text(`• Rischio alto: ${totals.highCount}`, margin + 75, summaryY + 6);
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `STIMA RIMBORSO TOTALE: €${totals.totalEstimatedRefund.toLocaleString('it-IT')}`,
    margin + 5,
    summaryY + 20
  );

  yPos += 52;

  // ===== REGULATORY REFERENCES =====
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RIFERIMENTI NORMATIVI', margin, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);

  const regulations = [
    'L. 108/1996 - Disposizioni in materia di usura',
    'Art. 1815, comma 2, c.c. - Nullità clausole usurarie e restituzione eccedenze',
    'Art. 117-120 TUB (D.Lgs. 385/1993) - Trasparenza delle condizioni contrattuali',
    'D.M. del MEF - Rilevazione trimestrale Tassi Soglia Usura (TEGM)',
    'Delibere CICR in materia di anatocismo bancario',
  ];

  regulations.forEach((reg) => {
    doc.text(`• ${reg}`, margin, yPos);
    yPos += 5;
  });
  yPos += 8;

  // Helper to format period
  const formatPeriod = (analysis: BankAnalysis): string => {
    if (analysis.period?.from && analysis.period?.to) {
      return `${analysis.period.from} - ${analysis.period.to}`;
    }
    return 'N/D';
  };

  // ===== ANOMALY DETAIL TABLE =====
  if (documentsWithAnomalies.length > 0) {
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETTAGLIO ANOMALIE RILEVATE', margin, yPos);
    yPos += 5;

    const tableData = documentsWithAnomalies.map((d) => {
      const analysis = d.parsed_data?.bank_analysis;
      const anomalies = analysis?.anomalies_found || [];
      const riskScore = analysis?.risk_score || 0;
      const riskLevel = riskScore >= 75 ? 'CRITICO' : riskScore >= 50 ? 'ALTO' : riskScore >= 25 ? 'MEDIO' : 'BASSO';
      
      return [
        d.file_name?.substring(0, 25) || 'N/D',
        analysis?.bank_name || 'N/D',
        analysis ? formatPeriod(analysis) : 'N/D',
        anomalies.slice(0, 2).join(', ') || 'Nessuna',
        `${riskScore}/100 (${riskLevel})`,
        `€${(analysis?.estimated_refund || 0).toLocaleString('it-IT')}`,
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Documento', 'Banca', 'Periodo', 'Anomalie', 'Rischio', 'Stima Rimborso']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: textColor,
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 40 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Check if we need a new page
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = margin;
  }

  // ===== DETAILED BREAKDOWN BY DOCUMENT =====
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ANALISI DETTAGLIATA PER DOCUMENTO', margin, yPos);
  yPos += 8;

  documentsWithAnomalies.forEach((docItem, index) => {
    const analysis = docItem.parsed_data?.bank_analysis;
    if (!analysis) return;

    // Check page break
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margin, yPos, contentWidth, 50, 2, 2, 'F');

    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${docItem.file_name || 'Documento'}`, margin + 3, yPos + 7);

    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    let detailY = yPos + 14;
    
    // Bank and period
    doc.text(`Banca: ${analysis.bank_name || 'N/D'} | Periodo: ${formatPeriod(analysis)}`, margin + 3, detailY);
    detailY += 5;

    // Interest analysis
    if (analysis.interest_analysis) {
      const ia = analysis.interest_analysis;
      doc.text(
        `Tassi: TAN ${ia.nominal_rate || 'N/D'}% | TAEG ${ia.effective_rate || 'N/D'}% | Soglia usura: ${ia.usury_threshold || 'N/D'}% | Eccedenza: €${(ia.excess_amount || 0).toLocaleString('it-IT')}`,
        margin + 3,
        detailY
      );
      detailY += 5;
    }

    // Late fees
    if (analysis.late_fees_analysis) {
      const lfa = analysis.late_fees_analysis;
      doc.text(
        `Interessi mora: Totale €${(lfa.total_late_fees || 0).toLocaleString('it-IT')} | Limite legale: ${lfa.legal_limit || 'N/D'}% | Eccedenza: €${(lfa.excess_amount || 0).toLocaleString('it-IT')}`,
        margin + 3,
        detailY
      );
      detailY += 5;
    }

    // Suspicious fees
    if (analysis.fees_analysis?.suspicious_fees && analysis.fees_analysis.suspicious_fees.length > 0) {
      const feeTotal = analysis.fees_analysis.suspicious_fees.reduce((sum, f) => sum + (f.amount || 0), 0);
      doc.text(
        `Commissioni sospette: ${analysis.fees_analysis.suspicious_fees.length} rilevate | Totale: €${feeTotal.toLocaleString('it-IT')}`,
        margin + 3,
        detailY
      );
      detailY += 5;
    }

    // Risk and refund
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...criticalColor);
    doc.text(
      `Risk Score: ${analysis.risk_score || 0}/100 | Stima Rimborso: €${(analysis.estimated_refund || 0).toLocaleString('it-IT')}`,
      margin + 3,
      detailY
    );

    yPos += 55;
  });

  // ===== REFUND BREAKDOWN TABLE =====
  if (yPos > pageHeight - 70) {
    doc.addPage();
    yPos = margin;
  }

  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RIEPILOGO STIME RIMBORSO', margin, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [['Tipologia', 'Importo Stimato']],
    body: [
      ['Interessi usurari (L. 108/1996)', `€${totals.totalUsuryAmount.toLocaleString('it-IT')}`],
      ['Interessi di mora eccedenti', `€${totals.totalLateFeeAmount.toLocaleString('it-IT')}`],
      ['Commissioni indebite', `€${totals.totalSuspiciousCommissions.toLocaleString('it-IT')}`],
      ['TOTALE POTENZIALE RIMBORSO', `€${totals.totalEstimatedRefund.toLocaleString('it-IT')}`],
    ],
    theme: 'plain',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 10,
      textColor: textColor,
    },
    styles: {
      lineColor: [200, 200, 200],
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
    didParseCell: (data) => {
      if (data.row.index === 3) {
        data.cell.styles.fillColor = [240, 253, 244];
        data.cell.styles.textColor = [22, 101, 52];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 11;
      }
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ===== DISCLAIMER =====
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = margin;
  }

  doc.setFillColor(254, 243, 199);
  doc.roundedRect(margin, yPos, contentWidth, 38, 2, 2, 'F');

  doc.setTextColor(146, 64, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('AVVERTENZE E DISCLAIMER', margin + 3, yPos + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const disclaimers = [
    '• Le stime sono indicative e basate sull\'analisi automatizzata dei documenti forniti.',
    '• Per una valutazione definitiva si consiglia una perizia tecnica da parte di un professionista abilitato.',
    '• I calcoli seguono le metodologie raccomandate dalla Banca d\'Italia e dalla giurisprudenza consolidata.',
    '• Il diritto al rimborso è soggetto a prescrizione ordinaria decennale (Art. 2946 c.c.).',
    '• Il presente report non costituisce parere legale né consulenza finanziaria.',
  ];

  let disclaimerY = yPos + 13;
  disclaimers.forEach((d) => {
    doc.text(d, margin + 3, disclaimerY);
    disclaimerY += 5;
  });

  // ===== FOOTER =====
  const addFooter = (pageNum: number) => {
    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.text(
      `Pagina ${pageNum} - Report generato il ${reportDate} - Protocollo ${protocolNumber}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i);
  }

  // Save the PDF
  const fileName = `Report_Anomalie_Bancarie_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
