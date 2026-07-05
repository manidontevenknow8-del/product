import styles from './PublicEmergencyQrCode.module.css';

type PublicEmergencyQrCodeProps = {
  url: string;
  label: string;
};

export function PublicEmergencyQrCode({ url, label }: PublicEmergencyQrCodeProps) {
  const qrSrc = `https://quickchart.io/qr?text=${encodeURIComponent(url)}&size=220&margin=2&dark=1a1a1a&light=ffffff`;

  return (
    <img
      src={qrSrc}
      alt={label}
      className={styles.qr}
      width={220}
      height={220}
      loading="lazy"
      decoding="async"
    />
  );
}
