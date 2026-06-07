import styles from './SettingsToggle.module.css';

type SettingsToggleProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: SettingsToggleProps) {
  return (
    <div className={styles.toggleRow}>
      <div>
        <div className={styles.toggleLabel}>{label}</div>
        <div className={styles.toggleDesc}>{description}</div>
      </div>
      <button
        type="button"
        className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        aria-label={label}
        disabled={disabled}
      />
    </div>
  );
}
