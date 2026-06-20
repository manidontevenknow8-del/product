import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import styles from './FeaturePageLinks.module.css';

const DEFAULT_LINKS = [
  { to: ROUTES.PRICING, label: 'Pricing' },
  { to: ROUTES.FAQ, label: 'FAQ' },
  { to: ROUTES.ABOUT, label: 'About' },
  { to: ROUTES.BLOG, label: 'Blog' },
] as const;

type FeaturePageLinksProps = {
  title?: string;
  links?: readonly { to: string; label: string }[];
};

export function FeaturePageLinks({
  title = 'Explore PetClues',
  links = DEFAULT_LINKS,
}: FeaturePageLinksProps) {
  return (
    <nav className={styles.nav} aria-label={title}>
      <p className={styles.title}>{title}</p>
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
