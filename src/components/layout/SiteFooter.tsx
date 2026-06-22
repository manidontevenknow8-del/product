import { Link } from 'react-router-dom';
import { PetCluesLogo } from '@/components/brand';
import { ROUTES } from '@/routes/paths';
import { HEALTH_DISCLAIMER, LEGAL_CONTACT } from '@/data/legalConfig';
import {
  FOOTER_COMPANY_LINKS,
  FOOTER_LEGAL_LINKS,
  FOOTER_PRODUCT_LINKS,
  FOOTER_RESOURCE_LINKS,
  FOOTER_SOLUTION_LINKS,
} from '@/data/footerLinks';
import { SOCIAL_PROFILES } from '@/data/socialProfiles';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.accentBar} aria-hidden />
      <div className={`container ${styles.inner}`}>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Link to={ROUTES.LANDING} className={styles.brand} aria-label="PetClues home">
              <PetCluesLogo size="md" className={styles.footerLogo} />
            </Link>
            <p className={styles.tagline}>
              Calm, organized pet care for dog and cat parents.
            </p>
            <div className={styles.brandMeta}>
              <a href={`mailto:${LEGAL_CONTACT.support}`} className={styles.supportLink}>
                {LEGAL_CONTACT.support}
              </a>
              <span className={styles.metaDivider} aria-hidden>·</span>
              <a
                href={SOCIAL_PROFILES.instagram}
                className={styles.socialLink}
                rel="me noopener noreferrer"
                target="_blank"
              >
                Instagram
              </a>
              <span className={styles.metaDivider} aria-hidden>·</span>
              <a
                href={SOCIAL_PROFILES.facebook}
                className={styles.socialLink}
                rel="me noopener noreferrer"
                target="_blank"
              >
                Facebook
              </a>
            </div>
          </div>

          <nav className={styles.groups} aria-label="Footer">
            <div className={styles.group}>
              <span className={styles.groupTitle}>Product</span>
              {FOOTER_PRODUCT_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </div>
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
              <span className={styles.groupTitle}>Solutions</span>
              {FOOTER_SOLUTION_LINKS.map((link) => (
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

        <div className={styles.bottom}>
          <div className={styles.bottomLeft}>
            <p className={styles.disclaimer}>{HEALTH_DISCLAIMER}</p>
            <span className={styles.copyright}>
              © {new Date().getFullYear()} PetClues
            </span>
          </div>
          <Link to={ROUTES.SIGNUP} className={styles.ctaLink}>
            Get started free
          </Link>
        </div>
      </div>
    </footer>
  );
}
