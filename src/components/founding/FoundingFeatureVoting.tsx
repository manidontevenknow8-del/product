import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import {
  listFoundingFeatureVotes,
  toggleFoundingFeatureVote,
  type FoundingFeatureCandidate,
} from '@/services/founding/foundingService';
import styles from './FoundingFeatureVoting.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

type FoundingFeatureVotingProps = {
  userId: string;
  compact?: boolean;
};

export function FoundingFeatureVoting({ userId, compact = false }: FoundingFeatureVotingProps) {
  const [candidates, setCandidates] = useState<FoundingFeatureCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listFoundingFeatureVotes(userId);
      setCandidates(list);
    } catch (err) {
      setError(getUserFacingError(err, 'generic', 'Could not load votes'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleToggle = async (candidate: FoundingFeatureCandidate) => {
    setBusyId(candidate.id);
    setError(null);
    try {
      await toggleFoundingFeatureVote(userId, candidate.id, candidate.votedByUser);
      await refresh();
    } catch (err) {
      setError(getUserFacingError(err, 'generic', 'Vote failed'));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className={styles.loading}>Loading roadmap votes…</p>;
  }

  return (
    <div className={compact ? styles.compact : styles.wrap}>
      {!compact && (
        <header className={styles.header}>
          <p className={styles.eyebrow}>Founding perk</p>
          <h3 className={styles.title}>Feature voting</h3>
          <p className={styles.lead}>
            Vote for what we build next. You can support multiple ideas - we weight votes from
            founding members when prioritizing the roadmap.
          </p>
        </header>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <ul className={styles.list}>
        {candidates.map((candidate) => (
          <li key={candidate.id} className={styles.item}>
            <div className={styles.itemCopy}>
              <h4 className={styles.itemTitle}>{candidate.title}</h4>
              <p className={styles.itemBody}>{candidate.description}</p>
              <span className={styles.voteCount}>
                {candidate.voteCount} founding vote{candidate.voteCount === 1 ? '' : 's'}
              </span>
            </div>
            <Button
              variant={candidate.votedByUser ? 'primary' : 'secondary'}
              size="sm"
              disabled={busyId === candidate.id}
              onClick={() => void handleToggle(candidate)}
            >
              {busyId === candidate.id
                ? 'Saving…'
                : candidate.votedByUser
                  ? 'Voted'
                  : 'Vote'}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
