import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import styles from '../../DashboardPage.module.css';

export function DashboardFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerLinks}>
          <Link to={ROUTES.LEARN} className={styles.footerLink}>
            Learn
          </Link>
          <Link to={ROUTES.GUIDES} className={styles.footerLink}>
            Guides
          </Link>
          <Link to={ROUTES.BLOG} className={styles.footerLink}>
            Blog
          </Link>
          <Link to={ROUTES.CONTACT} className={styles.footerLink}>
            Help
          </Link>
          <Link to={ROUTES.PRIVACY} className={styles.footerLink}>
            Privacy
          </Link>
          <Link to={ROUTES.PRICING} className={`${styles.footerLink} ${styles.footerLinkAccent}`}>
            Upgrade
          </Link>
        </div>
        <p className={styles.footerNote}>PetClues — a living record of care.</p>
      </div>
    </footer>
  );
}
