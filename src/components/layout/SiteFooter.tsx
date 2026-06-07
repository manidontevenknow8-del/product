import { Link } from 'react-router-dom';
import { PetCluesLogo } from '@/components/brand';
import { ROUTES } from '@/routes/paths';
import { BUILD_INFO } from '@/data/buildInfo';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import {
  FOOTER_COMPANY_LINKS,
  FOOTER_LEGAL_LINKS,
  FOOTER_RESOURCE_LINKS,
} from '@/data/footerLinks';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.top}>
          <Link to={ROUTES.LANDING} className={styles.brand} aria-label="PetClues home">
            <PetCluesLogo size="lg" />
          </Link>

          <nav className={styles.groups} aria-label="Footer">
            <div className={styles.group}>
              <span className={styles.groupTitle}>Legal</span>
              {FOOTER_LEGAL_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className={styles.group}>
              <span className={styles.groupTitle}>Company</span>
              {FOOTER_COMPANY_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className={styles.group}>
              <span className={styles.groupTitle}>Resources</span>
              {FOOTER_RESOURCE_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <p className={styles.disclaimer}>{HEALTH_DISCLAIMER}</p>

        <div className={styles.bottom}>
          <span className={styles.copyright}>
            © {new Date().getFullYear()} PetClues · v{BUILD_INFO.version}
          </span>
        </div>
      </div>
    </footer>
  );
}
