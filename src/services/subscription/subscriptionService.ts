/**
 * Subscription service — Supabase subscription state.
 * Live checkout: Razorpay (pending). Legacy Stripe edge functions remain in repo but are not the deployment path.
 */

import { isSupabaseConfigured } from '@/services/supabase/config';
import type {
  BillingInterval,
  Invoice,
  PlanTier,
  Subscription,
  UsageLimits,
} from '@/types/subscription';
import { FREE_PET_LIMIT } from '@/subscription/featureGates';
import { supabaseSubscriptionService } from './supabaseSubscriptionService';

export interface ISubscriptionService {
  getSubscription(userId: string): Promise<Subscription>;
  getUsage(userId: string, plan: PlanTier): Promise<UsageLimits>;
  getInvoices(userId: string): Promise<Invoice[]>;
  startCheckout(userId: string, plan: PlanTier, interval: BillingInterval): Promise<void>;
  openBillingPortal(userId: string): Promise<void>;
}

const SUB_KEY = 'petclues_subscription';

type StoredSub = Subscription & { userId: string };

function loadSubs(): StoredSub[] {
  try {
    const raw = localStorage.getItem(SUB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSubs(subs: StoredSub[]) {
  localStorage.setItem(SUB_KEY, JSON.stringify(subs));
}

function defaultSubscription(): Subscription {
  return {
    plan: 'free',
    interval: 'monthly',
    status: 'active',
    renewalDate: null,
    cancelAtPeriodEnd: false,
  };
}

export const mockSubscriptionService: ISubscriptionService = {
  async getSubscription(userId) {
    const subs = loadSubs();
    const found = subs.find((s) => s.userId === userId);
    if (!found) return defaultSubscription();
    const { userId: _, ...sub } = found;
    return sub;
  },

  async getUsage(_userId, plan) {
    const isFree = plan === 'free';
    return {
      pets: { used: 1, limit: isFree ? FREE_PET_LIMIT : null },
      scans: { used: 0, limit: isFree ? 0 : null },
      timelineMonths: { used: 6, limit: isFree ? 6 : null },
    };
  },

  async getInvoices(_userId) {
    return [];
  },

  async startCheckout(userId, plan, interval) {
    const subs = loadSubs();
    const renewal = new Date();
    renewal.setMonth(renewal.getMonth() + (interval === 'yearly' ? 12 : 1));

    const updated: StoredSub = {
      userId,
      plan,
      interval,
      status: 'active',
      renewalDate: renewal.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      cancelAtPeriodEnd: false,
    };

    const idx = subs.findIndex((s) => s.userId === userId);
    if (idx >= 0) subs[idx] = updated;
    else subs.push(updated);
    saveSubs(subs);
  },

  async openBillingPortal(userId) {
    const subs = loadSubs();
    const idx = subs.findIndex((s) => s.userId === userId);
    const downgraded: StoredSub = { userId, ...defaultSubscription() };
    if (idx >= 0) subs[idx] = downgraded;
    else subs.push(downgraded);
    saveSubs(subs);
  },
};

export function getSubscriptionService(): ISubscriptionService {
  return isSupabaseConfigured() ? supabaseSubscriptionService : mockSubscriptionService;
}
