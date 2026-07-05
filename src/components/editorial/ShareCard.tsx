import type { ReactNode } from 'react';
import { PublicEmergencyQrCode } from '@/components/emergency/PublicEmergencyQrCode';
import styles from './ShareCard.module.css';

export type ShareCardTone = 'gold' | 'burgundy';

export type ShareCardProps = {
  kicker: string;
  title: string;
  lead: string;
  windowNote?: string;
  tone?: ShareCardTone;
  publicUrl: string | null;
  isLoading: boolean;
  loadingMessage?: string;
  canEdit: boolean;
  viewerMessage?: string;
  error?: string | null;
  actions: ReactNode;
  qrCaption?: string;
  'aria-labelledby'?: string;
};

export function ShareCard({
  kicker,
  title,
  lead,
  windowNote,
  tone = 'gold',
  publicUrl,
  isLoading,
  loadingMessage = 'Preparing share link…',
  canEdit,
  viewerMessage,
  error,
  actions,
  qrCaption,
  'aria-labelledby': ariaLabelledBy,
}: ShareCardProps) {
  return (
    <section
      className={`${styles.section} ${styles[tone]}`}
      aria-labelledby={ariaLabelledBy ?? 'share-card-title'}
    >
      <div className={styles.card}>
        <div className={styles.copyCol}>
          <p className={styles.kicker}>{kicker}</p>
          <h2 id={ariaLabelledBy ?? 'share-card-title'} className={styles.title}>
            {title}
          </h2>
          <p className={styles.lead}>{lead}</p>
          {windowNote && (
            <p className={styles.windowNote} role="note">
              {windowNote}
            </p>
          )}

          {isLoading ? (
            <p className={styles.status}>{loadingMessage}</p>
          ) : publicUrl ? (
            <>
              <p className={styles.url} title={publicUrl}>
                {publicUrl}
              </p>
              <div className={styles.actions}>{actions}</div>
            </>
          ) : (
            <div className={styles.actions}>
              {canEdit ? (
                actions
              ) : (
                <p className={styles.status}>
                  {viewerMessage ?? 'No active link yet. Ask a household editor to publish.'}
                </p>
              )}
            </div>
          )}

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>

        {publicUrl && qrCaption && (
          <div className={styles.qrCol}>
            <PublicEmergencyQrCode url={publicUrl} label={qrCaption} />
            <p className={styles.qrCaption}>Scan to open</p>
          </div>
        )}
      </div>
    </section>
  );
}
