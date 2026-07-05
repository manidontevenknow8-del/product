import { jsPDF } from 'jspdf';
import { exportNodeToPng } from '@/utils/imageExport';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read export image.'));
    reader.readAsDataURL(blob);
  });
}

export async function exportVetVisitPdf(node: HTMLElement, fileName: string): Promise<void> {
  const blob = await exportNodeToPng(node, 2);
  const dataUrl = await blobToDataUrl(blob);

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not prepare export layout.'));
    img.src = dataUrl;
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = (image.height * contentWidth) / image.width;

  let offsetY = margin;
  let remaining = contentHeight;

  pdf.addImage(dataUrl, 'PNG', margin, offsetY, contentWidth, contentHeight);
  remaining -= pageHeight - margin * 2;

  while (remaining > 0) {
    pdf.addPage();
    offsetY = margin - (contentHeight - remaining);
    pdf.addImage(dataUrl, 'PNG', margin, offsetY, contentWidth, contentHeight);
    remaining -= pageHeight - margin * 2;
  }

  pdf.save(fileName);
}
