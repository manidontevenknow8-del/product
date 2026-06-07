import { useMemo } from 'react';
import type { VetBillExtractionResult } from '@/services/vetBillDecoder';
import { resolveDetailedReport } from '@/services/vetBillDecoder';
import styles from './ReportInsightsCharts.module.css';

type ReportInsightsChartsProps = {
  result: VetBillExtractionResult;
};

type BarDatum = { label: string; value: number; tone: string };

function buildData(result: VetBillExtractionResult): {
  bars: BarDatum[];
  confidence: { high: number; medium: number; low: number };
  findingCount: number;
} {
  const bars: BarDatum[] = [
    { label: 'Vaccines', value: result.vaccinations.length, tone: 'vaccine' },
    { label: 'Meds', value: result.medications.length, tone: 'med' },
    { label: 'Findings', value: result.diagnoses.length, tone: 'dx' },
    { label: 'Follow-ups', value: result.followUpDates.length, tone: 'follow' },
    { label: 'Reminders', value: result.reminderDates.length, tone: 'remind' },
  ].filter((b) => b.value > 0);

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

  const report = resolveDetailedReport(result);
  return {
    bars: bars.length > 0 ? bars : [{ label: 'Items', value: 1, tone: 'follow' }],
    confidence,
    findingCount: report.keyFindings.length,
  };
}

export function ReportInsightsCharts({ result }: ReportInsightsChartsProps) {
  const data = useMemo(() => buildData(result), [result]);
  const maxBar = Math.max(...data.bars.map((b) => b.value), 1);
  const confTotal = data.confidence.high + data.confidence.medium + data.confidence.low || 1;

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <h4 className={styles.panelTitle}>Items detected</h4>
        <div className={styles.barChart} role="img" aria-label="Counts of detected care items by category">
          {data.bars.map((bar) => (
            <div key={bar.label} className={styles.barCol}>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${styles[`barFill_${bar.tone}`]}`}
                  style={{ height: `${(bar.value / maxBar) * 100}%` }}
                />
              </div>
              <span className={styles.barValue}>{bar.value}</span>
              <span className={styles.barLabel}>{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.panel}>
        <h4 className={styles.panelTitle}>AI confidence</h4>
        <div className={styles.donutWrap}>
          <svg className={styles.donut} viewBox="0 0 36 36" aria-hidden>
            <circle className={styles.donutBg} cx="18" cy="18" r="15.9" />
            {(() => {
              let offset = 25;
              const segments = [
                { n: data.confidence.high, class: styles.donutHigh },
                { n: data.confidence.medium, class: styles.donutMed },
                { n: data.confidence.low, class: styles.donutLow },
              ];
              return segments.map((seg, i) => {
                const pct = (seg.n / confTotal) * 100;
                const el = (
                  <circle
                    key={i}
                    className={seg.class}
                    cx="18"
                    cy="18"
                    r="15.9"
                    strokeDasharray={`${pct} ${100 - pct}`}
                    strokeDashoffset={String(offset)}
                  />
                );
                offset -= pct;
                return el;
              });
            })()}
          </svg>
          <div className={styles.donutLegend}>
            <span><i className={styles.dotHigh} /> High {data.confidence.high}</span>
            <span><i className={styles.dotMed} /> Med {data.confidence.medium}</span>
            <span><i className={styles.dotLow} /> Low {data.confidence.low}</span>
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <h4 className={styles.panelTitle}>Report highlights</h4>
        <div className={styles.sparkRow}>
          <div className={styles.sparkStat}>
            <span className={styles.sparkNum}>{data.findingCount}</span>
            <span className={styles.sparkLabel}>Key findings</span>
          </div>
          <div className={styles.sparkStat}>
            <span className={styles.sparkNum}>
              {data.bars.reduce((s, b) => s + b.value, 0)}
            </span>
            <span className={styles.sparkLabel}>Suggestions</span>
          </div>
        </div>
        <svg className={styles.sparkline} viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden>
          <polyline
            className={styles.sparkLine}
            points={data.bars
              .map((b, i) => {
                const x = (i / Math.max(data.bars.length - 1, 1)) * 120;
                const y = 28 - (b.value / maxBar) * 24;
                return `${x},${y}`;
              })
              .join(' ')}
          />
        </svg>
      </div>
    </div>
  );
}
