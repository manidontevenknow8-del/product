import posthog from 'posthog-js';

const DEBUG_PREFIX = '[POSTHOG DEBUG]';

const key = import.meta.env.VITE_POSTHOG_KEY?.trim();
const host = import.meta.env.VITE_POSTHOG_HOST?.trim();

let initialized = false;

function debug(message: string, detail?: unknown): void {
  if (!import.meta.env.DEV) return;
  if (detail !== undefined) {
    console.info(DEBUG_PREFIX, message, detail);
    return;
  }
  console.info(DEBUG_PREFIX, message);
}

export function getPostHogConfig(): { key: string | undefined; host: string | undefined } {
  return { key, host };
}

/** Initialize PostHog exactly once at application startup. */
export function initPostHog(): boolean {
  if (initialized) {
    debug('PostHog already initialized');
    return true;
  }

  debug('PostHog key loaded', key ? `${key.slice(0, 12)}…` : 'undefined');
  debug('PostHog host loaded', host ?? 'undefined');

  if (!key || !host) {
    debug('PostHog NOT initialized — VITE_POSTHOG_KEY or VITE_POSTHOG_HOST is missing');
    return false;
  }

  posthog.init(key, {
    api_host: host,
    defaults: '2026-01-30',
    person_profiles: 'always',
    capture_pageview: false,
    autocapture: true,
    persistence: 'localStorage+cookie',
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
    },
    loaded: () => {
      initialized = true;
      debug('PostHog initialized');
      capturePostHogEvent('posthog_test_app_loaded');
    },
  });

  return true;
}

export function isPostHogEnabled(): boolean {
  return initialized && posthog.__loaded === true;
}

export function capturePostHogEvent(
  event: string,
  properties?: Record<string, string | number | boolean>,
): void {
  if (!initialized) {
    debug('Event skipped — PostHog not initialized', event);
    return;
  }
  posthog.capture(event, properties, { send_instantly: true });
  debug('Event successfully fired', event);
}

export function identifyPostHogUser(
  userId: string,
  traits?: Record<string, string | number | boolean>,
): void {
  if (!initialized) {
    debug('Identify skipped — PostHog not initialized', userId);
    return;
  }
  posthog.identify(userId, traits);
  debug('User identified', { userId, traits });
}

export function resetPostHog(): void {
  if (!initialized) return;
  posthog.reset();
  debug('PostHog session reset');
}

export { posthog };
