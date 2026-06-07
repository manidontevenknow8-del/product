import { Link, useLocation } from 'react-router-dom';
import { PRIMARY_NAV, isNavActive } from '@/routes/navigation';
import { NavIcon } from './navIcons';
import styles from './BottomNavigation.module.css';

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className={styles.bar} aria-label="Mobile navigation">
      <div className={styles.inner}>
        {PRIMARY_NAV.map((item) => {
          const active = isNavActive(location.pathname, item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.item} ${active ? styles.itemActive : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className={styles.iconWrap} aria-hidden="true">
                {item.icon ? <NavIcon id={item.icon} width={20} height={20} /> : null}
              </span>
              <span className={styles.label}>{item.shortLabel ?? item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
