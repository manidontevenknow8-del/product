import { Link } from 'react-router-dom';
import { ALL_COMMERCIAL_LINKS } from '@/data/internalLinking/commercialMappings';
import { PRIMARY_HUB_LINKS } from '@/data/internalLinking/hubMappings';
import { ROUTES } from '@/routes/paths';
import styles from './HubIndexResources.module.css';

type HubIndexResourcesProps = {
  /** Show commercial solution links (money pages). */
  showCommercial?: boolean;
  /** Show cross-links to other hub indexes. */
  showHubNav?: boolean;
  /** Optional intro copy override. */
  intro?: string;
};

export function HubIndexResources({
  showCommercial = true,
  showHubNav = true,
  intro = 'Explore PetClues resources, organized guides, comparisons, and product pages for pet health records, vaccines, and everyday care.',
}: HubIndexResourcesProps) {
  return (
    <aside className={styles.aside} aria-label="PetClues resources">
      {intro && <p className={styles.intro}>{intro}</p>}

      {showHubNav && (
        <nav className={styles.block} aria-label="Resource hubs">
          <h2 className={styles.blockTitle}>Resource hubs</h2>
          <ul className={styles.list}>
            {PRIMARY_HUB_LINKS.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {showCommercial && (
        <nav className={styles.block} aria-label="PetClues solutions">
          <h2 className={styles.blockTitle}>PetClues solutions</h2>
          <ul className={styles.list}>
            {ALL_COMMERCIAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className={styles.ctaRow}>
        <Link to={ROUTES.PRICING} className={styles.ctaLink}>
          View pricing
        </Link>
        <Link to={ROUTES.SIGNUP} className={styles.ctaLink}>
          Start free
        </Link>
      </div>
    </aside>
  );
}
