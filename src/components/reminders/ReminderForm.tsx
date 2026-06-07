import { Input, Textarea } from '@/components/ui';
import { usePets } from '@/pets';
import type { CreateReminderInput } from '@/types/reminder';
import {
  REMINDER_CATEGORIES,
  categoryLabels,
  repeatLabels,
  priorityLabels,
} from '@/types/reminder';
import type { RepeatFrequency, ReminderCategory, ReminderPriority } from '@/types/reminder';
import styles from './ReminderModal.module.css';

type ReminderFormProps = {
  value: CreateReminderInput;
  onChange: (value: CreateReminderInput) => void;
};

export function ReminderForm({ value, onChange }: ReminderFormProps) {
  const { pets } = usePets();

  const update = <K extends keyof CreateReminderInput>(
    field: K,
    fieldValue: CreateReminderInput[K],
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handlePetChange = (petId: string) => {
    const pet = pets.find((p) => p.id === petId);
    onChange({
      ...value,
      petId,
      petName: pet?.name ?? 'Pet',
    });
  };

  return (
    <div className={styles.form}>
      <Input
        label="Title"
        value={value.title}
        onChange={(e) => update('title', e.target.value)}
        placeholder="e.g. Rabies vaccination"
        required
        autoFocus
      />

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="reminder-category">
            Category
          </label>
          <select
            id="reminder-category"
            className={styles.select}
            value={value.category}
            onChange={(e) => update('category', e.target.value as ReminderCategory)}
          >
            {REMINDER_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {categoryLabels[cat]}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="reminder-pet">
            Pet
          </label>
          {pets.length === 0 ? (
            <p className={styles.noPetHint}>Add a pet first to create reminders.</p>
          ) : (
            <select
              id="reminder-pet"
              className={styles.select}
              value={value.petId}
              onChange={(e) => handlePetChange(e.target.value)}
            >
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className={styles.row}>
        <Input
          label="Due date"
          type="date"
          value={value.dueDate}
          onChange={(e) => update('dueDate', e.target.value)}
          required
        />

        <div className={styles.field}>
          <label className={styles.label} htmlFor="reminder-repeat">
            Repeat
          </label>
          <select
            id="reminder-repeat"
            className={styles.select}
            value={value.repeatFrequency}
            onChange={(e) => update('repeatFrequency', e.target.value as RepeatFrequency)}
          >
            {(Object.keys(repeatLabels) as RepeatFrequency[]).map((freq) => (
              <option key={freq} value={freq}>
                {repeatLabels[freq]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="reminder-priority">
          Priority
        </label>
        <select
          id="reminder-priority"
          className={styles.select}
          value={value.priority}
          onChange={(e) => update('priority', e.target.value as ReminderPriority)}
        >
          {(Object.keys(priorityLabels) as ReminderPriority[]).map((p) => (
            <option key={p} value={p}>
              {priorityLabels[p]}
            </option>
          ))}
        </select>
      </div>

      <Textarea
        label="Notes (optional)"
        value={value.notes ?? ''}
        onChange={(e) => update('notes', e.target.value)}
        placeholder="Add any details you'll want later"
        rows={3}
      />
    </div>
  );
}
