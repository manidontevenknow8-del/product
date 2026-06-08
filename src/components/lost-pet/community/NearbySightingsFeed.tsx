import { Button } from '@/components/ui';
import { SightingReportCard } from './SightingReportCard';
import type { Sighting } from '@/types/lostPet';
import styles from './NearbySightingsFeed.module.css';

type NearbySightingsFeedProps = {
  sightings: Sighting[];
  onMarkReviewed?: (id: string) => void;
  onReportSighting?: () => void;
};

export function NearbySightingsFeed({
  sightings,
  onMarkReviewed,
  onReportSighting,
}: NearbySightingsFeedProps) {
  return (
    <section className={styles.feed} aria-label="Nearby sightings">
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Sightings & reports</h2>
          <p className={styles.subtitle}>
            {sightings.length === 0
              ? 'No reports yet - share your recovery link to reach more people'
              : `${sightings.length} report${sightings.length === 1 ? '' : 's'} received`}
          </p>
        </div>
        {onReportSighting && (
          <Button variant="secondary" size="sm" onClick={onReportSighting}>
            Report sighting
          </Button>
        )}
      </div>

      {sightings.length === 0 ? (
        <p className={styles.empty}>
          Community reports will appear here. This is not a social feed - only
          verified sighting reports related to your recovery case.
        </p>
      ) : (
        sightings.map((sighting) => (
          <SightingReportCard
            key={sighting.id}
            sighting={sighting}
            onMarkReviewed={onMarkReviewed}
          />
        ))
      )}

      <p className={styles.disclaimer}>
        Reports are moderated. Future: geo-verified sightings and map view.
      </p>
    </section>
  );
}
