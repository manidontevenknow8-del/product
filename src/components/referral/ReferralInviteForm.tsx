import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import { useGrowth } from '@/growth';
import styles from './ReferralInviteForm.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

export function ReferralInviteForm() {
  const { sendInvite } = useGrowth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await sendInvite(email);
      setMessage('Invite recorded - we’ll attribute signup when they join with your link.');
      setEmail('');
    } catch (err) {
      setError(getUserFacingError(err, 'generic', 'Unable to send invite'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
      <h3 className={styles.title}>Invite by email</h3>
      <p className={styles.text}>
        Track invitations before friends sign up. They still need your referral link to join.
      </p>
      <div className={styles.row}>
        <Input
          label="Friend's email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@example.com"
          required
        />
        <Button variant="secondary" size="md" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Record invite'}
        </Button>
      </div>
      {message && (
        <p className={styles.success} role="status">
          {message}
        </p>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
