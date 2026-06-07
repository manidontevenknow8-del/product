import styles from './MonthPicker.module.css';

type MonthPickerProps = {
  monthKey: string; // YYYY-MM
  onChange: (monthKey: string) => void;
  disabled?: boolean;
};

export function MonthPicker({ monthKey, onChange, disabled = false }: MonthPickerProps) {
  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor="month-picker">
        Month
      </label>
      <input
        id="month-picker"
        className={styles.input}
        type="month"
        value={monthKey}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

