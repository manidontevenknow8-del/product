import { Link } from 'react-router-dom';
import { ALL_COMMERCIAL_LINKS } from '@/data/internalLinking/commercialMappings';
import { PRIMARY_HUB_LINKS } from '@/data/internalLinking/hubMappings';
import styles from './LandingExploreSection.module.css';

export function LandingExploreSection() {
  return (
    <section className={styles.section} aria-labelledby="explore-resources-title">
      <div className="container">
        <div className={styles.header}>
          <span className={`label ${styles.eyebrow}`}>Explore</span>
          <h2 id="explore-resources-title" className={styles.title}>
            Guides, tools, and organized pet care
          </h2>
          <p className={styles.subtitle}>
            Deep dives for every stage of pet ownership — from vaccination proof to emergency
            handoffs and long-term medical history.
          </p>
        </div>

        <div className={styles.columns}>
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>PetClues solutions</h3>
            <ul className={styles.linkList}>
              {ALL_COMMERCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Resource hubs</h3>
            <ul className={styles.linkList}>
              {PRIMARY_HUB_LINKS.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
