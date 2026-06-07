import { AppLayout } from '@/layouts/AppLayout';
import { PageContainer, SectionHeader } from '@/components/ui';
import { BetaReleaseCandidateReport } from '@/components/launch-audit';

export function BetaReleasePage() {
  return (
    <AppLayout>
      <PageContainer size="lg">
        <SectionHeader
          title="Beta release candidate"
          subtitle="Full production audit — routing, components, accessibility, mobile, SEO, and analytics."
        />
        <BetaReleaseCandidateReport />
      </PageContainer>
    </AppLayout>
  );
}
