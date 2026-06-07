import { toPng } from 'html-to-image';

async function preloadImages(node: HTMLElement): Promise<void> {
  const imgs = node.querySelectorAll('img');
  await Promise.all(
    Array.from(imgs).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }),
    ),
  );
}

function measureNode(node: HTMLElement): { width: number; height: number } {
  const rect = node.getBoundingClientRect();
  const width = Math.ceil(
    Math.max(node.scrollWidth, node.offsetWidth, rect.width, 1),
  );
  const height = Math.ceil(
    Math.max(node.scrollHeight, node.offsetHeight, rect.height, 1),
  );
  return { width, height };
}

function createCaptureClone(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute('aria-hidden');
  clone.style.position = 'fixed';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.transform = 'none';
  clone.style.zIndex = '2147483647';
  clone.style.visibility = 'visible';
  clone.style.opacity = '1';
  clone.style.pointerEvents = 'none';
  clone.style.margin = '0';
  document.body.appendChild(clone);
  return clone;
}

export async function exportNodeToPng(node: HTMLElement, pixelRatio = 2): Promise<Blob> {
  const clone = createCaptureClone(node);

  try {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    await preloadImages(clone);

    const { width, height } = measureNode(clone);
    if (height < 10 || width < 10) {
      throw new Error('Passport layout could not be measured for export.');
    }

    const dataUrl = await toPng(clone, {
      cacheBust: true,
      pixelRatio,
      backgroundColor: '#FAF8F5',
      width,
      height,
      canvasWidth: width * pixelRatio,
      canvasHeight: height * pixelRatio,
      style: {
        margin: '0',
        transform: 'none',
        overflow: 'visible',
        visibility: 'visible',
        opacity: '1',
      },
    });

    const res = await fetch(dataUrl);
    return await res.blob();
  } finally {
    clone.remove();
  }
}

export async function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
