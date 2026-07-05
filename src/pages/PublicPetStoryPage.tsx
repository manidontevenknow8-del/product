import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublicStoryView } from '@/components/timeline/PublicStoryView';
import { getPetStoryShareService } from '@/services/petStoryShare/petStoryShareService';
import type { PublicPetStory } from '@/services/petStoryShare/petStoryShareTypes';
import styles from './PublicPetStoryPage.module.css';

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function PublicPetStoryPage() {
  const { token = '' } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicPetStory | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    if (!token) {
      setState('missing');
      return;
    }

    let cancelled = false;
    setState('loading');

    void getPetStoryShareService()
      .getPublicByToken(token)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setState('missing');
          setData(null);
          return;
        }
        setData(result);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('missing');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === 'loading') {
    return (
      <main className={styles.page}>
        <p className={styles.status}>Loading life story…</p>
      </main>
    );
  }

  if (state === 'missing' || !data) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <p className={styles.eyebrow}>PetClues Story</p>
          <h1 className={styles.missingTitle}>Story unavailable</h1>
          <p className={styles.missingLead}>
            This story link is invalid or has been revoked. Ask the pet owner for a new link.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <PublicStoryView story={data} />
        <footer className={styles.footer}>
          <p>Shared from PetClues · Updated {formatUpdatedAt(data.updatedAt)}</p>
          <p>A living archive of care moments and memories — read-only for visitors.</p>
        </footer>
      </div>
    </main>
  );
}
