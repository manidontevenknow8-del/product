import { Link } from 'react-router-dom';
import { Button, Badge, OptimizedImage } from '@/components/ui';
import { LANDING_IMG } from '@/data/landingImages';
import { ROUTES } from '@/routes/paths';
import styles from './HeroSection.module.css';

export function HeroSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.hero} aria-label="PetClues introduction">
      <OptimizedImage
        className={styles.heroImg}
        src={LANDING_IMG.hero}
        alt=""
        priority
        sizes="100vw"
      />
      <div className={styles.heroScrim} aria-hidden />

      <div className={styles.heroInner}>
        <div className="container">
          <div className={styles.content}>
            <Badge variant="accent" className={styles.eyebrow}>
              The Ultimate Biological Archive
            </Badge>

            <h1 className={styles.title}>
              The standard of care has evolved. Your pet&apos;s living archive, beautifully
              organized.
            </h1>

            <p className={styles.subtitle}>
              The premium infrastructure for pet parents. Store veterinary history, map symptom
              progressions, and secure your companion&apos;s emergency passport in one pristine
              digital vault.
            </p>

            <div className={styles.actions}>
              <Link to={ROUTES.SIGNUP}>
                <Button variant="primary" size="lg">
                  Begin Your Archive
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                className={styles.lightBtn}
                onClick={() => scrollTo('features')}
              >
                Explore the Infrastructure
              </Button>
              <Button variant="ghost" size="lg" className={styles.ghostBtn} onClick={() => scrollTo('how-it-works')}>
                See how it works
              </Button>
            </div>

            <p className={styles.proof}>Concierge-level pet care. Secured.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
