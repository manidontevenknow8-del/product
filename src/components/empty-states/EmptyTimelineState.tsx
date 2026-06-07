import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { PAGE_IMG } from '@/data/pageImages';
import { EmptyStateFrame } from './EmptyStateFrame';
import { ROUTES } from '@/routes/paths';

type EmptyTimelineStateProps = {
  petName?: string;
  filtered?: boolean;
};

export function EmptyTimelineState({
  petName = 'your pet',
  filtered = false,
}: EmptyTimelineStateProps) {
  if (filtered) {
    return (
      <EmptyStateFrame
        variant="timeline"
        title="No moments in this view"
        description="Try a different filter to explore more of the memory feed."
        compact
      />
    );
  }

  return (
    <EmptyStateFrame
      variant="timeline"
      image={PAGE_IMG.app.timeline}
      imageAlt="Illustration of a pet life timeline"
      title="Every pet has a story."
      description={`${petName}'s story is waiting for its first chapter. Add a meaningful moment and start preserving memories that matter.`}
      hint="Upload a document or add a moment to get started"
      action={
        <Link to={ROUTES.SCAN}>
          <Button variant="primary" size="md">
            Upload first document
          </Button>
        </Link>
      }
    />
  );
}
