import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingState } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import { useHousehold } from '@/household/HouseholdProvider';
import { getHouseholdService, HOUSEHOLD_ROLE_LABELS } from '@/services/household';
import type { HouseholdInvitePreview } from '@/services/household';
import { ROUTES } from '@/routes/paths';
import { getUserFacingError } from '@/utils/userFacingErrors';
import styles from './HouseholdInvitePage.module.css';

export function HouseholdInvitePage() {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { acceptInvite, declineInvite } = useHousehold();
  const [preview, setPreview] = useState<HouseholdInvitePreview | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState('missing');
      return;
    }

    let cancelled = false;
    setState('loading');

    void getHouseholdService()
      .getInvitePreview(token)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setState('missing');
          setPreview(null);
          return;
        }
        setPreview(result);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('missing');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleAccept = async () => {
    setBusy(true);
    setError(null);
    try {
      await acceptInvite(token);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(getUserFacingError(err, 'generic', 'Could not accept invite.'));
    } finally {
      setBusy(false);
    }
  };

  const handleDecline = async () => {
    setBusy(true);
    setError(null);
    try {
      await declineInvite(token);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(getUserFacingError(err, 'generic', 'Could not decline invite.'));
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || state === 'loading') {
    return (
      <AppLayout>
        <LoadingState message="Loading invite" />
      </AppLayout>
    );
  }

  if (state === 'missing' || !preview) {
    return (
      <AppLayout>
        <div className={styles.wrap}>
          <h1 className={styles.title}>Invite unavailable</h1>
          <p className={styles.lead}>This household invite is expired, revoked, or already used.</p>
          <Link to={ROUTES.DASHBOARD} className={styles.link}>
            Back to Home
          </Link>
        </div>
      </AppLayout>
    );
  }

  const emailMatches =
    isAuthenticated &&
    user?.email &&
    preview.invitedEmail.toLowerCase() === user.email.toLowerCase();

  return (
    <AppLayout>
      <div className={styles.wrap}>
        <p className={styles.kicker}>Household invite</p>
        <h1 className={styles.title}>Join {preview.householdName}</h1>
        <p className={styles.lead}>
          {preview.inviterName} invited you as a{' '}
          <strong>{HOUSEHOLD_ROLE_LABELS[preview.role].toLowerCase()}</strong> on their PetClues
          household.
        </p>
        <p className={styles.meta}>
          Sent to {preview.invitedEmail} · expires{' '}
          {new Date(preview.expiresAt).toLocaleDateString()}
        </p>

        {!isAuthenticated ? (
          <p className={styles.note}>
            <Link to={ROUTES.LOGIN}>Sign in</Link> or <Link to={ROUTES.SIGNUP}>create an account</Link>{' '}
            with {preview.invitedEmail} to respond to this invite.
          </p>
        ) : !emailMatches ? (
          <p className={styles.note}>
            You are signed in as {user?.email}. This invite was sent to {preview.invitedEmail}.
          </p>
        ) : (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={busy}
              onClick={() => void handleAccept()}
            >
              {busy ? 'Joining…' : 'Accept invite'}
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              disabled={busy}
              onClick={() => void handleDecline()}
            >
              Decline
            </button>
          </div>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </AppLayout>
  );
}
