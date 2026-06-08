import { Button } from '@/components/ui';
import { useAnalytics } from '@/analytics';
import { isPostHogEnabled } from '@/analytics/posthog';
import styles from './AnalyticsDashboard.module.css';

const ADAPTERS = [
  { name: 'console', active: import.meta.env.DEV },
  { name: 'localStorage', active: true },
  { name: 'posthog', active: isPostHogEnabled() },
  { name: 'plausible', active: false },
  { name: 'google_analytics', active: false },
  { name: 'mixpanel', active: false },
];

export function AnalyticsDashboard() {
  const { recentEvents, clearEvents, refreshEvents } = useAnalytics();

  return (
    <article className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Analytics events</h2>
          <p className={styles.subtitle}>
            Beta event log — PostHog sends when VITE_POSTHOG_KEY and VITE_POSTHOG_HOST are set at build time.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" onClick={refreshEvents}>
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={clearEvents}>
            Clear log
          </Button>
        </div>
      </div>

      <div className={styles.adapters}>
        {ADAPTERS.map((a) => (
          <span
            key={a.name}
            className={`${styles.adapter} ${a.active ? styles.adapterActive : ''}`}
          >
            {a.name}{a.active ? ' ✓' : ' (placeholder)'}
          </span>
        ))}
      </div>

      {recentEvents.length === 0 ? (
        <p className={styles.empty}>
          No events recorded yet. Navigate the app to generate page views and actions.
        </p>
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Event</th>
                <th>Time</th>
                <th>Page / Properties</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.slice(0, 50).map((event, i) => (
                <tr key={`${event.timestamp}-${i}`}>
                  <td className={styles.eventName}>{event.name}</td>
                  <td>{new Date(event.timestamp).toLocaleTimeString()}</td>
                  <td>
                    {event.properties
                      ? JSON.stringify(event.properties).slice(0, 80)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
