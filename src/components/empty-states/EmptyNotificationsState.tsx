import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { EmptyStateFrame } from './EmptyStateFrame';
import { ROUTES } from '@/routes/paths';

type EmptyNotificationsStateProps = {
  compact?: boolean;
};

export function EmptyNotificationsState({ compact = false }: EmptyNotificationsStateProps) {
  return (
    <EmptyStateFrame
      variant="notifications"
      title="Nothing new right now"
      description="When reminders, passport updates, or shared care activity happen, they will appear here - gently, without overwhelm."
      hint="You can adjust what you receive anytime"
      compact={compact}
      action={
        <Link to={ROUTES.SETTINGS}>
          <Button variant="secondary" size="sm">
            Notification preferences
          </Button>
        </Link>
      }
    />
  );
}
