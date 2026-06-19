import type {
  AnalyticsAdapterName,
  AnalyticsEvent,
  AnalyticsEventName,
} from '@/types/analytics';
import { sanitizeEventProperties } from './sanitizeProperties';

const STORAGE_KEY = 'petclues_analytics_events';
const MAX_STORED_EVENTS = 200;

async function withPostHog(
  run: (api: typeof import('./posthog')) => void | Promise<void>,
): Promise<void> {
  try {
    const api = await import('./posthog');
    await run(api);
  } catch {
    // Analytics must never block UI.
  }
}

export interface IAnalyticsAdapter {
  name: AnalyticsAdapterName;
  track(event: AnalyticsEvent): void;
  identify?(userId: string, traits?: Record<string, string | number | boolean>): void;
  pageView?(path: string, title?: string): void;
}

/** Console adapter - active in development */
export const consoleAdapter: IAnalyticsAdapter = {
  name: 'console',
  track(event) {
    if (import.meta.env.DEV) {
      console.info('[Analytics]', event.name, event.properties ?? {});
    }
  },
  pageView(path, title) {
    if (import.meta.env.DEV) {
      console.info('[Analytics] page_view', { path, title });
    }
  },
};

/** LocalStorage adapter - stores events for beta dashboard */
export const localStorageAdapter: IAnalyticsAdapter = {
  name: 'localStorage',
  track(event) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
      events.unshift(event);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events.slice(0, MAX_STORED_EVENTS)),
      );
    } catch {
      // Storage unavailable
    }
  },
};

export const posthogAdapter: IAnalyticsAdapter = {
  name: 'posthog',
  track(event) {
    void withPostHog(({ isPostHogEnabled, capturePostHogEvent }) => {
      if (!isPostHogEnabled()) return;
      const properties = event.properties
        ? (Object.fromEntries(
            Object.entries(event.properties).filter(([, value]) => value !== null),
          ) as Record<string, string | number | boolean>)
        : undefined;
      capturePostHogEvent(event.name, properties);
    });
  },
  identify(userId, traits) {
    void withPostHog(({ isPostHogEnabled, identifyPostHogUser }) => {
      if (!isPostHogEnabled()) return;
      identifyPostHogUser(userId, traits);
    });
  },
  pageView(path, title) {
    void withPostHog(({ isPostHogEnabled, capturePostHogEvent }) => {
      if (!isPostHogEnabled()) return;
      capturePostHogEvent('$pageview', {
        path,
        title: title ?? path,
      });
    });
  },
};

export const plausibleAdapter: IAnalyticsAdapter = {
  name: 'plausible',
  track(event) {
    // plausible(event.name, { props: event.properties });
    void event;
  },
};

export const googleAnalyticsAdapter: IAnalyticsAdapter = {
  name: 'google_analytics',
  track(event) {
    // gtag('event', event.name, event.properties);
    void event;
  },
};

export const mixpanelAdapter: IAnalyticsAdapter = {
  name: 'mixpanel',
  track(event) {
    // mixpanel.track(event.name, event.properties);
    void event;
  },
};

function getSessionId(): string {
  const key = 'petclues_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

export class EventTracker {
  private adapters: IAnalyticsAdapter[];
  private userId?: string;

  constructor(adapters: IAnalyticsAdapter[] = [consoleAdapter, localStorageAdapter]) {
    this.adapters = adapters;
  }

  setUserId(
    userId: string | undefined,
    traits?: Record<string, string | number | boolean>,
  ) {
    const hadUser = Boolean(this.userId);
    this.userId = userId;
    if (userId) {
      for (const adapter of this.adapters) {
        adapter.identify?.(userId, traits);
      }
      return;
    }
    // Only reset on sign-out - not on initial anonymous page load.
    if (hadUser) {
      void withPostHog(({ resetPostHog }) => resetPostHog());
    }
  }

  track(name: AnalyticsEventName, properties?: AnalyticsEvent['properties']) {
    const event: AnalyticsEvent = {
      name,
      properties: sanitizeEventProperties(properties),
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: getSessionId(),
    };
    for (const adapter of this.adapters) {
      adapter.track(event);
    }
  }

  pageView(path: string, title?: string) {
    this.track('page_view', { path, title: title ?? path });
    for (const adapter of this.adapters) {
      adapter.pageView?.(path, title);
    }
  }

  getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  clearStoredEvents() {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const eventTracker = new EventTracker([
  consoleAdapter,
  localStorageAdapter,
  posthogAdapter,
  // plausibleAdapter,
  // googleAnalyticsAdapter,
  // mixpanelAdapter,
]);
