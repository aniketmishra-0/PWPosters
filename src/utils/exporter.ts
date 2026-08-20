import { toCanvas } from 'html-to-image';
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

  // Blur active elements to remove selection carets
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  // Ensure all images within the element are fully loaded/decoded
  const imgs = Array.from(element.querySelectorAll('img'));
  const withTimeout = (p: Promise<void>, ms: number) =>
    Promise.race([p, new Promise<void>((resolve) => setTimeout(resolve, ms))]);

  await Promise.all(
    imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return withTimeout(
        new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
        10000
      );
    })
  );

  // Strip all selection/focus/ring classes and inline styles from DOM elements before capture
  const highlightedElements = Array.from(
    element.querySelectorAll<HTMLElement>(
      '.pw-cell-text, .pw-announcement-text, .pw-announcement-badge-text, .pw-announcement-tag, .pw-header-text, .pw-subheader-text, [class*="ring-"], [class*="bg-purple-50"]'
    )
  );

  // Backup original classNames and inline styles
  const backups = highlightedElements.map((el) => ({
    el,
    className: el.className,
    boxShadow: el.style.boxShadow,
    outline: el.style.outline,
    backgroundColor: el.style.backgroundColor
  }));

  // Clean all rings, active backgrounds, and outlines
  highlightedElements.forEach((el) => {
    el.classList.remove(
      'ring-2',
      'ring-1',
      'ring-[#8b3dff]',
      'ring-purple-500',
      'ring-purple-600',
      'ring-[#ffd200]',
      'bg-purple-50/80',
      'bg-purple-50',
      'shadow-xs',
      'shadow-sm'
    );
    el.style.outline = 'none';
    el.style.boxShadow = 'none';
    if (
      el.style.backgroundColor.includes('rgb(250 245 255') ||
      el.style.backgroundColor.includes('rgba(250, 245, 255') ||
      el.style.backgroundColor.includes('purple')
    ) {
      el.style.backgroundColor = 'transparent';
    }
  });

  // Set export attribute to strip all active rings and outlines
  element.setAttribute('data-exporting', 'true');

  try {
    // Use html-to-image toCanvas with 3x pixel ratio for ultra-high 300+ DPI print quality
    const canvas = await toCanvas(element, {
      width: targetW,
      height: targetH,
      cacheBust: true,
      pixelRatio: 3,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
        margin: '0',
      },
      filter: (node) => {
        if (node instanceof HTMLElement && node.dataset && node.dataset.exportHide === 'true') {
          return false;
        }
        return true;
      }
    });

    return canvas;
  } finally {
    element.removeAttribute('data-exporting');
    // Restore element styles/classes
    backups.forEach(({ el, className, boxShadow, outline, backgroundColor }) => {
      el.className = className;
      el.style.boxShadow = boxShadow;
      el.style.outline = outline;
      el.style.backgroundColor = backgroundColor;
    });
  }
}

export async function exportPosterAsImage(
  element: HTMLElement,
  format: 'png' | 'jpeg',
  filename: string
): Promise<void> {
  const canvas = await getPosterCanvas(element);
  const dataUrl = canvas.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png', 1.0);

  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
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

  const isPortrait = targetH > targetW;
  const rootRect = element.getBoundingClientRect();
  const linkElements = Array.from(
    element.querySelectorAll('a[href], [data-pdf-link]')
  ) as HTMLElement[];

  const linksData: Array<{ x: number; y: number; w: number; h: number; url: string }> = [];

  const pdfWidth = isPortrait ? 595.28 : targetW;
  const pdfHeight = isPortrait ? 841.89 : targetH;

  if (rootRect.width > 0 && rootRect.height > 0) {
    const scaleX = pdfWidth / rootRect.width;
    const scaleY = pdfHeight / rootRect.height;

    linkElements.forEach((el) => {
      const href = el.getAttribute('href') || el.getAttribute('data-pdf-link');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        const rect = el.getBoundingClientRect();
        const x = Math.max(0, (rect.left - rootRect.left) * scaleX);
        const y = Math.max(0, (rect.top - rootRect.top) * scaleY);
        const w = Math.min(pdfWidth, rect.width * scaleX);
        const h = Math.min(pdfHeight, rect.height * scaleY);

        if (w > 0 && h > 0) {
          linksData.push({ x, y, w, h, url: href });
        }
      }
    });
  }

  const canvas = await getPosterCanvas(element);
  const imgData = canvas.toDataURL('image/png', 1.0);

  const pdf = new jsPDF({
    orientation: isPortrait ? 'portrait' : 'landscape',
    unit: 'pt',
    format: isPortrait ? 'a4' : [targetW, targetH],
    compress: true
  });

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'SLOW');

  linksData.forEach((link) => {
    try {
      pdf.link(link.x, link.y, link.w, link.h, { url: link.url });
    } catch {}
  });

  // Default PW smart link fallback for syllabus PDF
  if (element.id === 'pw-syllabus-pdf-root' && linksData.length === 0) {
    pdf.link(150, 780, 250, 30, { url: 'https://smart.link/7wwosivoicgd4' });
  }

  pdf.save(`${filename}.pdf`);
}

export async function copyPosterToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    if (!navigator.clipboard?.write) {
      return false;
    }
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

