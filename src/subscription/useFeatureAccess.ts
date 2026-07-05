import { useMemo } from 'react';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import type { CommercialPlan } from '@/subscription/entitlements';
import {
  canUseDecoder,
  canAccessPlanFeature,
  canUseVetVisitExport,
  getDocumentLimit,
  getFamilySharingLimit,
  getPetLimit,
  getTimelineDayLimit,
  getVetVisitExportMonthlyLimit,
  hasMatrixFeatureAccess,
  planMeetsMinimum,
} from '@/subscription/entitlements';
import type { FeatureAccessResult, FeatureKey } from '@/subscription/planLimits';
import { FEATURE_UPGRADE_TIER, toSelfServeUpgradeTier } from '@/subscription/planLimits';

function quotaUpgradeTarget(plan: CommercialPlan, _feature: FeatureKey): 'Plus' | 'Pro' {
  if (plan === 'free') return 'Plus';
  if (plan === 'plus') return 'Pro';
  return 'Pro';
}

function resolveQuotaAccess(
  plan: CommercialPlan,
  feature: FeatureKey,
  currentUsage: number,
): FeatureAccessResult {
  const upgradeTierTarget = quotaUpgradeTarget(plan, feature);

  switch (feature) {
    case 'pets': {
      const limit = getPetLimit(plan);
      return {
        isAllowed: currentUsage < limit,
        usageLimit: limit,
        currentUsage,
        upgradeTierTarget,
      };
    }
    case 'timeline':
    case 'timelineHistory': {
      const days = getTimelineDayLimit(plan);
      if (days == null) {
        return {
          isAllowed: true,
          usageLimit: 'unlimited',
          currentUsage,
          upgradeTierTarget: 'Plus',
        };
      }
      return {
        isAllowed: false,
        usageLimit: days,
        currentUsage,
        upgradeTierTarget: 'Plus',
      };
    }
    case 'documents': {
      const limit = getDocumentLimit(plan);
      if (limit == null) {
        return {
          isAllowed: true,
          usageLimit: 'unlimited',
          currentUsage,
          upgradeTierTarget: 'Plus',
        };
      }
      return {
        isAllowed: currentUsage < limit,
        usageLimit: limit,
        currentUsage,
        upgradeTierTarget: 'Plus',
      };
    }
    case 'vetBillDecoder': {
      const allowed = canUseDecoder(plan, {
        monthly: currentUsage,
        lifetime: currentUsage,
      });
      const monthly = plan === 'free' ? null : plan === 'plus' ? 5 : plan === 'pro' ? 30 : null;
      const lifetime = plan === 'free' ? 2 : null;
      const usageLimit =
        lifetime != null ? lifetime : monthly == null ? 'unlimited' : monthly;
      return {
        isAllowed: allowed,
        usageLimit,
        currentUsage,
        upgradeTierTarget: plan === 'free' ? 'Plus' : 'Pro',
      };
    }
    case 'vetVisitExport': {
      if (!planMeetsMinimum(plan, 'plus')) {
        return {
          isAllowed: false,
          usageLimit: 0,
          currentUsage,
          upgradeTierTarget: 'Plus',
        };
      }
      const monthlyLimit = getVetVisitExportMonthlyLimit(plan);
      if (monthlyLimit == null) {
        return {
          isAllowed: true,
          usageLimit: 'unlimited',
          currentUsage,
          upgradeTierTarget: 'Pro',
        };
      }
      return {
        isAllowed: canUseVetVisitExport(plan, currentUsage),
        usageLimit: monthlyLimit,
        currentUsage,
        upgradeTierTarget: 'Pro',
      };
    }
    case 'familyMembers': {
      const limit = getFamilySharingLimit(plan);
      if (limit == null) {
        return {
          isAllowed: true,
          usageLimit: 'unlimited',
          currentUsage,
          upgradeTierTarget: 'Plus',
        };
      }
      if (limit === 0) {
        return {
          isAllowed: false,
          usageLimit: 0,
          currentUsage,
          upgradeTierTarget: 'Plus',
        };
      }
      return {
        isAllowed: currentUsage < limit,
        usageLimit: limit,
        currentUsage,
        upgradeTierTarget: 'Pro',
      };
    }
    default:
      return {
        isAllowed: false,
        usageLimit: 0,
        currentUsage,
        upgradeTierTarget: 'Plus',
      };
  }
}

