import { ROUTES } from '@/routes/paths';
import type { User } from '@/types/auth';

/** Where to send the user after auth based on profile state. */
export function getPostAuthPath(user: User, fallback: string = ROUTES.DASHBOARD): string {
  if (!user.emailVerified) return ROUTES.VERIFY_EMAIL;
  if (user.needsOnboarding) return ROUTES.ONBOARDING;
  return fallback;
}
