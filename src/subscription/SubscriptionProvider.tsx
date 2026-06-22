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
import type { BillingCurrency } from '@/config/pricingConfig';
import {
  isPaymentsLive,
  PAYMENTS_COMING_SOON_MESSAGE,
} from '@/config/paymentsConfig';
import {
  getSubscriptionService,
  type ISubscriptionService,
} from '@/services/subscription/subscriptionService';
import {
  canAccessLegacyFeature,
  canAccessPlanFeature,
  canAddPet,
  canCreateHealthRecord,
  canCreateReminder,
  canUseDecoder as canUseDecoderForPlan,
  getLimitReachedMessage,
  getNextUpgradePlan,
  getPlanLabel,
  getUpgradeCta,
  getUpgradeHeadline,
  resolveEffectivePlan,
  resolveEntitlements,
  type CommercialPlan,
  type PlanFeature,
  type PremiumFeature,
} from '@/subscription/entitlements';
import { buildCheckoutIdentity } from '@/services/payments/checkoutPrefill';
import type {
  CheckoutPlan,
  Invoice,
  Subscription,
  UsageLimits,
} from '@/types/subscription';

type SubscriptionContextValue = {
  subscription: Subscription | null;
  usage: UsageLimits | null;
  invoices: Invoice[];
  isLoading: boolean;
  /** Normalized commercial plan */
  currentPlan: CommercialPlan;
  planLabel: string;
  nextUpgradePlan: CommercialPlan | null;
  upgradeCta: string;
  upgradeHeadline: string;
  /** @deprecated Use currentPlan !== 'free' */
  isPremium: boolean;
  canAccess: (feature: PremiumFeature | PlanFeature) => boolean;
  canAddPet: (currentPetCount: number) => boolean;
  canCreateReminder: (activeCount: number) => boolean;
  canCreateHealthRecord: (recordCount: number) => boolean;
  canUseDecoder: (monthlyDecodeCount: number) => boolean;
  getLimitMessage: (limitType: 'pets' | 'reminders' | 'healthRecords' | 'decoder' | 'documents') => string;
  startCheckout: (
    plan: CheckoutPlan,
    currency: BillingCurrency,
    options?: { countryCode?: string | null },
  ) => Promise<void>;
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
  const previousPlan = useRef<CommercialPlan | null>(null);
  const paidTracked = useRef(false);

  const accessInput = useMemo(
    () => ({
      subscriptionPlan: subscription?.subscriptionPlan ?? user?.subscriptionPlan,
      subscriptionStatus: user?.subscriptionStatus ?? subscription?.subscriptionStatus,
      subscriptionTier: user?.subscriptionTier ?? subscription?.subscriptionTier ?? 'free',
    }),
    [
      user?.subscriptionStatus,
      user?.subscriptionTier,
      user?.subscriptionPlan,
      subscription?.subscriptionStatus,
      subscription?.subscriptionTier,
      subscription?.subscriptionPlan,
    ],
  );

  const currentPlan = useMemo(
    () => resolveEffectivePlan(accessInput),
    [accessInput],
  );

  const entitlements = useMemo(() => resolveEntitlements(accessInput), [accessInput]);

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
        subscriptionService.getUsage(user.id, sub.commercialPlan),
        subscriptionService.getInvoices(user.id),
      ]);
      setSubscription(sub);
      setUsage(usageData);
      setInvoices(invoiceData);

      const wasPaid = previousPlan.current !== null && previousPlan.current !== 'free';
      const isNowPaid = sub.commercialPlan !== 'free';
      previousPlan.current = sub.commercialPlan;

      if (isNowPaid && !wasPaid && !paidTracked.current) {
        paidTracked.current = true;
        eventTracker.track('premium_subscription_activated', {
          billing_cycle: 'annual',
          currency: sub.currency,
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
    async (
      plan: CheckoutPlan,
      currency: BillingCurrency,
      options?: { countryCode?: string | null },
    ) => {
      if (!user?.id) return;
      if (!isPaymentsLive()) {
        throw new Error(PAYMENTS_COMING_SOON_MESSAGE);
      }
      await subscriptionService.startCheckout(user.id, plan, currency, buildCheckoutIdentity({
        email: user.email ?? '',
        name: user.name ?? '',
      }), {
        countryCode: options?.countryCode,
        foundingDiscount: user.foundingLifetimeDiscount,
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

  const PLAN_FEATURES = new Set<string>([
    'addPet', 'basicDashboard', 'basicReminders', 'basicTimeline',
    'limitedHealthRecords', 'reportPreview', 'petPassport', 'petCareScore',
    'aiRecordSearch', 'advancedReminders', 'vetBillDecoder', 'familySharing',
    'monthlyReportExport', 'premiumTimeline', 'aiHealthInsights',
    'emergencyMode', 'vetCollaborationPortal', 'smartProactiveReminders',
    'advancedAiInsights', 'advancedPetCareScore', 'prioritySupport',
    'apiAccess', 'customDomain', 'enterprisePetVolume', 'customLimitsSupport',
    'basicAi', 'careAutomation', 'richMonthlyReports', 'richTimeline',
    'advancedAutomation', 'comingSoonFeatures', 'enterpriseExclusive',
    'basicPassport', 'limitedAiInsight',
  ]);

  const canAccessFn = useCallback(
    (feature: PremiumFeature | PlanFeature) => {
      if (PLAN_FEATURES.has(feature)) {
        return canAccessPlanFeature(currentPlan, feature as PlanFeature);
      }
      return canAccessLegacyFeature(currentPlan, feature as PremiumFeature);
    },
    [currentPlan],
  );

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      subscription,
      usage,
      invoices,
      isLoading,
      currentPlan,
      planLabel: getPlanLabel(currentPlan),
      nextUpgradePlan: getNextUpgradePlan(currentPlan),
      upgradeCta: getUpgradeCta(currentPlan),
      upgradeHeadline: getUpgradeHeadline(currentPlan),
      isPremium: currentPlan !== 'free',
      canAccess: canAccessFn,
      canAddPet: (count) => canAddPet(currentPlan, count),
      canCreateReminder: (count) => canCreateReminder(currentPlan, count),
      canCreateHealthRecord: (count) => canCreateHealthRecord(currentPlan, count),
      canUseDecoder: (monthlyCount) =>
        canUseDecoderForPlan(currentPlan, {
          monthly: monthlyCount,
          lifetime: usage?.scansLifetime.used ?? monthlyCount,
        }),
      getLimitMessage: (limitType) => getLimitReachedMessage(currentPlan, limitType),
      startCheckout,
      openBillingPortal,
      refresh,
    }),
    [
      subscription,
      usage,
      invoices,
      isLoading,
      currentPlan,
      entitlements,
      canAccessFn,
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
