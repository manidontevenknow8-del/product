import { Button } from '@/components/ui';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { PAGE_IMG } from '@/data/pageImages';
import styles from './PetCareScoreProGate.module.css';

const PRO_UNLOCKS = [
  'Score trends & history over time',
  'Detailed breakdown by care area',
  'Personalized suggestions & attention flags',
  'Weekly insights built from your real data',
] as const;

type PetCareScoreProGateProps = {
  petName: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  onUpgrade: () => void;
};

export function PetCareScoreProGate({
  petName,
  score,
  trend,
  onUpgrade,
}: PetCareScoreProGateProps) {
  const trendWord =
    trend === 'up' ? 'moving in the right direction' : trend === 'down' ? 'worth a closer look' : 'holding steady';

  return (
    <section className={styles.gate} aria-labelledby="petcare-score-pro-gate">
      <div className={styles.visual} aria-hidden>
        <img src={PAGE_IMG.app.score} alt="" className={styles.visualImg} />
        <div className={styles.visualScrim} />
      </div>

      <div className={styles.content}>
        <span className={styles.badge}>Pro</span>
        <h2 id="petcare-score-pro-gate" className={styles.headline}>
          {petName}&apos;s full care story is right here - waiting for you
        </h2>
        <p className={styles.emotional}>
          You&apos;re at <strong>{score}</strong> today, and that&apos;s a real start. But the
          picture most pet parents wish they had sooner - what&apos;s improving, what&apos;s slipping,
          and the small changes that compound over months - lives behind Pro. You clearly care about{' '}
          {petName}. This is how you turn that care into a calmer, more confident routine,{' '}
          {trendWord}.
        </p>

        <ul className={styles.unlockList}>
          {PRO_UNLOCKS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className={styles.actions}>
          <Button variant="primary" size="md" onClick={onUpgrade}>
            Unlock {petName}&apos;s deeper care insights
          </Button>
        </div>

        <p className={styles.disclaimer}>{HEALTH_DISCLAIMER}</p>
      </div>
    </section>
  );
}
