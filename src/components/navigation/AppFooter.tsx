import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

export function AppFooter() {
  return (
    <footer className="app-shell-footer">
      <div className="app-shell-footer-inner">
        <Link to={ROUTES.FAQ} className="app-shell-footer-link">
          Help
        </Link>
        <Link to={ROUTES.PRIVACY} className="app-shell-footer-link">
          Privacy
        </Link>
        <Link
          to={ROUTES.PRICING}
          className="app-shell-footer-link app-shell-footer-link--emphasis"
        >
          Upgrade Plan
        </Link>
      </div>
    </footer>
  );
}
