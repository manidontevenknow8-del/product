import { MONTHLY_REPORT_IMG, monthlyReportImageUrl } from '@/data/monthlyReportImages';
import type { MonthlyPetLifeReport } from '@/types/monthlyReport';
import styles from './MonthlyReportHero.module.css';

type MonthlyReportHeroProps = {
  report: MonthlyPetLifeReport;
};

export function MonthlyReportHero({ report }: MonthlyReportHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="monthly-report-hero-title">
      <img
        src={monthlyReportImageUrl(MONTHLY_REPORT_IMG.hero)}
        alt=""
        className={styles.heroImg}
        aria-hidden
      />
      <div className={styles.identity}>
        <p className={styles.eyebrow}>PetClues · Monthly life report</p>
        <h1 id="monthly-report-hero-title" className={styles.title}>
          {report.petName}&apos;s {report.monthLabel}
        </h1>
        <p className={styles.subtitle}>A visual story of care, consistency, and milestones.</p>
      </div>
    </section>
  );
}