function resolveFeatureAccess(
  plan: CommercialPlan,
  feature: Exclude<
    FeatureKey,
    | 'pets'
    | 'timeline'
    | 'timelineHistory'
    | 'documents'
    | 'vetBillDecoder'
    | 'vetVisitExport'
    | 'familyMembers'
    | 'advancedHealthInsights'
    | 'petCareScore'
    | 'emergencyCareMode'
    | 'vetCollaboration'
  >,
): FeatureAccessResult {
  const matrixKey = feature as keyof typeof FEATURE_UPGRADE_TIER;
  const requiredTier = FEATURE_UPGRADE_TIER[matrixKey];
  const isAllowed = hasMatrixFeatureAccess(plan, feature);

  return {
    isAllowed,
    usageLimit: isAllowed ? 'unlimited' : 0,
    currentUsage: 0,
    upgradeTierTarget: toSelfServeUpgradeTier(requiredTier),
  };
}

/**
 * Central hook for freemium funnel gates.
 * Combines plan tier, quota usage, and boolean feature flags.
 */
export function useFeatureAccess(featureKey: FeatureKey): FeatureAccessResult {
  const { currentPlan, usage } = useSubscription();

  return useMemo(() => {
    switch (featureKey) {
      case 'pets':
        return resolveQuotaAccess(
          currentPlan,
          featureKey,
          usage?.pets.used ?? 0,
        );
      case 'documents':
        return resolveQuotaAccess(
          currentPlan,
          featureKey,
          usage?.documents.used ?? 0,
        );
      case 'familyMembers':
        return resolveQuotaAccess(
          currentPlan,
          featureKey,
          usage?.familyMembers.used ?? 0,
        );
      case 'vetBillDecoder': {
      const monthlyUsed = usage?.scans.used ?? 0;
      const lifetimeUsed = usage?.scansLifetime.used ?? monthlyUsed;
      const used = currentPlan === 'free' ? lifetimeUsed : monthlyUsed;
      return resolveQuotaAccess(currentPlan, featureKey, used);
    }
    case 'vetVisitExport': {
      if (!planMeetsMinimum(currentPlan, 'plus')) {
        return {
          isAllowed: false,
          usageLimit: 0,
          currentUsage: 0,
          upgradeTierTarget: 'Plus',
        };
      }
      const monthlyUsed = usage?.vetVisitExports.used ?? 0;
      const monthlyLimit = getVetVisitExportMonthlyLimit(currentPlan);
      if (monthlyLimit == null) {
        return {
          isAllowed: true,
          usageLimit: 'unlimited',
          currentUsage: monthlyUsed,
          upgradeTierTarget: 'Pro',
        };
      }
      return {
        isAllowed: canUseVetVisitExport(currentPlan, monthlyUsed),
        usageLimit: monthlyLimit,
        currentUsage: monthlyUsed,
        upgradeTierTarget: 'Pro',
      };
    }
      case 'timeline':
      case 'timelineHistory':
        return resolveQuotaAccess(currentPlan, featureKey, 0);
      case 'advancedHealthInsights':
        return resolveFeatureAccess(currentPlan, 'aiHealthInsights');
      case 'petCareScore': {
        const isAllowed = canAccessPlanFeature(currentPlan, 'petCareScore');
        return {
          isAllowed,
          usageLimit: isAllowed ? 'unlimited' : 0,
          currentUsage: 0,
          upgradeTierTarget: 'Plus',
        };
      }
      case 'emergencyCareMode':
        return resolveFeatureAccess(currentPlan, 'petPassport');
      case 'vetCollaboration':
        return resolveFeatureAccess(currentPlan, 'vetCollaborationPortal');
      default:
        return resolveFeatureAccess(currentPlan, featureKey);
    }
  }, [currentPlan, featureKey, usage]);
}

/** Check if current plan meets a self-serve tier without usage context */
export function planMeetsTier(plan: CommercialPlan, tier: 'Plus' | 'Pro'): boolean {
  const required: CommercialPlan = tier === 'Plus' ? 'plus' : 'pro';
  return planMeetsMinimum(plan, required);
}
