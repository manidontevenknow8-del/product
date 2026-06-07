import type { MedicalInfo } from '@/types/passport';
import styles from './MedicalInfoCard.module.css';

type MedicalInfoCardProps = {
  info: MedicalInfo;
};

export function MedicalInfoCard({ info }: MedicalInfoCardProps) {
  const items = [
    { label: 'Vaccine status', value: info.vaccineStatus },
    { label: 'Recent treatments', value: info.recentTreatments },
    { label: 'Important health records', value: info.importantRecords },
  ];

  return (
    <section className={styles.card} aria-labelledby="medical-info-title">
      <h2 id="medical-info-title" className={styles.title}>
        Medical information
      </h2>

      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.label} className={styles.item}>
            <span className={styles.label}>{item.label}</span>
            <p className={styles.value}>{item.value}</p>
          </div>
        ))}
        <div className={styles.item}>
          <span className={styles.label}>Next important care event</span>
          <div className={styles.nextEvent}>
            <p className={styles.value}>{info.nextCareEvent}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
