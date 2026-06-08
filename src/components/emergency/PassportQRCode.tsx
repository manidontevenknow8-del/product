import styles from './PassportQRCode.module.css';

type PassportQRCodeProps = {
  petName: string;
};

/* Decorative QR-style grid - placeholder for future scannable code */
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

export function PassportQRCode({ petName }: PassportQRCodeProps) {
  return (
    <section className={styles.section} aria-labelledby="qr-code-title">
      <h2 id="qr-code-title" className={styles.title}>
        Scan to access
      </h2>
      <p className={styles.subtitle}>
        Share this code with anyone who needs {petName}&apos;s emergency details
      </p>

      <p className={styles.petLabel}>{petName}&apos;s Emergency Passport</p>

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

      <p className={styles.footer}>
        Secure, time-limited access. Revoke anytime from your settings.
      </p>
    </section>
  );
}
