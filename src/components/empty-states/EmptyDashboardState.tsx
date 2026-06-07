import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { EmptyStateFrame } from './EmptyStateFrame';
import { ROUTES } from '@/routes/paths';

export function EmptyDashboardState() {
  return (
    <EmptyStateFrame
      variant="dashboard"
      title="No pets added yet"
      description="Add your first pet to unlock reminders, health records, and your personalized care dashboard."
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
