import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { eventTracker } from '@/analytics/EventTracker';
import { useAuth } from '@/auth/AuthProvider';
import {
  isPaymentsLive,
  PAYMENTS_COMING_SOON_MESSAGE,
} from '@/config/paymentsConfig';
import {
  getSubscriptionService,
  type ISubscriptionService,
} from '@/services/subscription/subscriptionService';
import {
  canAccessFeature,
  hasPremiumAccess,
} from '@/subscription/featureGates';
import type { PremiumFeature } from '@/subscription/featureGates';
import type {
  BillingInterval,
  Invoice,
  PlanTier,
  Subscription,
  UsageLimits,
} from '@/types/subscription';

type SubscriptionContextValue = {
  subscription: Subscription | null;
  usage: UsageLimits | null;
  invoices: Invoice[];
  isLoading: boolean;
  isPremium: boolean;
  canAccess: (feature: PremiumFeature) => boolean;
  startCheckout: (interval?: BillingInterval) => Promise<void>;
  openBillingPortal: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

type SubscriptionProviderProps = {
  children: ReactNode;
  subscriptionService?: ISubscriptionService;
};

export function SubscriptionProvider({
  children,
  subscriptionService = getSubscriptionService(),
}: SubscriptionProviderProps) {
  const { user, isAuthenticated, refreshSession } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageLimits | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const previousPlan = useRef<PlanTier | null>(null);
  const premiumTracked = useRef(false);

  const accessInput = useMemo(
    () => ({
      subscriptionStatus: user?.subscriptionStatus ?? subscription?.subscriptionStatus,
      subscriptionTier: user?.subscriptionTier ?? 'free',
    }),
    [user?.subscriptionStatus, user?.subscriptionTier, subscription?.subscriptionStatus],
  );

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setSubscription(null);
      setUsage(null);
      setInvoices([]);
      return;
    }
    setIsLoading(true);
    try {
      await refreshSession();
      const sub = await subscriptionService.getSubscription(user.id);
      const [usageData, invoiceData] = await Promise.all([
        subscriptionService.getUsage(user.id, sub.plan),
        subscriptionService.getInvoices(user.id),
      ]);
      setSubscription(sub);
      setUsage(usageData);
      setInvoices(invoiceData);

      const wasPremium = previousPlan.current === 'premium';
      const isNowPremium = hasPremiumAccess({
        subscriptionStatus: sub.subscriptionStatus,
        subscriptionTier: sub.plan === 'premium' ? 'premium' : 'free',
      });
      previousPlan.current = isNowPremium ? 'premium' : 'free';

      if (isNowPremium && !wasPremium && !premiumTracked.current) {
        premiumTracked.current = true;
        eventTracker.track('premium_subscription_activated', {
          interval: sub.interval ?? 'monthly',
          plan: sub.subscriptionPlan,
          user_id: user.id,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, subscriptionService, refreshSession]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      void refresh();
    } else {
      setSubscription(null);
      setUsage(null);
      setInvoices([]);
    }
  }, [isAuthenticated, user?.id, refresh]);

  const startCheckout = useCallback(
    async (_interval: BillingInterval = 'monthly') => {
      if (!user?.id) return;
      if (!isPaymentsLive()) {
        throw new Error(PAYMENTS_COMING_SOON_MESSAGE);
      }
      await subscriptionService.startCheckout(user.id, 'premium', 'monthly', {
        email: user.email,
        name: user.name,
      });
      await refresh();
    },
    [user, subscriptionService, refresh],
  );

  const openBillingPortal = useCallback(async () => {
    if (!user?.id) return;
    await subscriptionService.openBillingPortal(user.id);
    await refresh();
  }, [user?.id, subscriptionService, refresh]);

  const isPremium = hasPremiumAccess(accessInput);

  const canAccess = useCallback(
    (feature: PremiumFeature) => canAccessFeature(accessInput, feature),
    [accessInput],
  );

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      subscription,
      usage,
      invoices,
      isLoading,
      isPremium,
      canAccess,
      startCheckout,
      openBillingPortal,
      refresh,
    }),
    [
      subscription,
      usage,
      invoices,
      isLoading,
      isPremium,
      canAccess,
      startCheckout,
      openBillingPortal,
      refresh,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
