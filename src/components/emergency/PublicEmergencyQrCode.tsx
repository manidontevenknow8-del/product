import { QRCodeSVG } from 'qrcode.react';
import styles from './PublicEmergencyQrCode.module.css';

type PublicEmergencyQrCodeProps = {
  url: string;
  label: string;
  size?: number;
};

/**
 * High-contrast QR mark for emergency share surfaces (client-rendered SVG).
 */
export function PublicEmergencyQrCode({ url, label, size = 180 }: PublicEmergencyQrCodeProps) {
  return (
    <div className={styles.wrap}>
      <QRCodeSVG
        value={url}
        size={size}
        level="H"
        includeMargin
        bgColor="#ffffff"
        fgColor="#111111"
        className={styles.qr}
        aria-label={label}
        role="img"
      />
    </div>
  );
}
