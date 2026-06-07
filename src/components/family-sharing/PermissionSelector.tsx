import { PERMISSION_DEFINITIONS } from '@/data/familySharingData';
import type { CaretakerPermission } from '@/types/familySharing';
import styles from './PermissionSelector.module.css';

type PermissionSelectorProps = {
  value: CaretakerPermission;
  onChange: (permission: CaretakerPermission) => void;
  disabled?: boolean;
};

export function PermissionSelector({
  value,
  onChange,
  disabled = false,
}: PermissionSelectorProps) {
  return (
    <div className={styles.selector} role="radiogroup" aria-label="Permission level">
      {PERMISSION_DEFINITIONS.map((def) => (
        <button
          key={def.level}
          type="button"
          className={`${styles.option} ${value === def.level ? styles.optionSelected : ''}`}
          onClick={() => onChange(def.level)}
          disabled={disabled}
          role="radio"
          aria-checked={value === def.level}
        >
          <div className={styles.header}>
            <span className={styles.label}>{def.label}</span>
            <span className={styles.radio} aria-hidden="true" />
          </div>
          <p className={styles.description}>{def.description}</p>
          <div className={styles.capabilities}>
            {def.capabilities.map((cap) => (
              <span key={cap} className={styles.capability}>
                {cap}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
