import { useMemo } from 'react';
import type { VetBillExtractionResult } from '@/services/vetBillDecoder';
import { resolveDetailedReport } from '@/services/vetBillDecoder';
import styles from './ReportVisualDashboard.module.css';

type ReportVisualDashboardProps = {
  result: VetBillExtractionResult;
};

type Segment = { label: string; value: number; color: string };

const COLORS = {
  vaccine: '#5A8F7B',
  med: '#6B8FA8',
  dx: '#C4A882',
  follow: '#C4A060',
  remind: '#9B8AA8',
};

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function DonutChart({ segments, total }: { segments: Segment[]; total: number }) {
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = 52;
  const stroke = 18;
  let angle = 0;

  const arcs = segments.map((seg) => {
    const sweep = total > 0 ? (seg.value / total) * 360 : 0;
    const start = angle;
    angle += sweep;
    if (sweep < 0.5) return null;
    const large = sweep > 180 ? 1 : 0;
    const startPt = polar(cx, cy, r, start);
    const endPt = polar(cx, cy, r, start + sweep);
    const d = `M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${large} 1 ${endPt.x} ${endPt.y}`;
    return <path key={seg.label} d={d} fill="none" stroke={seg.color} strokeWidth={stroke} strokeLinecap="round" />;
  });

  return (
    <div className={styles.donutWrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} opacity={0.35} />
        {arcs}
        <text x={cx} y={cy - 4} textAnchor="middle" className={styles.donutCenterNum}>
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" className={styles.donutCenterLabel}>
          items
        </text>
      </svg>
      <ul className={styles.donutLegend}>
        {segments.map((s) => (
          <li key={s.label}>
            <span className={styles.legendSwatch} style={{ background: s.color }} />
            {s.label} <strong>{s.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConfidenceMeter({
  high,
  medium,
  low,
}: {
  high: number;
  medium: number;
  low: number;
}) {
  const total = high + medium + low || 1;
  const pctHigh = (high / total) * 100;
  const pctMed = (medium / total) * 100;
  const pctLow = (low / total) * 100;

  return (
    <div className={styles.meter}>
      <div className={styles.meterBar} role="img" aria-label="AI confidence distribution">
        <span className={styles.meterHigh} style={{ width: `${pctHigh}%` }} />
        <span className={styles.meterMed} style={{ width: `${pctMed}%` }} />
        <span className={styles.meterLow} style={{ width: `${pctLow}%` }} />
      </div>
      <div className={styles.meterLabels}>
        <span>High {high}</span>
        <span>Medium {medium}</span>
        <span>Low {low}</span>
      </div>
    </div>
  );
}

function CareTimeline({ dates }: { dates: string[] }) {
  if (dates.length === 0) return null;
  const sorted = [...dates].sort();
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const span = Math.max(new Date(max).getTime() - new Date(min).getTime(), 1);

  return (
    <div className={styles.timeline}>
      <div className={styles.timelineTrack}>
        {sorted.map((d) => {
          const t = new Date(d).getTime();
          const left = ((t - new Date(min).getTime()) / span) * 100;
          return (
            <span
              key={d}
              className={styles.timelineDot}
              style={{ left: `${Math.min(96, Math.max(2, left))}%` }}
              title={d}
            />
          );
        })}
      </div>
      <div className={styles.timelineDates}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export function ReportVisualDashboard({ result }: ReportVisualDashboardProps) {
  const data = useMemo(() => {
    const segments: Segment[] = [
      { label: 'Vaccines', value: result.vaccinations.length, color: COLORS.vaccine },
      { label: 'Medications', value: result.medications.length, color: COLORS.med },
      { label: 'Findings', value: result.diagnoses.length, color: COLORS.dx },
      { label: 'Follow-ups', value: result.followUpDates.length, color: COLORS.follow },
      { label: 'Reminders', value: result.reminderDates.length, color: COLORS.remind },
    ].filter((s) => s.value > 0);

    const total = segments.reduce((n, s) => n + s.value, 0);
    const allItems = [
      ...result.vaccinations,
      ...result.medications,
      ...result.diagnoses,
      ...result.followUpDates,
      ...result.reminderDates,
    ];
    const confidence = { high: 0, medium: 0, low: 0 };
    for (const item of allItems) {
      confidence[item.confidence] += 1;
    }

    const dates = [
      ...result.vaccinations.map((v) => v.nextDueDate ?? v.dateRecorded),
      ...result.medications.map((m) => m.endDate ?? m.dateRecorded),
      ...result.followUpDates.map((f) => f.followUpDate),
      ...result.reminderDates.map((r) => r.dueDate),
    ].filter((d): d is string => Boolean(d?.trim()));

    const report = resolveDetailedReport(result);
    const maxBar = Math.max(...segments.map((s) => s.value), 1);

    return { segments, total, confidence, dates, report, maxBar };
  }, [result]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.panel}>
        <h4 className={styles.panelTitle}>Care mix</h4>
        <DonutChart segments={data.segments} total={data.total} />
      </div>

      <div className={styles.panel}>
        <h4 className={styles.panelTitle}>Category volume</h4>
        <div className={styles.hBars}>
          {data.segments.map((seg) => (
            <div key={seg.label} className={styles.hBarRow}>
              <span className={styles.hBarLabel}>{seg.label}</span>
              <div className={styles.hBarTrack}>
                <div
                  className={styles.hBarFill}
                  style={{
                    width: `${(seg.value / data.maxBar) * 100}%`,
                    background: seg.color,
                  }}
                />
              </div>
              <span className={styles.hBarVal}>{seg.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.panel}>
        <h4 className={styles.panelTitle}>Extraction confidence</h4>
        <ConfidenceMeter {...data.confidence} />
      </div>

      {data.dates.length > 0 && (
        <div className={`${styles.panel} ${styles.panelWide}`}>
          <h4 className={styles.panelTitle}>Dates on this document</h4>
          <CareTimeline dates={data.dates} />
        </div>
      )}

      <div className={`${styles.panel} ${styles.panelWide} ${styles.panelHighlights}`}>
        <h4 className={styles.panelTitle}>Key highlights</h4>
        <ul className={styles.highlightGrid}>
          {data.report.keyFindings.slice(0, 6).map((f, i) => (
            <li key={i} className={styles.highlightCard}>
              <span className={styles.highlightNum}>{i + 1}</span>
              <p>{f}</p>
            </li>
          ))}
          {data.report.keyFindings.length === 0 && (
            <li className={styles.highlightCard}>
              <p>{result.documentSummary}</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
