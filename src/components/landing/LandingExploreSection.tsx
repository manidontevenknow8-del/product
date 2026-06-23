import { Link } from 'react-router-dom';
import { ALL_COMMERCIAL_LINKS } from '@/data/internalLinking/commercialMappings';
import { PRIMARY_HUB_LINKS } from '@/data/internalLinking/hubMappings';
import { ROUTES } from '@/routes/paths';
import styles from './LandingExploreSection.module.css';

export function LandingExploreSection() {
  return (
    <section className={styles.section} aria-labelledby="explore-resources-title">
      <div className="container">
        <header className={styles.header}>
          <span className={`label ${styles.eyebrow}`}>Explore</span>
          <h2 id="explore-resources-title" className={styles.title}>
            Guides, tools, and organized pet care
          </h2>
          <p className={styles.subtitle}>
            Deep dives for every stage of pet ownership: vaccination proof, emergency handoffs,
            and long-term medical history.
          </p>
        </header>

        <div className={styles.grid}>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>PetClues solutions</h3>
            <p className={styles.cardLead}>
              Product pages for records, passports, vaccines, and everyday tracking.
            </p>
            <ul className={styles.linkList}>
              {ALL_COMMERCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={styles.link}>
                    <span>{link.label}</span>
                    <span className={styles.linkArrow} aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Resource hubs</h3>
            <p className={styles.cardLead}>
              Editorial guides, comparisons, and answers across the PetClues library.
            </p>
            <ul className={styles.linkList}>
              {PRIMARY_HUB_LINKS.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={styles.link}>
                    <span>{link.label}</span>
                    <span className={styles.linkArrow} aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className={styles.actionsBar}>
          <Link to={ROUTES.PRICING} className={styles.pricingLink}>
            View pricing
            <span className={styles.pricingArrow} aria-hidden>
              →
            </span>
          </Link>
          <Link to={ROUTES.SIGNUP} className={styles.startLink}>
            Start free
          </Link>
        </div>
      </div>
    </section>
  );
}
