import { MinimalLineChart } from './MinimalLineChart';
import styles from './WeightTrendChart.module.css';
import type { PetWeightTrend } from '@/services/weightTrend';

type WeightTrendChartProps = {
  trend: PetWeightTrend;
  variant?: 'default' | 'luxury' | 'feature';
};

export function WeightTrendChart({ trend, variant = 'feature' }: WeightTrendChartProps) {
  const values = trend.points.map((point) => point.weightKg);
  const dates = trend.points.map((point) => point.date);

  return (
    <div className={styles.wrap}>
      <p className={styles.summary}>{trend.summary}</p>
      <MinimalLineChart
        label="Weight trend"
        values={values}
        dates={dates}
        trendValues={trend.trendValues}
        unit="kg"
        variant={variant}
      />
    </div>
  );
}
