import { Input, Textarea } from '@/components/ui';
import type { OnboardingPetData } from '@/types/onboarding';
import styles from './PetHealthDetailsForm.module.css';

type PetHealthDetailsFormProps = {
  data: OnboardingPetData;
  onChange: (updates: Partial<OnboardingPetData>) => void;
};

export function PetHealthDetailsForm({ data, onChange }: PetHealthDetailsFormProps) {
  return (
    <div className={styles.form}>
      <div className={styles.header}>
        <h2 className={styles.title}>A little about their health</h2>
        <p className={styles.subtitle}>
          Skip anything you&apos;re unsure of — you can update these anytime.
        </p>
      </div>

      <div className={styles.fields}>
        <Input
          as="select"
          label="Vaccination status"
          value={data.vaccinationStatus}
          onChange={(e) => onChange({ vaccinationStatus: e.target.value })}
        >
          <option value="">Select status</option>
          <option value="up-to-date">Up to date</option>
          <option value="due-soon">Due soon</option>
          <option value="unknown">Not sure</option>
          <option value="none">None recorded</option>
        </Input>

        <Input
          label="Allergies"
          placeholder="e.g. Chicken, pollen — or none"
          value={data.allergies}
          onChange={(e) => onChange({ allergies: e.target.value })}
        />

        <Input
          as="select"
          label="Diet type"
          value={data.dietType}
          onChange={(e) => onChange({ dietType: e.target.value })}
        >
          <option value="">Select diet</option>
          <option value="dry">Dry food</option>
          <option value="wet">Wet food</option>
          <option value="raw">Raw / fresh</option>
          <option value="mixed">Mixed</option>
          <option value="prescription">Prescription diet</option>
        </Input>

        <Input
          label="Weight"
          placeholder="e.g. 28 kg or 12 lbs"
          value={data.weight}
          onChange={(e) => onChange({ weight: e.target.value })}
        />

        <Textarea
          label="Current conditions or notes"
          placeholder="Anything you'd like us to remember — medications, sensitivities, habits…"
          value={data.conditionsNotes}
          onChange={(e) => onChange({ conditionsNotes: e.target.value })}
        />
      </div>

      <p className={styles.optionalNote}>All fields are optional on this step</p>
    </div>
  );
}
