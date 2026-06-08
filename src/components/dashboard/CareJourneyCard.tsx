import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '@/components/ui';
import {
  careJourneyProgress,
  computeCareJourney,
  type CareJourneyInput,
} from '@/services/journey/careJourneyService';
import styles from './CareJourneyCard.module.css';

type CareJourneyCardProps = CareJourneyInput;

export function CareJourneyCard(props: CareJourneyCardProps) {
  const steps = computeCareJourney(props);
  const { completed, total, percent, nextStep } = careJourneyProgress(steps);

  return (
    <Card variant="flat" className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Your care journey</span>
          <h2 className={styles.title}>Turn records into a story</h2>
          <p className={styles.subtitle}>
            Each step unlocks the next - from first scan to monthly celebration.{' '}
            <strong>{completed}</strong> of <strong>{total}</strong> complete ({percent}%).
          </p>
        </div>
        <div
          className={styles.ring}
          style={{ background: `conic-gradient(#0d9488 ${percent}%, #e2e8f0 0)` }}
          aria-hidden
        >
          <span className={styles.ringValue}>{percent}%</span>
        </div>
      </div>

      <div className={styles.track} role="list">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`${styles.step} ${step.completed ? styles.stepDone : ''}`}
            role="listitem"
          >
            <div className={styles.stepMarker}>
              {step.completed ? '✓' : index + 1}
            </div>
            <div className={styles.stepBody}>
              <div className={styles.stepTop}>
                <span className={styles.stepTitle}>{step.title}</span>
                {step.completed ? (
                  <Badge variant="dark">Done</Badge>
                ) : nextStep?.id === step.id ? (
                  <Badge variant="accent">Up next</Badge>
                ) : null}
              </div>
              <p className={styles.stepDesc}>{step.description}</p>
              {step.premiumTease && !step.completed && (
                <p className={styles.premiumTease}>{step.premiumTease}</p>
              )}
              {!step.completed && (
                <Link to={step.path} className={styles.stepLink}>
                  Continue →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {nextStep && (
        <div className={styles.footer}>
          <Link to={nextStep.path}>
            <Button variant="primary" size="sm">
              Continue: {nextStep.title}
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
