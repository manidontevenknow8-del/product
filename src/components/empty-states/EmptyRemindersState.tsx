import { Button } from '@/components/ui';
import { PAGE_IMG } from '@/data/pageImages';
import { EmptyStateFrame } from './EmptyStateFrame';

type EmptyRemindersStateProps = {
  view?: 'list' | 'upcoming' | 'overdue' | 'calendar';
  onCreate?: () => void;
  compact?: boolean;
};

const messages = {
  list: {
    title: 'No reminders yet',
    description:
      'Create your first reminder to stay on top of vaccinations, vet visits, and daily care.',
  },
  upcoming: {
    title: 'All caught up',
    description: 'No upcoming reminders. You are staying ahead of your pet\'s care schedule.',
  },
  overdue: {
    title: 'Nothing overdue',
    description: 'Great work - every reminder is on track.',
  },
  calendar: {
    title: 'Your calendar is clear',
    description: 'Add reminders to see them plotted across the month.',
  },
};

export function EmptyRemindersState({
  view = 'list',
  onCreate,
  compact = false,
}: EmptyRemindersStateProps) {
  const { title, description } = messages[view];

  return (
    <EmptyStateFrame
      variant="reminders"
      image={PAGE_IMG.app.reminders}
      imageAlt="Illustration of pet care reminders"
      title={title}
      description={description}
      compact={compact}
      action={
        onCreate && (view === 'list' || compact) ? (
          <Button variant="primary" size="md" onClick={onCreate}>
            Create reminder
          </Button>
        ) : undefined
      }
    />
  );
}
