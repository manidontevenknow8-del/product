import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/components/errors';
import { RootRouter } from '@/app/RootRouter';
import { initEditorialReveal } from '@/lib/editorialReveal';
import '@/styles/global.css';

initEditorialReveal();

function schedulePostHogInit() {
  const run = () => {
    void import('@/analytics/posthog').then(({ initPostHog }) => initPostHog());
  };

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 4000 });
    return;
  }

  window.addEventListener('load', () => window.setTimeout(run, 2000), { once: true });
}

function scheduleMetaPixelInit() {
  const run = () => {
    void import('@/analytics/metaPixel').then(async ({ initMetaPixel, trackMetaPageView }) => {
      const ready = await initMetaPixel();
      if (ready) trackMetaPageView();
    });
  };

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 3000 });
    return;
  }

  window.addEventListener('load', () => window.setTimeout(run, 1000), { once: true });
}

schedulePostHogInit();
scheduleMetaPixelInit();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker is a performance enhancement only.
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <RootRouter />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
