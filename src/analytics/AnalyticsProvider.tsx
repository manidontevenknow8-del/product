import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { eventTracker, type EventTracker } from './EventTracker';
import type { AnalyticsEvent, AnalyticsEventName } from '@/types/analytics';
import { getPageSEO } from '@/data/seoConfig';

type AnalyticsContextValue = {
  track: (name: AnalyticsEventName, properties?: AnalyticsEvent['properties']) => void;
  recentEvents: AnalyticsEvent[];
  refreshEvents: () => void;
  clearEvents: () => void;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

type AnalyticsProviderProps = {
  children: ReactNode;
  tracker?: EventTracker;
};

export function AnalyticsProvider({
  children,
  tracker = eventTracker,
}: AnalyticsProviderProps) {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const location = useLocation();
  const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    if (!user) {
      tracker.setUserId(undefined);
      return;
    }
    tracker.setUserId(user.id, {
      email: user.email,
      plan: user.subscriptionTier ?? subscription?.plan ?? 'free',
    });
  }, [user?.id, user?.email, user?.subscriptionTier, subscription?.plan, tracker]);

  useEffect(() => {
    const seo = getPageSEO(location.pathname);
    tracker.pageView(location.pathname, seo.title);
    setRecentEvents(tracker.getStoredEvents());
  }, [location.pathname, tracker]);

  const track = useCallback(
    (name: AnalyticsEventName, properties?: AnalyticsEvent['properties']) => {
      tracker.track(name, properties);
      setRecentEvents(tracker.getStoredEvents());
    },
    [tracker],
  );

  const refreshEvents = useCallback(() => {
    setRecentEvents(tracker.getStoredEvents());
  }, [tracker]);

  const clearEvents = useCallback(() => {
    tracker.clearStoredEvents();
    setRecentEvents([]);
  }, [tracker]);

  const value = useMemo(
    () => ({ track, recentEvents, refreshEvents, clearEvents }),
    [track, recentEvents, refreshEvents, clearEvents],
  );

  return (
    <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return ctx;
}
