import styles from './MinimalLineChart.module.css';

type MinimalLineChartProps = {
  label: string;
  values: number[];
  unit?: string;
  className?: string;
};

export function MinimalLineChart({
  label,
  values,
  unit = '',
  className = '',
}: MinimalLineChartProps) {
  const width = 320;
  const height = 96;
  const padding = 8;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const latest = values[values.length - 1];

  return (
    <figure className={`${styles.figure} ${className}`.trim()}>
      <figcaption className={styles.caption}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>
          <span className={styles.valueStrong}>{latest}</span>
          {unit ? ` ${unit}` : ''}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.chart} aria-hidden>
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={1}
        />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {values.map((value, index) => {
          const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
          const y = height - padding - ((value - min) / range) * (height - padding * 2);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={index === values.length - 1 ? 3.5 : 2}
              fill="currentColor"
              opacity={index === values.length - 1 ? 1 : 0.35}
            />
          );
        })}
      </svg>
    </figure>
  );
}
