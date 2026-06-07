import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import styles from './WaitlistForm.module.css';

type WaitlistFormProps = {
  onSubmit: (input: { name: string; email: string }) => Promise<void>;
  pendingReferral?: string | null;
};

export function WaitlistForm({ onSubmit, pendingReferral }: WaitlistFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), email: email.trim() });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {pendingReferral && (
        <p className={styles.referralNote}>
          You were invited by a friend. Sign up with their link and you&apos;ll both{' '}
          <strong>unlock referral rewards</strong>.
        </p>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <Input
        label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="How should we address you?"
        required
        autoComplete="name"
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        autoComplete="email"
      />

      <Button variant="primary" size="lg" fullWidth type="submit" disabled={loading}>
        {loading ? 'Setting up…' : 'Get my referral link'}
      </Button>

      <p className={styles.disclaimer}>
        No spam. We&apos;ll send your personal referral link and reward updates only.
      </p>
    </form>
  );
}
