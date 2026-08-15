import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BreedConditionMeta, BreedConditionRiskLevel } from '@/data/breedConditions';
import { ROUTES } from '@/routes/paths';
import styles from './ClinicalRiskCalculator.module.css';

type ClinicalRiskCalculatorProps = {
  meta: BreedConditionMeta;
};

type ScoreBand = {
  label: string;
  band: 'low' | 'moderate' | 'elevated' | 'urgent';
  message: string;
};

function shortSymptomLabel(symptom: string): string {
  const trimmed = symptom.trim();
  if (trimmed.length <= 72) return trimmed;
  return `${trimmed.slice(0, 69).trimEnd()}…`;
}

function computeBand(
  selectedCount: number,
  total: number,
  riskLevel: BreedConditionRiskLevel,
  breed: string,
): ScoreBand {
  const ratio = total === 0 ? 0 : selectedCount / total;
  const base = Math.round(ratio * 70);
  const riskBoost = riskLevel === 'Severe' ? 25 : riskLevel === 'High' ? 15 : 8;
  const score = Math.min(100, base + (selectedCount > 0 ? riskBoost : 0));

  if (selectedCount === 0) {
    return {
      label: 'No symptoms selected',
      band: 'low',
      message: `Select any signs you’ve observed in your ${breed} to generate a risk profile.`,
    };
  }

  if (score >= 75 || (riskLevel === 'Severe' && ratio >= 0.4)) {
    return {
      label: `Urgent risk profile · ${score}/100`,
      band: 'urgent',
      message:
        'Multiple high-signal signs selected. Contact a veterinarian promptly and keep a dated symptom timeline.',
    };
  }

  if (score >= 50) {
    return {
      label: `Elevated risk profile · ${score}/100`,
      band: 'elevated',
      message:
        'Several clinical signs align with this condition cluster. Document onset dates and share them with your care team.',
    };
  }

  if (score >= 30) {
    return {
      label: `Moderate risk profile · ${score}/100`,
      band: 'moderate',
      message:
        'Some overlapping signs are present. A structured health timeline helps catch progression early.',
    };
  }

  return {
    label: `Low-moderate signal · ${score}/100`,
    band: 'low',
    message:
      'Limited signs selected. Continue monitoring and log anything new - early entries matter most.',
  };
}

export function ClinicalRiskCalculator({ meta }: ClinicalRiskCalculatorProps) {
  const formId = useId();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [result, setResult] = useState<ScoreBand | null>(null);

  const symptoms = meta.symptoms.slice(0, 6);

  function toggle(symptom: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(symptom)) next.delete(symptom);
      else next.add(symptom);
      return next;
    });
    setResult(null);
  }

  function onCalculate() {
    setResult(computeBand(selected.size, symptoms.length, meta.riskLevel, meta.breed));
  }

  return (
    <aside className={styles.card} aria-labelledby={`${formId}-heading`}>
      <p className={styles.kicker}>Clinical Risk &amp; Symptom Decoder</p>
      <h2 id={`${formId}-heading`} className={styles.title}>
        Is your {meta.breed} displaying signs of {meta.condition}?
      </h2>
      <p className={styles.lead}>
        Select observed symptoms below for an immediate risk assessment. This is an educational
        triage aid - not a veterinary diagnosis.
      </p>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Observed signs</legend>
        <ul className={styles.options}>
          {symptoms.map((symptom, index) => {
            const id = `${formId}-symptom-${index}`;
            const checked = selected.has(symptom);
            return (
              <li key={symptom}>
                <label className={styles.option} htmlFor={id}>
                  <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(symptom)}
                  />
                  <span>{shortSymptomLabel(symptom)}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <button type="button" className={styles.calculate} onClick={onCalculate}>
        Calculate Clinical Risk Score
      </button>

      {result && (
        <div className={styles.result} data-band={result.band} role="status">
          <p className={styles.resultLabel}>{result.label}</p>
          <p className={styles.resultBody}>
            Your {meta.breed} has a {result.band === 'urgent' ? 'high-urgency' : result.band} risk
            profile for {meta.condition}. {result.message}
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} to={ROUTES.SIGNUP}>
              Generate a Free Digital Health Timeline in the Sandbox
            </Link>
            <Link className={styles.secondary} to={ROUTES.GENESIS}>
              Secure Your Lifetime Genesis Vault - $249
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
