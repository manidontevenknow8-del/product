import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { PAGE_IMG } from '@/data/pageImages';
import { EmptyStateFrame } from './EmptyStateFrame';
import { ROUTES } from '@/routes/paths';

export function EmptyPetProfileState() {
  return (
    <EmptyStateFrame
      variant="dashboard"
      image={PAGE_IMG.app.profile}
      imageAlt="Pet profile and health records"
      title="No pet profile yet"
      description="Add your first pet to unlock their health vault, care records, and personalized insights."
      hint="It only takes a minute to get started"
      action={
        <Link to={ROUTES.ONBOARDING}>
          <Button variant="primary" size="md">
            Add your first pet
          </Button>
        </Link>
      }
    />
  );
}
