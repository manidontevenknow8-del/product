import { useState } from 'react';
import { useDailyCheckIn } from '@/dailyCheckIn';
import { useSymptomLogs } from '@/symptomLog';
import { useHousehold } from '@/household';
import { SymptomLogForm } from '@/components/symptom-log';
import { useHealthRecords } from '@/healthRecords';
import { getUserFacingError } from '@/utils/userFacingErrors';
import styles from '../../DashboardPage.module.css';

const FEEDING_OPTIONS = [
  'Dry kibble',
  'Wet food',
  'Raw diet',
  'Home cooked',
  'Mixed meal',
  'Treats',
] as const;

type RitualCheckInProps = {
  petName: string;
};

export function RitualCheckIn({ petName }: RitualCheckInProps) {
  const { todayCheckIn, isLoading, saveCheckIn } = useDailyCheckIn();
  const { createLog: createSymptomLog } = useSymptomLogs();
  const { canEdit: canEditHousehold } = useHousehold();
  const { healthSummary } = useHealthRecords();
  const [feeding, setFeeding] = useState('');
  const [walkKm, setWalkKm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [showSymptoms, setShowSymptoms] = useState(false);

  const showForm = !todayCheckIn || editing;
  const weightPlaceholder = healthSummary.latestWeight
    ? `Last recorded ${healthSummary.latestWeight}`
    : 'Optional';

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

    const weightValue = weightKg.trim() === '' ? null : Number.parseFloat(weightKg);
    if (weightKg.trim() !== '' && (!Number.isFinite(weightValue) || weightValue! <= 0)) {
      setError('Enter a valid weight in kg.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveCheckIn({
        feeding: trimmed,
        walkDistanceKm: walkValue,
        weightKg: weightValue,
      });
      setEditing(false);
    } catch (err) {
      setError(getUserFacingError(err, 'generic', 'Could not save check-in.'));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    if (!todayCheckIn) return;
    setFeeding(todayCheckIn.feeding);
    setWalkKm(todayCheckIn.walkDistanceKm != null ? String(todayCheckIn.walkDistanceKm) : '');
    setWeightKg(todayCheckIn.weightKg != null ? String(todayCheckIn.weightKg) : '');
    setEditing(true);
  };

  return (
    <div className={styles.ritualGrid}>
      <header className={styles.ritualIntro}>
        <p className={styles.sectionEyebrowGold}>Today&apos;s ritual</p>
        <h2 id="chapter-checkin" className={styles.ritualTitle}>
          A quiet moment to log the day
        </h2>
        <p className={styles.ritualLead}>
          Feeding, walks, and weight — the small details that keep {petName}&apos;s story accurate.
        </p>
      </header>

      <div className={styles.ritualFormWrap}>
        {isLoading ? (
          <p className={styles.mutedText}>Loading today&apos;s check-in…</p>
        ) : showForm ? (
          <form className={styles.ritualForm} onSubmit={(e) => void handleSubmit(e)}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>What did you feed {petName}?</span>
              <input
                className={styles.fieldInput}
                type="text"
                value={feeding}
                onChange={(e) => setFeeding(e.target.value)}
                placeholder="e.g. Dry kibble with chicken topper"
                maxLength={200}
              />
            </label>

            <div className={styles.feedingRow} role="group" aria-label="Feeding type">
              {FEEDING_OPTIONS.map((option, index) => (
                <span key={option} className={styles.feedingOptionWrap}>
                  {index > 0 && <span className={styles.feedingSep} aria-hidden>/</span>}
                  <button
                    type="button"
                    className={`${styles.feedingOption} ${feeding === option || (option === 'Treats' && feeding === 'Treats / snacks') ? styles.feedingOptionActive : ''}`}
                    onClick={() => setFeeding(option === 'Treats' ? 'Treats / snacks' : option)}
                  >
                    {option}
                  </button>
                </span>
              ))}
            </div>

            <div className={styles.fieldPair}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Distance walked · km</span>
                <input
                  className={styles.fieldInput}
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={walkKm}
                  onChange={(e) => setWalkKm(e.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Weight · kg</span>
                <input
                  className={styles.fieldInput}
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder={weightPlaceholder}
                />
              </label>
            </div>

            {error && (
              <p className={styles.fieldError} role="alert">
                {error}
              </p>
            )}

            <button type="submit" className={styles.submitBlock} disabled={saving}>
              {saving ? 'Saving…' : todayCheckIn ? 'Update today' : 'Log today'}
            </button>
            {editing && (
              <button type="button" className={styles.textAction} onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
          </form>
        ) : (
          <div className={styles.checkInDone}>
            <p className={styles.checkInDoneLead}>Logged for today</p>
            <dl className={styles.checkInDoneList}>
              <div>
                <dt>Fed</dt>
                <dd>{todayCheckIn.feeding}</dd>
              </div>
              <div>
                <dt>Walk</dt>
                <dd>
                  {todayCheckIn.walkDistanceKm != null
                    ? `${todayCheckIn.walkDistanceKm} km`
                    : '—'}
                </dd>
              </div>
              <div>
                <dt>Weight</dt>
                <dd>
                  {todayCheckIn.weightKg != null ? `${todayCheckIn.weightKg} kg` : '—'}
                </dd>
              </div>
            </dl>
            <button type="button" className={styles.textAction} onClick={startEdit}>
              Edit entry
            </button>
          </div>
        )}
      </div>

      {canEditHousehold && (
        <div className={styles.ritualSymptomWrap}>
          {!showSymptoms ? (
            <button type="button" className={styles.textAction} onClick={() => setShowSymptoms(true)}>
              Log symptoms today
            </button>
          ) : (
            <>
              <p className={styles.ritualSymptomLead}>Notice anything off? Log symptoms separately from feeding and walks.</p>
              <SymptomLogForm
                petName={petName}
                compact
                submitLabel="Save symptom log"
                onSubmit={async (input) => {
                  await createSymptomLog(input);
                  setShowSymptoms(false);
                }}
              />
              <button type="button" className={styles.textAction} onClick={() => setShowSymptoms(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
