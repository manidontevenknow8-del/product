import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button, Input } from '@/components/ui';
import { PAGE_IMG } from '@/data/pageImages';
import { FOUNDING_DISCOUNT_PERCENT } from '@/config/razorpayConfig';
import {
  FOUNDING_BENEFITS,
  FOUNDING_DISCOUNTED_PRICE_DISPLAY,
  FOUNDING_TRIAL_DAYS,
} from '@/data/foundingMemberBenefits';
import { ROUTES } from '@/routes/paths';
import { isSupabaseConfigured } from '@/services/supabase/config';
import { getSupabaseClient } from '@/services/supabase/client';
import { eventTracker } from '@/analytics/EventTracker';
import styles from './FoundingMembersPage.module.css';

function readReferralSource(locationSearch: string): string | null {
  const params = new URLSearchParams(locationSearch);
  return params.get('ref') ?? params.get('utm_source') ?? params.get('source') ?? null;
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

const STEPS = [
  {
    step: '01',
    title: 'Join the list',
    body: 'Reserve your spot with the email you plan to use for PetClues.',
  },
  {
    step: '02',
    title: 'Create your account',
    body: 'Sign up with the same email - your founding perks unlock automatically.',
  },
  {
    step: '03',
    title: 'Start with Pro',
    body: `Enjoy a ${FOUNDING_TRIAL_DAYS}-day Pro trial, your badge, voting access, and ${FOUNDING_DISCOUNTED_PRICE_DISPLAY}/mo for life.`,
  },
] as const;

export function FoundingMembersPage() {
  const location = useLocation();
  const referralSource = useMemo(() => readReferralSource(location.search), [location.search]);

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [joinedEmail, setJoinedEmail] = useState('');

  const handleSubmit = async () => {
    const normalized = email.trim().toLowerCase();
    setStatus('submitting');
    setError(null);
    try {
      await submitSignup(normalized, referralSource);
      setJoinedEmail(normalized);
      setStatus('success');
      eventTracker.track('waitlist_joined', referralSource ? { referral_source: referralSource } : undefined);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  return (
    <PublicLayout>
      <div className={styles.page}>
        {/* Hero */}
        <section className={styles.hero} aria-labelledby="founding-hero-title">
          <img className={styles.heroImg} src={PAGE_IMG.app.about} alt="" aria-hidden />
          <div className={styles.heroScrim} aria-hidden />
          <div className={`container ${styles.heroInner}`}>
            <p className={styles.heroEyebrow}>Limited founding spots</p>
            <h1 id="founding-hero-title" className={styles.heroTitle}>
              Founding Pet Parents
            </h1>
            <p className={styles.heroSubtitle}>
              Join a small group of early believers who help shape PetClues - and unlock perks that
              stay with you for the life of your account.
            </p>
            <div className={styles.heroStats}>
              <span className={styles.stat}>30-day Pro trial</span>
              <span className={styles.stat}>Permanent badge</span>
              <span className={styles.stat}>{FOUNDING_DISCOUNT_PERCENT}% off forever</span>
            </div>
          </div>
        </section>

        {/* Signup or success */}
        <section className={styles.signupSection} aria-label="Join the founding list">
          <div className={`container ${styles.signupInner}`}>
            {status === 'success' ? (
              <div className={styles.successPanel} role="status">
                <div className={styles.successGlow} aria-hidden />
                <div className={styles.successIcon} aria-hidden>
                  ✓
                </div>
                <p className={styles.successEyebrow}>You&apos;re in</p>
                <h2 className={styles.successTitle}>Welcome to the founding list</h2>
                <p className={styles.successLead}>
                  We saved <strong>{joinedEmail}</strong> as a founding spot. Check your inbox for
                  confirmation, then create your account with the same email to unlock everything
                  below.
                </p>

                <ul className={styles.successPerks}>
                  {FOUNDING_BENEFITS.map((benefit) => (
                    <li key={benefit.id} className={styles.successPerk}>
                      <span className={styles.successPerkCheck} aria-hidden>
                        ✓
                      </span>
                      <div>
                        <strong>{benefit.title}</strong>
                        <span>{benefit.detail}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className={styles.successActions}>
                  <Link to={ROUTES.SIGNUP}>
                    <Button variant="primary" size="lg">
                      Create your account
                    </Button>
                  </Link>
                  <Link to={ROUTES.ABOUT}>
                    <Button variant="secondary" size="lg">
                      Learn about PetClues
                    </Button>
                  </Link>
                </div>

                <p className={styles.successFine}>
                  Your Founding Member badge, Pro trial, lifetime discount, and feature voting all
                  activate when you sign up with <strong>{joinedEmail}</strong>.
                </p>
              </div>
            ) : (
              <div className={styles.signupGrid}>
                <div className={styles.signupCard}>
                  <h2 className={styles.signupTitle}>Join the founding list</h2>
                  <p className={styles.signupLead}>
                    One email reserves your perks. No spam - we only reach out when it matters.
                  </p>

                  <div className={styles.formRow}>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      type="email"
                      aria-label="Email"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && email.includes('@')) void handleSubmit();
                      }}
                    />
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => void handleSubmit()}
                      disabled={status === 'submitting' || !email.includes('@')}
                    >
                      {status === 'submitting' ? 'Joining…' : 'Join'}
                    </Button>
                  </div>

                  {referralSource && (
                    <p className={styles.referral}>
                      Referred via <strong>{referralSource}</strong>
                    </p>
                  )}

                  {status === 'error' && error && (
                    <p className={styles.error} role="alert">
                      {error}
                    </p>
                  )}

                  <p className={styles.signupFine}>
                    Already on the list?{' '}
                    <Link to={ROUTES.SIGNUP} className={styles.inlineLink}>
                      Create your account
                    </Link>
                  </p>
                </div>

                <div className={styles.signupVisual}>
                  <img
                    src={PAGE_IMG.app.dashboardWelcome}
                    alt="Pet parent welcoming their dog into a calm care routine"
                    className={styles.signupVisualImg}
                  />
                  <div className={styles.signupVisualCopy}>
                    <p className={styles.signupVisualQuote}>
                      &ldquo;The calmest pet care app I&apos;ve tried - and founding members get to
                      shape what comes next.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Benefits */}
        <section className={styles.benefitsSection} aria-labelledby="founding-benefits-heading">
          <div className={`container ${styles.sectionInner}`}>
            <p className={styles.sectionEyebrow}>What you unlock</p>
            <h2 id="founding-benefits-heading" className={styles.sectionTitle}>
              Perks that stay with you
            </h2>
            <p className={styles.sectionLead}>
              Every benefit below is wired into your PetClues account - not marketing copy. Sign up
              with the same email and they activate automatically.
            </p>

            <div className={styles.benefitsGrid}>
              {FOUNDING_BENEFITS.map((benefit, index) => (
                <article
                  key={benefit.id}
                  className={`${styles.benefitCard} ${index % 2 === 1 ? styles.benefitCardAlt : ''}`}
                >
                  <div className={styles.benefitMedia}>
                    <img src={benefit.image} alt={benefit.imageAlt} className={styles.benefitImg} />
                  </div>
                  <div className={styles.benefitCopy}>
                    <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                    <p className={styles.benefitDescription}>{benefit.description}</p>
                    <p className={styles.benefitDetail}>{benefit.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className={styles.stepsSection} aria-labelledby="founding-steps-heading">
          <div className={`container ${styles.sectionInner}`}>
            <p className={styles.sectionEyebrow}>How it works</p>
            <h2 id="founding-steps-heading" className={styles.sectionTitle}>
              Three steps to founding status
            </h2>

            <div className={styles.stepsGrid}>
              {STEPS.map((item) => (
                <article key={item.step} className={styles.stepCard}>
                  <span className={styles.stepNum}>{item.step}</span>
                  <h3 className={styles.stepTitle}>{item.title}</h3>
                  <p className={styles.stepBody}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className={styles.ctaBand} aria-label="Get started">
          <div className={`container ${styles.ctaInner}`}>
            <img
              className={styles.ctaImg}
              src={PAGE_IMG.app.cta}
              alt=""
              aria-hidden
            />
            <div className={styles.ctaScrim} aria-hidden />
            <div className={styles.ctaCopy}>
              <h2 className={styles.ctaTitle}>Ready to claim your spot?</h2>
              <p className={styles.ctaLead}>
                Join the founding list or create your free account - your perks follow the email you
                use.
              </p>
              <div className={styles.ctaActions}>
                {status !== 'success' ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      document.querySelector(`.${styles.signupSection}`)?.scrollIntoView({
                        behavior: 'smooth',
                      });
                    }}
                  >
                    Join the list
                  </Button>
                ) : (
                  <Link to={ROUTES.SIGNUP}>
                    <Button variant="primary" size="lg">
                      Create your account
                    </Button>
                  </Link>
                )}
                <Link to={ROUTES.PRICING}>
                  <Button variant="secondary" size="lg" className={styles.ctaGhost}>
                    Compare plans
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
