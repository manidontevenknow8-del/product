import type { LostPetCase } from '@/types/lostPet';
import styles from './EmergencyQRCode.module.css';

const PATTERN = [
  1,1,1,1,1,1,1,0,1,
  1,0,0,0,0,0,1,0,1,
  1,0,1,1,1,0,1,1,0,
  1,0,1,1,1,0,1,0,1,
  1,0,1,1,1,0,1,1,0,
  1,0,0,0,0,0,1,0,1,
  1,1,1,1,1,1,1,0,1,
  0,0,0,0,0,0,0,1,0,
  1,0,1,0,1,1,0,1,1,
];

type EmergencyQRCodeProps = {
  activeCase: LostPetCase;
};

export function EmergencyQRCode({ activeCase }: EmergencyQRCodeProps) {
  return (
    <section className={styles.section} aria-label="Recovery QR code">
      <h2 className={styles.title}>Recovery QR code</h2>
      <p className={styles.subtitle}>
        Anyone can scan to view {activeCase.petName}&apos;s recovery page and report a sighting
      </p>

      <div className={styles.qrWrap}>
        <div className={styles.qr} aria-hidden="true">
          {PATTERN.map((cell, i) => (
            <div
              key={i}
              className={`${styles.cell} ${cell ? styles.cellDark : ''}`}
            />
          ))}
        </div>
      </div>

      <p className={styles.link}>{activeCase.recoveryLink}</p>

      <p className={styles.footer}>
        Place on posters, flyers, and neighbourhood posts. Revoke access when {activeCase.petName} is home safe.
      </p>
    </section>
  );
}
