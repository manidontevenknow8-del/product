import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PetCluesLogo } from '@/components/brand';
import { ROUTES } from '@/routes/paths';
import { PAGE_IMG } from '@/data/pageImages';
import styles from './AuthLayout.module.css';

type AuthLayoutProps = {
  children: ReactNode;
  footer?: ReactNode;
  visualImage?: string;
  visualTitle?: string;
  visualSubtitle?: string;
};

export function AuthLayout({
  children,
  footer,
  visualImage = PAGE_IMG.auth.login,
  visualTitle = 'Calm, organized pet care',
  visualSubtitle = 'Health records, reminders, and emergency passports - beautifully in one place.',
}: AuthLayoutProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.visual} aria-hidden>
        <img src={visualImage} alt="" className={styles.visualImg} />
        <div className={styles.visualScrim} />
        <div className={styles.visualCopy}>
          <p className={styles.visualEyebrow}>PetClues</p>
          <h2 className={styles.visualTitle}>{visualTitle}</h2>
          <p className={styles.visualSubtitle}>{visualSubtitle}</p>
        </div>
      </aside>

      <div className={styles.formSide}>
        <header className={styles.header}>
          <Link to={ROUTES.LANDING} className={styles.logo} aria-label="PetClues home">
            <PetCluesLogo size="xl" />
          </Link>
        </header>
        <main className={styles.main}>
          <div className={styles.card}>{children}</div>
        </main>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>
  );
}
