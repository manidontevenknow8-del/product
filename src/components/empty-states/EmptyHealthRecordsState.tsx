import { Button } from '@/components/ui';
import { PAGE_IMG } from '@/data/pageImages';
import { EmptyStateFrame } from './EmptyStateFrame';

type EmptyHealthRecordsStateProps = {
  onAdd?: () => void;
  compact?: boolean;
};

export function EmptyHealthRecordsState({
  onAdd,
  compact = false,
}: EmptyHealthRecordsStateProps) {
  return (
    <EmptyStateFrame
      variant="documents"
      image={PAGE_IMG.profile.health}
      imageAlt="Illustration of pet health records"
      title="No health records yet"
      description="Track vaccinations, medications, diagnoses, and wellness visits in one place."
      compact={compact}
      action={
        onAdd ? (
          <Button variant="primary" size="md" onClick={onAdd}>
            Add record
          </Button>
        ) : undefined
      }
    />
  );
}
