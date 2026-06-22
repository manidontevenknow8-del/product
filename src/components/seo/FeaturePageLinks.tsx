import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { FOOTER_SOLUTION_LINKS } from '@/data/footerLinks';
import styles from './FeaturePageLinks.module.css';

const DEFAULT_LINKS = [
  { to: ROUTES.BLOG, label: 'Blog' },
  { to: ROUTES.BEST, label: 'Best guides' },
  { to: ROUTES.LEARN, label: 'Learn' },
  { to: ROUTES.FAQ, label: 'FAQ' },
  { to: ROUTES.ABOUT, label: 'About' },
] as const;

const SOLUTION_LINKS = FOOTER_SOLUTION_LINKS.map((link) => ({
  to: link.to,
  label: link.label,
}));

type FeaturePageLinksProps = {
  title?: string;
  links?: readonly { to: string; label: string }[];
  showSolutions?: boolean;
};

export function FeaturePageLinks({
  title = 'Explore PetClues',
  links = DEFAULT_LINKS,
  showSolutions = true,
}: FeaturePageLinksProps) {
  const allLinks = showSolutions ? [...SOLUTION_LINKS, ...links] : links;

  return (
    <nav className={styles.nav} aria-label={title}>
      <p className={styles.title}>{title}</p>
      <ul className={styles.list}>
        {allLinks.map((link) => (
          <li key={link.to}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
