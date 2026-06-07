import { Link } from 'react-router-dom';
import { Button, Badge } from '@/components/ui';
import { LANDING_IMG } from '@/data/landingImages';
import { ROUTES } from '@/routes/paths';
import styles from './HeroSection.module.css';

export function HeroSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.hero} aria-label="PetClues introduction">
      <img
        className={styles.heroImg}
        src={LANDING_IMG.hero}
        alt=""
        aria-hidden
        fetchPriority="high"
      />
      <div className={styles.heroScrim} aria-hidden />

      <div className={styles.heroInner}>
        <div className="container">
          <div className={styles.content}>
            <Badge variant="accent" className={styles.eyebrow}>
              Free pet health records app
            </Badge>

            <h1 className={styles.title}>
              Pet health records, vaccination reminders &amp; emergency info — organized
            </h1>

            <p className={styles.subtitle}>
              The pet health app for dog and cat parents — store vet bills, set medication
              reminders, log daily check-ins, and share an emergency pet passport in one calm
              place.
            </p>

            <div className={styles.actions}>
              <Link to={ROUTES.SIGNUP}>
                <Button variant="primary" size="lg">
                  Start free
                </Button>
              </Link>
              <Link to={ROUTES.PET_MATCH}>
                <Button variant="secondary" size="lg">
                  Pet match quiz
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className={styles.ghostBtn} onClick={() => scrollTo('how-it-works')}>
                See how it works
              </Button>
            </div>

            <p className={styles.proof}>
              Pet vaccination reminders · Medical records vault · Daily check-ins · Free for one pet
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
