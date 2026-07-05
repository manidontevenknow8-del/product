import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHousehold } from '@/household/HouseholdProvider';
import { HOUSEHOLD_ROLE_LABELS } from '@/services/household';
import { ROUTES } from '@/routes/paths';
import { getUserFacingError } from '@/utils/userFacingErrors';
import styles from './PendingHouseholdInvitesBanner.module.css';

export function PendingHouseholdInvitesBanner() {
  const { incomingInvites, acceptInvite, declineInvite } = useHousehold();
  const [busyToken, setBusyToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (incomingInvites.length === 0) return null;

  const invite = incomingInvites[0]!;

  const run = async (token: string, action: 'accept' | 'decline') => {
    setBusyToken(token);
    setError(null);
    try {
      if (action === 'accept') await acceptInvite(token);
      else await declineInvite(token);
    } catch (err) {
      setError(getUserFacingError(err, 'generic', 'Could not update the invite.'));
    } finally {
      setBusyToken(null);
    }
  };

  return (
    <section className={styles.banner} aria-live="polite">
      <h2 className={styles.title}>Household invite pending</h2>
      <p className={styles.lead}>
        {invite.inviterName} invited you to join <strong>{invite.householdName}</strong> as a{' '}
        {HOUSEHOLD_ROLE_LABELS[invite.role].toLowerCase()}.
        {incomingInvites.length > 1 && ` You have ${incomingInvites.length} pending invites.`}
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={busyToken === invite.token}
          onClick={() => void run(invite.token, 'accept')}
        >
          {busyToken === invite.token ? 'Joining…' : 'Accept invite'}
        </button>
        <button
          type="button"
          className={styles.secondaryBtn}
          disabled={busyToken === invite.token}
          onClick={() => void run(invite.token, 'decline')}
        >
          Decline
        </button>
        <Link to={`${ROUTES.FAMILY_ACCESS}/invite/${invite.token}`} className={styles.secondaryBtn}>
          Review details
        </Link>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
