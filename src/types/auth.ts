import type { SubscriptionTier } from '@/services/supabase/database.types';

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  needsOnboarding: boolean;
  foundingMember?: boolean;
  foundingTrialEndsAt?: string | null;
  foundingLifetimeDiscount?: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionPlan: string;
  subscriptionStatus: string;
  createdAt: string;
};

export type AuthSession = {
  user: User;
  accessToken: string;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignInWithGoogleOptions = {
  referralCode?: string;
  fromPetMatch?: boolean;
};

export type OAuthSignInResult =
  | { success: true; session?: AuthSession }
  | { success: false; error: AuthError };

export type AuthError = {
  code: string;
  message: string;
};

export type AuthResult =
  | { success: true; session: AuthSession }
  | { success: true; session: null; pendingVerification: true; email: string }
  | { success: false; error: AuthError };

export type NotificationPreferences = {
  reminders: boolean;
  scanResults: boolean;
  productUpdates: boolean;
};

export type UserProfile = {
  name: string;
  email: string;
  notifications: NotificationPreferences;
};
