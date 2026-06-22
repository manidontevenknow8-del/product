import { Link } from 'react-router-dom';
import type { BlogInternalLinkPlan } from '@/data/internalLinking';
import styles from './BlogInternalLinks.module.css';

type BlogInternalLinksProps = {
  plan: BlogInternalLinkPlan;
};

export function BlogInternalLinks({ plan }: BlogInternalLinksProps) {
  return (
    <section className={styles.section} aria-labelledby="internal-links-heading">
      <h2 id="internal-links-heading" className={styles.title}>
        Keep exploring
      </h2>

      <div className={styles.grid}>
        <div className={styles.group}>
          <h3 className={styles.groupTitle}>Related articles</h3>
          <ul className={styles.list}>
            {plan.blogs.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupTitle}>Knowledge base</h3>
          <ul className={styles.list}>
            <li>
              <Link to={plan.learn.href} className={styles.link}>
                {plan.learn.label}
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupTitle}>FAQ</h3>
          <ul className={styles.list}>
            <li>
              <Link to={plan.faq.href} className={styles.link}>
                {plan.faq.label}
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupTitle}>Guides &amp; tools</h3>
          <ul className={styles.list}>
            <li>
              <Link to={plan.hub.href} className={styles.link}>
                {plan.hub.label}
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupTitle}>Product</h3>
          <ul className={styles.list}>
            <li>
              <Link to={plan.commercial.href} className={styles.link}>
                {plan.commercial.label}
              </Link>
            </li>
            <li>
              <Link to={plan.pricing.href} className={styles.link}>
                {plan.pricing.label}
              </Link>
            </li>
            <li>
              <Link to={plan.homepage.href} className={styles.link}>
                {plan.homepage.label}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
