import { Badge, Button } from '@/components/ui';
import { SCAN_IMG } from '@/data/scanImages';
import styles from './ScanHero.module.css';

type ScanHeroProps = {
  onUploadClick: () => void;
  petName?: string;
  disabled?: boolean;
};

export function ScanHero({ onUploadClick, petName = 'your pet', disabled = false }: ScanHeroProps) {
  return (
    <section className={styles.hero} aria-label="PetClues Scan">
      <img className={styles.heroImg} src={SCAN_IMG.hero} alt="" aria-hidden />
      <div className={styles.heroScrim} aria-hidden />
      <div className={styles.heroInner}>
        <Badge variant="accent" className={styles.eyebrow}>
          PetClues Scan
        </Badge>
        <h1 className={styles.title}>Upload anything. Understand everything.</h1>
        <p className={styles.subtitle}>
          Drop a vet bill, vaccine card, or prescription for {petName}. We store it securely, decode
          it once with AI, and save the report so you can reopen it anytime without another scan.
        </p>
        <Button variant="primary" size="lg" onClick={onUploadClick} disabled={disabled}>
          Upload a document
        </Button>
      </div>
    </section>
  );
}
