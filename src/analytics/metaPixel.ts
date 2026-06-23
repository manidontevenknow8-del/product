const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID?.trim();
const SCRIPT_SRC = 'https://connect.facebook.net/en_US/fbevents.js';

type MetaConversionPayload = Record<string, string | number | boolean | undefined>;

/** Meta standard events fired via fbq('track', …). All others use trackCustom. */
const STANDARD_EVENTS = new Set([
  'PageView',
  'Lead',
  'InitiateCheckout',
  'Purchase',
  'CompleteRegistration',
  'AddToCart',
  'ViewContent',
  'Subscribe',
  'Contact',
  'Search',
]);

let initialized = false;
let scriptRequested = false;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function debug(message: string, detail?: unknown): void {
  if (!import.meta.env.DEV) return;
  if (detail !== undefined) {
    console.info('[Meta Pixel]', message, detail);
    return;
  }
  console.info('[Meta Pixel]', message);
}

function installFbqStub(): void {
  if (!isBrowser() || window.fbq) return;

  const fbq = function fbqCommand(...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }
    fbq.queue.push(args);
  } as NonNullable<Window['fbq']>;

  if (!window._fbq) window._fbq = fbq;
  window.fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
}

function loadPixelScript(): Promise<void> {
  if (!isBrowser()) return Promise.resolve();
  if (scriptRequested) return Promise.resolve();

  installFbqStub();
  scriptRequested = true;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Meta Pixel script failed to load'));
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);
  });
}

export function getMetaPixelId(): string | undefined {
  return PIXEL_ID || undefined;
}

export function isMetaPixelEnabled(): boolean {
  return Boolean(PIXEL_ID && initialized && isBrowser() && window.fbq);
}

/**
 * Initialize the Meta Pixel once per session.
 * Safe to call during SSR/prerender, no-ops without `window`.
 */
export async function initMetaPixel(): Promise<boolean> {
  if (!isBrowser()) return false;
  if (initialized) return true;
  if (!PIXEL_ID) {
    debug('Meta Pixel disabled, VITE_META_PIXEL_ID is not set');
    return false;
  }

  try {
    installFbqStub();
    await loadPixelScript();
    window.fbq?.('init', PIXEL_ID);
    initialized = true;
    debug('Meta Pixel initialized', `${PIXEL_ID.slice(0, 6)}…`);
    return true;
  } catch (error) {
    debug('Meta Pixel init failed', error);
    return false;
  }
}

/** SPA route change, fire after init. */
export function trackMetaPageView(): void {
  if (!isMetaPixelEnabled()) return;
  try {
    window.fbq?.('track', 'PageView');
    debug('PageView');
  } catch {
    // Analytics must never block navigation.
  }
}

/**
 * Fire a Meta conversion or custom event.
 *
 * @example trackConversion('Lead', { content_name: 'travel_calculator' })
 * @example trackConversion('InitiateCheckout', { content_name: 'commercial_pricing' })
 */
export function trackConversion(
  eventName: string,
  payload?: MetaConversionPayload,
): void {
  if (!isBrowser() || !eventName.trim()) return;

  const fbq = window.fbq;
  if (!fbq || !PIXEL_ID) {
    debug('Conversion skipped, pixel not ready', eventName);
    return;
  }

  const params = payload
    ? (Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined),
      ) as Record<string, string | number | boolean>)
    : undefined;

  try {
    if (STANDARD_EVENTS.has(eventName)) {
      fbq('track', eventName, params);
    } else {
      fbq('trackCustom', eventName, params);
    }
    debug('Conversion fired', { eventName, payload });
  } catch {
    // Analytics must never block UI.
  }
}
