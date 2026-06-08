import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useDailyCheckIn } from '@/dailyCheckIn';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { ROUTES } from '@/routes/paths';
import styles from './DailyCheckInCard.module.css';

const FEEDING_PRESETS = [
  'Dry kibble',
  'Wet food',
  'Raw diet',
  'Home cooked',
  'Mixed meal',
  'Treats / snacks',
] as const;

type DailyCheckInCardProps = {
  petName: string;
};

export function DailyCheckInCard({ petName }: DailyCheckInCardProps) {
  const { todayCheckIn, streak, weekSummary, isLoading, saveCheckIn } = useDailyCheckIn();
  const { isPremium } = useSubscription();
  const [feeding, setFeeding] = useState('');
  const [walkKm, setWalkKm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const showForm = !todayCheckIn || editing;

  const handlePreset = (preset: string) => {
    setFeeding(preset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = feeding.trim();
    if (!trimmed) {
      setError('Tell us what you fed today.');
      return;
    }

    const walkValue = walkKm.trim() === '' ? null : Number.parseFloat(walkKm);
    if (walkKm.trim() !== '' && (!Number.isFinite(walkValue) || walkValue! < 0)) {
      setError('Enter a valid walk distance in km.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveCheckIn({
        feeding: trimmed,
        walkDistanceKm: walkValue,
      });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save check-in.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.card} aria-labelledby="daily-check-in-title">
      <div className={styles.head}>
        <div>
          <p className={styles.kicker}>Today&apos;s ritual</p>
          <h2 id="daily-check-in-title" className={styles.title}>
            Daily check-in
          </h2>
          <p className={styles.subtitle}>
            Log what {petName} ate and how far you walked - builds streaks and monthly stories.
          </p>
        </div>
        {streak > 0 && (
          <div className={styles.streak} aria-label={`${streak} day streak`}>
            <span className={styles.streakValue}>{streak}</span>
            <span className={styles.streakLabel}>day streak</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className={styles.loading}>Loading today&apos;s check-in…</p>
      ) : showForm ? (
        <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
          <label className={styles.field}>
            <span className={styles.label}>What did you feed {petName}?</span>
            <input
              className={styles.input}
              type="text"
              value={feeding}
              onChange={(e) => setFeeding(e.target.value)}
              placeholder="e.g. Dry kibble with chicken topper"
              maxLength={200}
            />
          </label>

          <div className={styles.presets} role="group" aria-label="Feeding presets">
            {FEEDING_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`${styles.preset} ${feeding === preset ? styles.presetActive : ''}`}
                onClick={() => handlePreset(preset)}
              >
                {preset}
              </button>
            ))}
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Distance walked (km)</span>
            <input
              className={styles.input}
              type="number"
              min="0"
              step="0.1"
              inputMode="decimal"
              value={walkKm}
              onChange={(e) => setWalkKm(e.target.value)}
              placeholder="Optional - e.g. 2.5"
            />
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving…' : todayCheckIn ? 'Update today' : 'Log today'}
            </Button>
            {editing && (
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      ) : (
        <div className={styles.done}>
          <p className={styles.doneLead}>Logged for today</p>
          <dl className={styles.doneList}>
            <div>
              <dt>Fed</dt>
              <dd>{todayCheckIn.feeding}</dd>
            </div>
            <div>
              <dt>Walk</dt>
              <dd>
                {todayCheckIn.walkDistanceKm != null
                  ? `${todayCheckIn.walkDistanceKm} km`
                  : 'Not recorded'}
              </dd>
            </div>
          </dl>
          <Button type="button" variant="secondary" size="sm" onClick={() => {
            setFeeding(todayCheckIn.feeding);
            setWalkKm(
              todayCheckIn.walkDistanceKm != null ? String(todayCheckIn.walkDistanceKm) : '',
            );
            setEditing(true);
          }}>
            Edit
          </Button>
        </div>
      )}

      {isPremium ? (
        <div className={styles.weekPanel}>
          <h3 className={styles.weekTitle}>Last 7 days</h3>
          <div className={styles.weekStats}>
            <div>
              <span className={styles.weekValue}>{weekSummary.daysLogged}</span>
              <span className={styles.weekLabel}>days logged</span>
            </div>
            <div>
              <span className={styles.weekValue}>{weekSummary.totalWalkKm}</span>
              <span className={styles.weekLabel}>km walked</span>
            </div>
            <div>
              <span className={styles.weekValue}>
                {weekSummary.avgWalkKm != null ? weekSummary.avgWalkKm : '-'}
              </span>
              <span className={styles.weekLabel}>avg km / walk</span>
            </div>
          </div>
        </div>
      ) : (
        <p className={styles.proTease}>
          <Link to={ROUTES.PRICING}>Upgrade to Pro</Link> for 7-day feeding &amp; walk trends.
        </p>
      )}
    </section>
  );
}
