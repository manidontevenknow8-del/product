import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { LANDING_IMG } from '@/data/landingImages';
import { ROUTES } from '@/routes/paths';
import styles from './CTASection.module.css';

export function CTASection() {
  return (
    <section
      id="get-started"
      className={styles.section}
      aria-labelledby="landing-cta-title"
    >
      <div className={styles.banner}>
        <img
          className={styles.bannerImg}
          src={LANDING_IMG.cta}
          alt=""
          aria-hidden
          loading="lazy"
        />
        <div className={styles.bannerScrim} aria-hidden />
        <div className={styles.inner}>
          <div className={styles.card}>
            <span className={styles.eyebrow}>Get started</span>
            <h2 id="landing-cta-title" className={styles.title}>
              Ready to care with clarity?
            </h2>
            <p className={styles.subtitle}>
              Create a free account in minutes. Organize pet health records, vaccination reminders,
              daily check-ins, and your emergency pet passport - no credit card required.
            </p>

            <div className={styles.actions}>
              <Link to={ROUTES.SIGNUP}>
                <Button variant="primary" size="md">
                  Create free account
                </Button>
              </Link>
              <Link to={ROUTES.PET_MATCH}>
                <Button variant="secondary" size="md" className={styles.quizBtn}>
                  Pet match quiz
                </Button>
              </Link>
              <Link to={ROUTES.PRICING}>
                <Button variant="ghost" size="md" className={styles.ghostBtn}>
                  Compare plans
                </Button>
              </Link>
            </div>

            <p className={styles.disclaimer}>
              Free forever for one pet. Upgrade anytime for unlimited pets and premium features.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
