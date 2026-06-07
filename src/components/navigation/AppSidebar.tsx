import { Link, useLocation } from 'react-router-dom';
import { PRIMARY_NAV, SECONDARY_NAV, isNavActive } from '@/routes/navigation';
import { NavIcon } from './navIcons';
import styles from './AppSidebar.module.css';

function NavLink({
  label,
  path,
  icon,
}: {
  label: string;
  path: string;
  icon?: (typeof PRIMARY_NAV)[number]['icon'];
}) {
  const location = useLocation();
  const active = isNavActive(location.pathname, path);
  const isHash = path.startsWith('#');
  const className = `${styles.navLink} ${active ? styles.navLinkActive : ''}`;

  const content = (
    <>
      {icon && (
        <span className={styles.navIconWrap}>
          <NavIcon id={icon} />
        </span>
      )}
      <span className={styles.navLabel}>{label}</span>
    </>
  );

  if (isHash) {
    return (
      <a href={path} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link to={path} className={className}>
      {content}
    </Link>
  );
}

export function AppSidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="Main navigation">
        <div className={styles.group}>
          <span className={styles.sectionLabel}>Main</span>
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.path} label={item.label} path={item.path} icon={item.icon} />
          ))}
        </div>

        <div className={styles.group}>
          <span className={styles.sectionLabel}>More</span>
          {SECONDARY_NAV.map((item) => (
            <NavLink key={item.path} label={item.label} path={item.path} icon={item.icon} />
          ))}
        </div>
      </nav>
    </aside>
  );
}
