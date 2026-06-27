import styles from './MinimalLineChart.module.css';

type MinimalLineChartProps = {
  label: string;
  values: number[];
  unit?: string;
  className?: string;
  variant?: 'default' | 'luxury' | 'feature';
};

function formatValue(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function MinimalLineChart({
  label,
  values,
  unit = '',
  className = '',
  variant = 'default',
}: MinimalLineChartProps) {
  const width = 320;
  const height = 96;
  const padding = 12;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = values.map((value, index) => {
    const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y, value };
  });

  const points = coords.map((c) => `${c.x},${c.y}`).join(' ');

  const latest = values[values.length - 1];
  const isLuxury = variant === 'luxury' || variant === 'feature';

  if (isLuxury) {
    const lW = 320;
    const lH = variant === 'feature' ? 200 : 120;
    const lPadX = 18;
    const lPadTop = 24;
    const lPadBottom = 18;
    const plotTop = lPadTop;
    const plotBottom = lH - lPadBottom;
    const plotHeight = plotBottom - plotTop;

    const lCoords = values.map((value, index) => {
      const x = lPadX + (index / Math.max(values.length - 1, 1)) * (lW - lPadX * 2);
      const y = plotTop + (1 - (value - min) / range) * plotHeight;
      return { x, y, value };
    });

    const lPoints = lCoords.map((c) => `${c.x},${c.y}`).join(' ');
    const lArea = [
      `M ${lCoords[0].x} ${plotBottom}`,
      ...lCoords.map((c) => `L ${c.x} ${c.y}`),
      `L ${lCoords[lCoords.length - 1].x} ${plotBottom}`,
      'Z',
    ].join(' ');

    const first = lCoords[0];
    const last = lCoords[lCoords.length - 1];

    const gridRatios = [0, 1 / 3, 2 / 3, 1];
    const gridLines = gridRatios.map((ratio) => {
      const y = plotTop + ratio * plotHeight;
      const value = min + (1 - ratio) * range;
      return { y, value, topPct: (y / lH) * 100 };
    });

    const latestLabel = `${formatValue(latest)}${unit ? ` ${unit}` : ''}`;

    return (
      <figure
        className={`${styles.figure} ${styles.luxury} ${variant === 'feature' ? styles.feature : ''} ${className}`.trim()}
      >
        <figcaption className={styles.caption}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>
            <span className={styles.valueStrong}>{formatValue(latest)}</span>
            {unit ? ` ${unit}` : ''}
          </span>
        </figcaption>

        <div className={styles.luxuryChartWrap}>
          <div className={styles.luxPlot}>
            <svg
              viewBox={`0 0 ${lW} ${lH}`}
              className={styles.luxChart}
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="luxWeightArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(168,131,58,0.14)" />
                  <stop offset="100%" stopColor="rgba(168,131,58,0)" />
                </linearGradient>
                <linearGradient
                  id="luxWeightLine"
                  gradientUnits="userSpaceOnUse"
                  x1={first.x}
                  y1={first.y}
                  x2={last.x}
                  y2={last.y}
                >
                  <stop offset="0%" stopColor="#3D6B62" />
                  <stop offset="100%" stopColor="#A8833A" />
                </linearGradient>
              </defs>

              {gridLines.map((g) => (
                <line
                  key={g.y}
                  x1={lPadX}
                  y1={g.y}
                  x2={lW - lPadX}
                  y2={g.y}
                  stroke="rgba(0,0,0,0.04)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              <path d={lArea} fill="url(#luxWeightArea)" />

              <polyline
                fill="none"
                stroke="url(#luxWeightLine)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={lPoints}
                vectorEffect="non-scaling-stroke"
              />

              <line
                x1={last.x}
                y1={last.y}
                x2={last.x}
                y2={plotBottom}
                stroke="#A8833A"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {gridLines.map((g) => (
              <span
                key={g.value}
                className={styles.luxYLabel}
                style={{ top: `${g.topPct}%` }}
              >
                {formatValue(g.value)}
              </span>
            ))}

            <span
              className={styles.luxPill}
              style={{ left: `${(last.x / lW) * 100}%`, top: `${(last.y / lH) * 100}%` }}
            >
              {latestLabel}
            </span>

            <span
              className={styles.luxDot}
              style={{ left: `${(last.x / lW) * 100}%`, top: `${(last.y / lH) * 100}%` }}
            >
              <span className={styles.luxDotGold}>
                <span className={styles.luxDotCenter} />
              </span>
            </span>
          </div>
        </div>
      </figure>
    );
  }

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
        {coords.map((c, index) => (
          <circle
            key={index}
            cx={c.x}
            cy={c.y}
            r={index === coords.length - 1 ? 3.5 : 2}
            fill="currentColor"
            opacity={index === coords.length - 1 ? 1 : 0.35}
          />
        ))}
      </svg>
    </figure>
  );
}
