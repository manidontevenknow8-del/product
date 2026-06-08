import { AppLayout } from '@/layouts/AppLayout';
import { PageContainer, SectionHeader } from '@/components/ui';
import { LaunchReadinessReport } from '@/components/launch-audit';

export function LaunchReadinessPage() {
  return (
    <AppLayout>
      <PageContainer size="lg">
        <SectionHeader
          title="Launch readiness"
          subtitle="V1 product audit - mobile, empty states, accessibility, and production gaps."
        />
        <LaunchReadinessReport />
      </PageContainer>
    </AppLayout>
  );
}
