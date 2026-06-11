/**
 * Subscription service — Supabase + Razorpay checkout.
 */

import { isSupabaseConfigured } from '@/services/supabase/config';
import type { CommercialPlan } from '@/subscription/entitlements';
import {
  getDecoderLifetimeLimit,
  getDecoderMonthlyLimit,
  getDocumentLimit,
  getFamilySharingLimit,
  getHealthRecordLimit,
  getPetLimit,
  getReminderLimit,
  getTimelineDayLimit,
} from '@/subscription/entitlements';
import type {
  BillingInterval,
  CheckoutPlan,
  CheckoutPrefill,
  Invoice,
  Subscription,
  UsageLimits,
} from '@/types/subscription';
import { supabaseSubscriptionService } from './supabaseSubscriptionService';

export interface ISubscriptionService {
  getSubscription(userId: string): Promise<Subscription>;
  getUsage(userId: string, plan: CommercialPlan): Promise<UsageLimits>;
  getInvoices(userId: string): Promise<Invoice[]>;
  startCheckout(
    userId: string,
    plan: CheckoutPlan,
    interval: BillingInterval,
    prefill: CheckoutPrefill,
  ): Promise<void>;
  openBillingPortal(userId: string): Promise<void>;
}

const SUB_KEY = 'petclues_subscription';
const PETS_STORAGE_KEY = 'petclues_pets';
const DOCUMENTS_STORAGE_KEY = 'petclues_pet_documents';
const REMINDERS_STORAGE_KEY = 'petclues_reminders';
const HEALTH_RECORDS_STORAGE_KEY = 'petclues_health_records';

function getMockPetIdsForUser(userId: string): string[] {
  try {
    const raw = localStorage.getItem(PETS_STORAGE_KEY);
    if (!raw) return [];
    const store = JSON.parse(raw) as Record<string, { id: string }[]>;
    return (store[userId] ?? []).map((pet) => pet.id);
  } catch {
    return [];
  }
}

function countMockRowsForPetIds<T extends { pet_id?: string; petId?: string }>(
  storageKey: string,
  petIds: string[],
  predicate?: (row: T) => boolean,
): number {
  if (petIds.length === 0) return 0;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return 0;
    const rows = JSON.parse(raw) as T[];
    return rows.filter((row) => {
      const petId = row.pet_id ?? row.petId;
      if (!petId || !petIds.includes(petId)) return false;
      return predicate ? predicate(row) : true;
    }).length;
  } catch {
    return 0;
  }
}

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
    commercialPlan: 'free',
    plan: 'free',
    interval: 'monthly',
    status: 'inactive',
    renewalDate: null,
    cancelAtPeriodEnd: false,
    subscriptionPlan: 'free',
    subscriptionStatus: 'inactive',
    subscriptionTier: 'free',
    billingProvider: 'razorpay',
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

  async getUsage(userId, plan) {
    const timelineDays = getTimelineDayLimit(plan);
    const petIds = getMockPetIdsForUser(userId);
    const petCount = petIds.length;
    const documentCount = countMockRowsForPetIds<{ pet_id: string }>(
      DOCUMENTS_STORAGE_KEY,
      petIds,
    );
    const reminderCount = countMockRowsForPetIds<{ pet_id: string; completed?: boolean }>(
      REMINDERS_STORAGE_KEY,
      petIds,
      (row) => row.completed !== true,
    );
    const healthRecordCount = countMockRowsForPetIds<{ pet_id: string }>(
      HEALTH_RECORDS_STORAGE_KEY,
      petIds,
    );
    return {
      pets: { used: petCount, limit: getPetLimit(plan) },
      documents: { used: documentCount, limit: getDocumentLimit(plan) },
      scans: { used: 0, limit: getDecoderMonthlyLimit(plan) },
      scansLifetime: { used: 0, limit: getDecoderLifetimeLimit(plan) },
      timelineDays: { used: 0, limit: timelineDays },
      timelineMonths: { used: 0, limit: timelineDays != null ? 1 : null },
      familyMembers: { used: 0, limit: getFamilySharingLimit(plan) },
      reminders: { used: reminderCount, limit: getReminderLimit(plan) },
      healthRecords: { used: healthRecordCount, limit: getHealthRecordLimit(plan) },
    };
  },

  async getInvoices(_userId) {
    return [];
  },

  async startCheckout(userId, plan, interval, _prefill) {
    const subs = loadSubs();
    const renewal = new Date();
    renewal.setMonth(renewal.getMonth() + (interval === 'yearly' ? 12 : 1));

    const updated: StoredSub = {
      userId,
      commercialPlan: plan,
      plan: 'premium',
      interval,
      status: 'active',
      renewalDate: renewal.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      cancelAtPeriodEnd: false,
      subscriptionPlan: plan,
      subscriptionStatus: 'active',
      subscriptionTier: 'premium',
      billingProvider: 'razorpay',
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
