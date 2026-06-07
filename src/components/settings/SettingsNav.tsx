import type { SettingsSection } from '@/types/settings';
import styles from './SettingsNav.module.css';

const SECTIONS: { id: SettingsSection; label: string }[] = [
  { id: 'account', label: 'Account' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'security', label: 'Security' },
];

type SettingsNavProps = {
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
};

export function SettingsNav({ active, onChange }: SettingsNavProps) {
  return (
    <nav className={styles.nav} aria-label="Settings sections">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className={`${styles.navItem} ${active === section.id ? styles.navItemActive : ''}`}
          onClick={() => onChange(section.id)}
          aria-current={active === section.id ? 'page' : undefined}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
