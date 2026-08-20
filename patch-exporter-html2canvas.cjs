const fs = require('fs');

const exporterCode = `
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

async function getPosterCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  const targetW = element.getAttribute('data-width')
    ? parseInt(element.getAttribute('data-width')!, 10)
    : 1280;
  const targetH = element.getAttribute('data-height')
    ? parseInt(element.getAttribute('data-height')!, 10)
    : 720;

  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  // Blur active elements to remove carets
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  // html2canvas handles DOM parsing and drawing directly to canvas.
  // It handles data URLs correctly and same-origin proxy URLs correctly.
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution
    useCORS: true,
    allowTaint: true,
    width: targetW,
    height: targetH,
    windowWidth: targetW,
    windowHeight: targetH,
    backgroundColor: '#ffffff',
    onclone: (clonedDoc, clonedElement) => {
      // Remove the CSS transform from the cloned element to ensure it renders at full size
      clonedElement.style.transform = 'none';
      clonedElement.style.margin = '0';
    }
  });

  return canvas;
}

export async function exportPosterAsImage(
  element: HTMLElement,
  format: 'png' | 'jpeg',
  filename: string
): Promise<void> {
  const canvas = await getPosterCanvas(element);
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(mimeType, 0.95);

  const link = document.createElement('a');
  link.download = \`\${filename}.\${format}\`;
  link.href = dataUrl;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 1000);
}

export async function exportPosterAsPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const targetW = element.getAttribute('data-width')
    ? parseInt(element.getAttribute('data-width')!, 10)
    : 1280;
  const targetH = element.getAttribute('data-height')
    ? parseInt(element.getAttribute('data-height')!, 10)
    : 720;

  const rootRect = element.getBoundingClientRect();
  const linkElements = Array.from(
    element.querySelectorAll('a[href], [data-pdf-link]')
  ) as HTMLElement[];

  const linksData: Array<{ x: number; y: number; w: number; h: number; url: string }> = [];

  if (rootRect.width > 0 && rootRect.height > 0) {
    const scaleX = targetW / rootRect.width;
    const scaleY = targetH / rootRect.height;

    linkElements.forEach((el) => {
      const href = el.getAttribute('href') || el.getAttribute('data-pdf-link');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        const rect = el.getBoundingClientRect();
        const x = Math.max(0, (rect.left - rootRect.left) * scaleX);
        const y = Math.max(0, (rect.top - rootRect.top) * scaleY);
        const w = Math.min(targetW, rect.width * scaleX);
        const h = Math.min(targetH, rect.height * scaleY);

        if (w > 0 && h > 0) {
          linksData.push({ x, y, w, h, url: href });
        }
      }
    });
  }

  const canvas = await getPosterCanvas(element);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF({
    orientation: targetW > targetH ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [targetW, targetH]
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, targetW, targetH);

  linksData.forEach((link) => {
    try {
      pdf.link(link.x, link.y, link.w, link.h, { url: link.url });
    } catch {}
  });

  if (element.id === 'pw-syllabus-pdf-root' && linksData.length === 0) {
    pdf.link(450, 1070, 300, 30, { url: 'https://smart.link/7wwosivoicgd4' });
  }

  pdf.save(\`\${filename}.pdf\`);
}

export async function copyPosterToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const canvas = await getPosterCanvas(element);
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}
`;

fs.writeFileSync('src/utils/exporter.ts', exporterCode);
console.log('exporter.ts rewritten to use html2canvas');
