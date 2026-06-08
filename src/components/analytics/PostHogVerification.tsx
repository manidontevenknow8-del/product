import { useState } from 'react';
import { Button } from '@/components/ui';
import {
  capturePostHogEvent,
  getPostHogConfig,
  isPostHogEnabled,
} from '@/analytics/posthog';
import styles from './PostHogVerification.module.css';

export function PostHogVerification() {
  const { key, host } = getPostHogConfig();
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const fireTestEvent = () => {
    const eventName = 'posthog_manual_verification_click';
    capturePostHogEvent(eventName, { source: 'system_status_page' });
    setLastEvent(eventName);
  };

  return (
    <section className={styles.panel} aria-labelledby="posthog-verification-title">
      <h3 id="posthog-verification-title" className={styles.title}>
        PostHog verification
      </h3>
      <p className={styles.hint}>
        Open PostHog → Activity and look for <code>posthog_test_app_loaded</code> after loading
        any page. Use the button below to send a manual test event.
      </p>

      <dl className={styles.grid}>
        <div className={styles.row}>
          <dt>Status</dt>
          <dd className={isPostHogEnabled() ? styles.ok : styles.warn}>
            {isPostHogEnabled() ? 'Initialized' : 'Not initialized'}
          </dd>
        </div>
        <div className={styles.row}>
          <dt>VITE_POSTHOG_KEY</dt>
          <dd>{key ? `${key.slice(0, 12)}…` : 'missing'}</dd>
        </div>
        <div className={styles.row}>
          <dt>VITE_POSTHOG_HOST</dt>
          <dd>{host ?? 'missing'}</dd>
        </div>
        {lastEvent ? (
          <div className={styles.row}>
            <dt>Last manual event</dt>
            <dd>{lastEvent}</dd>
          </div>
        ) : null}
      </dl>

      <Button type="button" variant="secondary" size="sm" onClick={fireTestEvent}>
        Send test event
      </Button>
    </section>
  );
}
