import type { Metric } from 'web-vitals';
import { capturePostHogEvent, isPostHogEnabled } from '@/analytics/posthog';

type VitalsReporter = (metric: Metric) => void;

function sendToAnalytics(metric: Metric): void {
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
  }

  if (isPostHogEnabled()) {
    capturePostHogEvent('web_vital', {
      vital_name: metric.name,
      vital_value: metric.value,
      vital_rating: metric.rating,
      vital_delta: metric.delta,
      vital_id: metric.id,
      vital_navigationType: metric.navigationType,
    });
  }
}

/**
 * Lazily imports web-vitals and starts reporting LCP, CLS, and INP.
 * Safe to call even if the web-vitals package is unavailable at runtime.
 */
export function initWebVitals(): void {
  void import('web-vitals').then(({ onLCP, onCLS, onINP }) => {
    const report: VitalsReporter = sendToAnalytics;
    onLCP(report);
    onCLS(report);
    onINP(report);
  }).catch(() => {
    if (import.meta.env.DEV) {
      console.warn('[Web Vitals] web-vitals package not available');
    }
  });
}
