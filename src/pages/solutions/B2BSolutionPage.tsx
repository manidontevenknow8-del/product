import { useId, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import {
  calculateAgencyAllocation,
  type B2BSolution,
  type B2BVerticalId,
} from '@/data/b2bSolutions';
import { getSupabaseClient } from '@/services/supabase/client';
import { ROUTES } from '@/routes/paths';
import { B2BSolutionSEO } from '@/seo/b2bSolutionSeo';
import styles from './B2BSolutionPage.module.css';

type B2BSolutionViewProps = {
  solution: B2BSolution;
};

type FormState = {
  companyName: string;
  contactEmail: string;
  monthlyVolume: string;
  vertical: B2BVerticalId;
};

export function B2BSolutionView({ solution }: B2BSolutionViewProps) {
  const navigate = useNavigate();
  const calcId = useId();
  const formId = useId();
  const [volume, setVolume] = useState(12);
  const metrics = useMemo(
    () => calculateAgencyAllocation(volume, solution),
    [volume, solution],
  );

  const [form, setForm] = useState<FormState>({
    companyName: '',
    contactEmail: '',
    monthlyVolume: String(volume),
    vertical: solution.id,
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('submitting');
    setError(null);

    try {
      const response = await fetch('/api/b2b-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          contactEmail: form.contactEmail.trim().toLowerCase(),
          monthlyVolume: Number(form.monthlyVolume) || volume,
          vertical: form.vertical,
          sourcePath: solution.path,
        }),
      });

      const payload = (await response.json()) as {
        access_token?: string;
        refresh_token?: string;
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to claim sandbox allocation.');
      }

      if (payload.access_token && payload.refresh_token) {
        const supabase = getSupabaseClient();
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: payload.access_token,
          refresh_token: payload.refresh_token,
        });
        if (sessionError) throw new Error(sessionError.message);
        sessionStorage.setItem(
          'petclues_b2b_lead',
          JSON.stringify({
            companyName: form.companyName.trim(),
            vertical: form.vertical,
            at: Date.now(),
          }),
        );
        navigate(payload.redirectTo || ROUTES.TIMELINE, { replace: true });
        return;
      }

      // Lead stored but sandbox unavailable - still acknowledge and send to signup
      navigate(`${ROUTES.SIGNUP}?intent=b2b-${solution.id}`);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <>
      <B2BSolutionSEO solution={solution} />
      <Header variant="landing" />
      <div className={styles.page}>
        <div className={styles.inner}>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>{solution.eyebrow}</p>
            <h1 className={styles.title}>{solution.heroHeadline}</h1>
            <p className={styles.lead}>{solution.heroLead}</p>

            <div className={styles.calculator} aria-labelledby={`${calcId}-heading`}>
              <div className={styles.calcHeader}>
                <h2 id={`${calcId}-heading`} className={styles.calcTitle}>
                  Agency Allocation Calculator
                </h2>
                <p className={styles.calcHint}>
                  Slide your monthly pet volume to estimate operational recovery.
                </p>
              </div>
              <label className={styles.sliderLabel} htmlFor={`${calcId}-slider`}>
                {solution.calculatorLabel}: <strong>{metrics.pets}</strong>
              </label>
              <input
                id={`${calcId}-slider`}
                className={styles.slider}
                type="range"
                min={1}
                max={80}
                step={1}
                value={volume}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setVolume(next);
                  setForm((prev) => ({ ...prev, monthlyVolume: String(next) }));
                }}
              />
              <div className={styles.metrics}>
                <div>
                  <p className={styles.metricValue}>{metrics.hoursSaved}h</p>
                  <p className={styles.metricLabel}>staff hours recovered / month</p>
                </div>
                <div>
                  <p className={styles.metricValue}>{metrics.errorReduction}%</p>
                  <p className={styles.metricLabel}>fewer document errors</p>
                </div>
                <div>
                  <p className={styles.metricValue}>{metrics.staffDays}</p>
                  <p className={styles.metricLabel}>full staff-days returned</p>
                </div>
              </div>
            </div>
          </header>

          <section className={styles.section} aria-labelledby="pain-heading">
            <p className={styles.kicker}>Operational pain</p>
            <h2 id="pain-heading" className={styles.sectionTitle}>
              Why high-ticket partners churn their current stack
            </h2>
            <ul className={styles.painList}>
              {solution.painPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p className={styles.solutionCopy}>{solution.coreSolution}</p>
          </section>

          <section className={styles.section} aria-labelledby="workflow-heading">
            <p className={styles.kicker}>Workflow</p>
            <h2 id="workflow-heading" className={styles.sectionTitle}>
              Old way vs PetClues Concierge way
            </h2>
            <div className={styles.workflow}>
              {solution.workflow.map((row) => (
                <article key={row.step} className={styles.workflowCard}>
                  <p className={styles.workflowStep}>{row.step}</p>
                  <div className={styles.workflowCols}>
                    <div>
                      <p className={styles.wayLabel}>Old way</p>
                      <p className={styles.wayBody}>{row.oldWay}</p>
                    </div>
                    <div>
                      <p className={styles.wayLabelConcierge}>PetClues Concierge</p>
                      <p className={styles.wayBody}>{row.conciergeWay}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="pricing-heading">
            <p className={styles.kicker}>Allocation pricing</p>
            <h2 id="pricing-heading" className={styles.sectionTitle}>
              Two paths to a branded vault
            </h2>
            <div className={styles.pricingGrid}>
              {solution.pricing.map((tier) => (
                <article key={tier.id} className={styles.priceCard} data-tier={tier.id}>
                  <p className={styles.priceName}>{tier.name}</p>
                  <p className={styles.priceAmount}>
                    {tier.priceLabel}
                    <span>
                      {tier.billing === 'monthly' ? '/mo flat' : ' one-time / pet'}
                    </span>
                  </p>
                  <p className={styles.priceDesc}>{tier.description}</p>
                  <ul className={styles.priceList}>
                    {tier.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.claim} aria-labelledby={`${formId}-heading`}>
            <p className={styles.kicker}>Conversion</p>
            <h2 id={`${formId}-heading`} className={styles.sectionTitle}>
              {solution.formCta}
            </h2>
            <p className={styles.claimLead}>{solution.sandboxNote}</p>
            <form className={styles.form} onSubmit={(e) => void onSubmit(e)}>
              <label className={styles.field}>
                <span>Company name</span>
                <input
                  required
                  name="companyName"
                  autoComplete="organization"
                  value={form.companyName}
                  onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span>Contact email</span>
                <input
                  required
                  type="email"
                  name="contactEmail"
                  autoComplete="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span>Estimated monthly pet volume</span>
                <input
                  required
                  type="number"
                  min={1}
                  max={500}
                  name="monthlyVolume"
                  value={form.monthlyVolume}
                  onChange={(e) => setForm((p) => ({ ...p, monthlyVolume: e.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span>Vertical</span>
                <select
                  name="vertical"
                  value={form.vertical}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      vertical: e.target.value as B2BVerticalId,
                    }))
                  }
                >
                  <option value="agency">IPATA Relocation Agency</option>
                  <option value="breeder">Luxury / High-End Breeder</option>
                </select>
              </label>
              <button
                type="submit"
                className={styles.submit}
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Opening sandbox…' : solution.formCta}
              </button>
              {error && <p className={styles.error}>{error}</p>}
            </form>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
