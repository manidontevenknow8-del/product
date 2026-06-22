import { Link } from 'react-router-dom';
import { FEATURED_BLOG_SLUGS } from '@/data/internalLinking/hubMappings';
import { ROUTES } from '@/routes/paths';
import styles from './HubIndexResources.module.css';

const FEATURED_LABELS: Record<string, string> = {
  'organize-pet-medical-records-online': 'Organize pet medical records',
  'puppy-vaccination-schedule-2026': 'Puppy vaccination schedule',
  'pet-emergency-information-card-guide': 'Emergency information card',
  'pet-medication-reminder-guide': 'Medication reminder guide',
  'new-puppy-checklist-health-records-vaccines': 'New puppy health checklist',
};

type FeaturedBlogLinksProps = {
  title?: string;
};

export function FeaturedBlogLinks({
  title = 'Popular guides',
}: FeaturedBlogLinksProps) {
  return (
    <nav className={styles.featured} aria-label={title}>
      <h2 className={styles.featuredTitle}>{title}</h2>
      <ul className={styles.list}>
        {FEATURED_BLOG_SLUGS.map((slug) => (
          <li key={slug}>
            <Link to={`${ROUTES.BLOG}/${slug}`} className={styles.link}>
              {FEATURED_LABELS[slug] ?? slug.replace(/-/g, ' ')}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
