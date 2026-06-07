import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const defaults: IconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export type NavIconId =
  | 'dashboard'
  | 'reminders'
  | 'profile'
  | 'scan'
  | 'timeline'
  | 'passport'
  | 'score'
  | 'report'
  | 'family'
  | 'notifications'
  | 'age'
  | 'lost'
  | 'referrals'
  | 'feedback'
  | 'settings'
  | 'billing'
  | 'pricing';

export function NavIcon({ id, ...props }: { id: NavIconId } & IconProps) {
  const p = { ...defaults, ...props };
  switch (id) {
    case 'dashboard':
      return (
        <svg {...p}>
          <path d="M4 11h6V4H4v7zm10 9h6v-7h-6v7zM4 20h6v-5H4v5zm10-13h6V4h-6v3z" />
        </svg>
      );
    case 'reminders':
      return (
        <svg {...p}>
          <path d="M6 8a6 6 0 1 1 12 0v3l2 2H4l2-2V8z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
    case 'profile':
      return (
        <svg {...p}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M6 20c1.5-3 4-4.5 6-4.5s4.5 1.5 6 4.5" />
        </svg>
      );
    case 'scan':
      return (
        <svg {...p}>
          <path d="M7 4h10v16H7z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case 'timeline':
      return (
        <svg {...p}>
          <path d="M6 6h12M6 12h8M6 18h10" />
          <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="16" cy="18" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'passport':
      return (
        <svg {...p}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <circle cx="12" cy="10" r="2.5" />
          <path d="M8 16h8" />
        </svg>
      );
    case 'score':
      return (
        <svg {...p}>
          <path d="M12 3l2.4 5 5.6.8-4 4 1 5.6L12 16l-5 2.4 1-5.6-4-4 5.6-.8L12 3z" />
        </svg>
      );
    case 'report':
      return (
        <svg {...p}>
          <path d="M6 4h12v16H6z" />
          <path d="M9 8h6M9 12h6M9 16h5" />
        </svg>
      );
    case 'family':
      return (
        <svg {...p}>
          <circle cx="9" cy="9" r="2.5" />
          <circle cx="16" cy="10" r="2" />
          <path d="M4 19c0-2.5 2.2-4 5-4s5 1.5 5 4M14 19c0-1.8 1.5-3 3.5-3" />
        </svg>
      );
    case 'notifications':
      return (
        <svg {...p}>
          <path d="M5 10a7 7 0 0 1 14 0v4l2 2H3l2-2v-4z" />
          <path d="M10 18h4" />
        </svg>
      );
    case 'age':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    case 'lost':
      return (
        <svg {...p}>
          <path d="M12 21s-6-4.5-6-9a6 6 0 1 1 12 0c0 4.5-6 9-6 9z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
      );
    case 'referrals':
      return (
        <svg {...p}>
          <path d="M16 11a4 4 0 1 0-8 0M3 20v-1a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v1" />
        </svg>
      );
    case 'feedback':
      return (
        <svg {...p}>
          <path d="M4 6h16v10H8l-4 4V6z" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case 'billing':
      return (
        <svg {...p}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
        </svg>
      );
    case 'pricing':
      return (
        <svg {...p}>
          <path d="M12 3v18M8 7h6a3 3 0 0 1 0 6H10a3 3 0 0 0 0 6h8" />
        </svg>
      );
    default:
      return <svg {...p}><circle cx="12" cy="12" r="2" fill="currentColor" /></svg>;
  }
}
