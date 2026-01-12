import jsPDF from 'jspdf';

interface RequestPdfData {
  subject: string;
  recipient: string;
  content: string;
  senderName: string;
  senderEmail: string;
  opportunityTitle: string;
  legalReference?: string;
  sourceUrl?: string;
  date: string;
}

export function generateRequestPdf(data: RequestPdfData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let yPosition = 20;

  // Header
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Data: ${data.date}`, marginLeft, yPosition);
  yPosition += 10;

  // Sender info (right-aligned)
  doc.setFontSize(10);
  doc.text(data.senderName, pageWidth - marginRight, yPosition, { align: 'right' });
  yPosition += 5;
  doc.text(data.senderEmail, pageWidth - marginRight, yPosition, { align: 'right' });
  yPosition += 15;

  // Recipient
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text('Spett.le', marginLeft, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(data.recipient, marginLeft, yPosition);
  doc.setFont('helvetica', 'normal');
  yPosition += 15;

  // Subject
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Oggetto: ${data.subject}`, marginLeft, yPosition);
  doc.setFont('helvetica', 'normal');
  yPosition += 10;

  // Horizontal line
  doc.setDrawColor(200);
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 10;

  // Content
  doc.setFontSize(10);
  doc.setTextColor(0);
  
  // Split content into lines that fit the page width
  const splitContent = doc.splitTextToSize(data.content, contentWidth);
  
  splitContent.forEach((line: string) => {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(line, marginLeft, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  // Legal reference box
  if (data.legalReference) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(245, 245, 245);
    doc.roundedRect(marginLeft, yPosition, contentWidth, 20, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Riferimento normativo:', marginLeft + 5, yPosition + 7);
    doc.setTextColor(0);
    doc.text(data.legalReference, marginLeft + 5, yPosition + 14);
    yPosition += 25;
  }

  // Source URL
  if (data.sourceUrl) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Fonte normativa:', marginLeft, yPosition);
    yPosition += 4;
    doc.setTextColor(0, 102, 204);
    doc.textWithLink(data.sourceUrl, marginLeft, yPosition, { url: data.sourceUrl });
    doc.setTextColor(0);
    yPosition += 10;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Documento generato automaticamente - ${data.opportunityTitle}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Download
  const fileName = `richiesta_${data.opportunityTitle.toLowerCase().replace(/\s+/g, '_')}_${data.date.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}
