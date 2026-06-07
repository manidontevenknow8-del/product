import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { PageContainer, Card, Button, Input, Badge } from '@/components/ui';
import { ROUTES } from '@/routes/paths';
import { isSupabaseConfigured } from '@/services/supabase/config';
import { getSupabaseClient } from '@/services/supabase/client';
import styles from './FoundingMembersPage.module.css';

type Benefit = {
  title: string;
  description: string;
};

const benefits: Benefit[] = [
  { title: 'Early access', description: 'Be first to try new features before the public launch.' },
  { title: 'Premium trial', description: 'Unlock premium features during the founding window.' },
  { title: 'Founding badge', description: 'A permanent badge on your PetClues profile.' },
  { title: 'Lifetime discount', description: 'A thank-you discount for supporting early.' },
  { title: 'Feature voting', description: 'Help decide what PetClues builds next.' },
];

function readReferralSource(locationSearch: string): string | null {
  const params = new URLSearchParams(locationSearch);
  return (
    params.get('ref') ??
    params.get('utm_source') ??
    params.get('source') ??
    null
  );
}

function saveLocal(email: string, referralSource: string | null) {
  const key = 'petclues_founding_member_signups';
  const existingRaw = localStorage.getItem(key);
  const existing = existingRaw ? (JSON.parse(existingRaw) as unknown[]) : [];
  const record = { email, referralSource, createdAt: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify([record, ...existing].slice(0, 50)));
}

async function submitSignup(email: string, referralSource: string | null) {
  if (!isSupabaseConfigured()) {
    saveLocal(email, referralSource);
    return;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('founding-member-signup', {
    body: { email, referralSource },
  });

  if (error) throw new Error(error.message);
  if (data?.success !== true) throw new Error(data?.error ?? 'Signup failed');
}

export function FoundingMembersPage() {
  const location = useLocation();
  const referralSource = useMemo(() => readReferralSource(location.search), [location.search]);

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setStatus('submitting');
    setError(null);
    try {
      await submitSignup(email.trim().toLowerCase(), referralSource);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  return (
    <PublicLayout>
      <PageContainer size="full" className={styles.page}>
        <section className={styles.hero}>
          <Badge variant="accent">Launch program</Badge>
          <h1 className={styles.title}>Founding Pet Parents</h1>
          <p className={styles.subtitle}>
            A limited early-adopter program for people who want calmer pet care — and want to help shape PetClues from day one.
          </p>

          <div className={styles.heroCard}>
            <Card variant="elevated" className={styles.signupCard}>
              <h2 className={styles.cardTitle}>Join the founding list</h2>
              <p className={styles.cardSubtitle}>
                Get early access and founding rewards. No spam. You&apos;ll only hear from us when it matters.
              </p>

              <div className={styles.formRow}>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  type="email"
                  aria-label="Email"
                />
                <Button
                  variant="primary"
                  onClick={() => void handleSubmit()}
                  disabled={status === 'submitting' || !email.includes('@')}
                >
                  {status === 'submitting' ? 'Joining…' : 'Join'}
                </Button>
              </div>

              {referralSource && (
                <p className={styles.referral}>
                  Referral source: <strong>{referralSource}</strong>
                </p>
              )}

              {status === 'success' && (
                <p className={styles.success} role="status">
                  You&apos;re in. Welcome to the founding list.
                </p>
              )}
              {status === 'error' && error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <div className={styles.ctaRow}>
                <Link to={ROUTES.SIGNUP}>
                  <Button variant="secondary">Create free account</Button>
                </Link>
                <Link to={ROUTES.PRICING}>
                  <Button variant="ghost">See Premium</Button>
                </Link>
              </div>
            </Card>

            <div className={styles.benefits}>
              {benefits.map((b) => (
                <Card key={b.title} variant="flat" className={styles.benefitCard}>
                  <h3 className={styles.benefitTitle}>{b.title}</h3>
                  <p className={styles.benefitDescription}>{b.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finePrint}>
          <Card variant="information" className={styles.finePrintCard}>
            <h3 className={styles.finePrintTitle}>How it works</h3>
            <ul className={styles.finePrintList}>
              <li>Join with your email to reserve your founding status.</li>
              <li>When you create your PetClues account with the same email, the Founding Member badge is applied automatically.</li>
              <li>Benefits roll out during the launch window (early access and premium trial first).</li>
            </ul>
          </Card>
        </section>
      </PageContainer>
    </PublicLayout>
  );
}

