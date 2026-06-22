import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { FOOTER_RESOURCE_LINKS } from '@/data/footerLinks';

export function AppFooter() {
  return (
    <footer className="app-shell-footer">
      <div className="app-shell-footer-inner">
        <nav className="app-shell-footer-resources" aria-label="Resources">
          {FOOTER_RESOURCE_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="app-shell-footer-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="app-shell-footer-actions">
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
      </div>
    </footer>
  );
}
