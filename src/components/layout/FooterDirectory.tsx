import { Link } from 'react-router-dom';
import { breeds } from '@/content/loadContentData';
import { listBreedHealthIndex } from '@/content/breedHealthPages';
import styles from './FooterDirectory.module.css';

const PILLARS = [
  { href: '/breeds', label: 'Breeds', hint: 'species → size → life-stage' },
  { href: '/symptoms', label: 'Symptoms', hint: 'urgency → species' },
  { href: '/vaccinations', label: 'Vaccinations', hint: 'general + by breed' },
  { href: '/emergency', label: 'Emergency', hint: 'scenario guides' },
  { href: '/vault', label: 'Vault', hint: 'records clusters' },
  { href: '/life-logistics', label: 'Life logistics', hint: 'sitters, travel, moves' },
  { href: '/compare', label: 'Compare', hint: 'alternatives' },
  { href: '/tools', label: 'Tools', hint: 'printable checklists' },
] as const;

/**
 * Compact site directory so every pillar page is reachable in ≤3 clicks from home
 * (home → hub → page, or home → footer hub → page).
 */
export function FooterDirectory() {
  const index = listBreedHealthIndex();
  const byBreed = new Map<string, typeof index>();
  for (const entry of index) {
    if (!byBreed.has(entry.breedSlug)) byBreed.set(entry.breedSlug, []);
    byBreed.get(entry.breedSlug)!.push(entry);
  }

  const dogs = breeds.filter((b) => b.species === 'dog' && byBreed.has(b.slug));
  const cats = breeds.filter((b) => b.species === 'cat' && byBreed.has(b.slug));

  return (
    <nav className={styles.directory} aria-label="Site directory">
      <p className={styles.lead}>
        Full site directory. Home → hub → page keeps every guide within three clicks.
      </p>

      <div className={styles.pillars}>
        {PILLARS.map((p) => (
          <Link key={p.href} to={p.href} className={styles.pillar}>
            <span className={styles.pillarLabel}>{p.label}</span>
            <span className={styles.pillarHint}>{p.hint}</span>
          </Link>
        ))}
      </div>

      <div className={styles.trees}>
        <details className={styles.details}>
          <summary>Species → breed → life-stage ({dogs.length + cats.length} breeds)</summary>
          <div className={styles.speciesBlock}>
            <p className={styles.speciesTitle}>
              <Link to="/breeds#dog">Dogs</Link> ({dogs.length})
            </p>
            <ul className={styles.breedList}>
              {dogs.slice(0, 40).map((b) => (
                <li key={b.slug}>
                  <span className={styles.breedName}>{b.name}</span>
                  {(byBreed.get(b.slug) || []).map((e) => (
                    <Link key={e.path} to={e.path} className={styles.stageLink}>
                      {e.stage}
                    </Link>
                  ))}
                </li>
              ))}
            </ul>
            {dogs.length > 40 ? (
              <Link to="/breeds#dog" className={styles.more}>
                All dog breeds on the breeds hub
              </Link>
            ) : null}
          </div>
          <div className={styles.speciesBlock}>
            <p className={styles.speciesTitle}>
              <Link to="/breeds#cat">Cats</Link> ({cats.length})
            </p>
            <ul className={styles.breedList}>
              {cats.map((b) => (
                <li key={b.slug}>
                  <span className={styles.breedName}>{b.name}</span>
                  {(byBreed.get(b.slug) || []).map((e) => (
                    <Link key={e.path} to={e.path} className={styles.stageLink}>
                      {e.stage}
                    </Link>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </details>

        <details className={styles.details}>
          <summary>Symptom → species</summary>
          <ul className={styles.simpleList}>
            <li>
              <Link to="/symptoms#urgency-emergency">Emergency symptoms</Link>
            </li>
            <li>
              <Link to="/symptoms#urgency-urgent">Urgent symptoms</Link>
            </li>
            <li>
              <Link to="/symptoms#urgency-monitor">Monitor symptoms</Link>
            </li>
            <li>
              <Link to="/symptoms#urgency-emergency-dog">Dog emergency</Link>
              {' · '}
              <Link to="/symptoms#urgency-emergency-cat">Cat emergency</Link>
            </li>
          </ul>
        </details>
      </div>
    </nav>
  );
}
