/**
 * Auth service interface - implemented by mock and Supabase services.
 */

import type {
  AuthResult,
  AuthSession,
  SignInInput,
  SignUpInput,
} from '@/types/auth';

export interface IAuthService {
  signUp(input: SignUpInput): Promise<AuthResult>;
  signIn(input: SignInInput): Promise<AuthResult>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<{ success: boolean; error?: string }>;
  getSession(): Promise<AuthSession | null>;
  refreshSession(): Promise<AuthSession | null>;
  completeOnboarding(userId: string): Promise<void>;
  verifyEmail(userId: string): Promise<void>;
  resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }>;
  updatePassword(password: string): Promise<{ success: boolean; error?: string }>;
  onAuthStateChange(listener: (session: AuthSession | null) => void): () => void;
}
