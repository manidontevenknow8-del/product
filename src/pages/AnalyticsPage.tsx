import { AppLayout } from '@/layouts/AppLayout';
import { PageContainer, SectionHeader } from '@/components/ui';
import { AnalyticsDashboard } from '@/components/analytics';

export function AnalyticsPage() {
  return (
    <AppLayout>
      <PageContainer size="lg">
        <SectionHeader
          title="Analytics"
          subtitle="Internal event log for beta debugging and instrumentation verification."
        />
        <AnalyticsDashboard />
      </PageContainer>
    </AppLayout>
  );
}
