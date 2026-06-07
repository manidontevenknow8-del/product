import type { AppNotification } from '@/types/notifications';

export function buildMockNotifications(): AppNotification[] {
  const now = new Date();
  const hoursAgo = (h: number) =>
    new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
  const daysAgo = (d: number) =>
    new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'n1',
      category: 'reminder',
      title: 'Heartworm prevention due',
      message: 'Luna\'s monthly heartworm dose is due tomorrow.',
      timestamp: hoursAgo(2),
      read: false,
      petName: 'Luna',
      actionPath: '/reminders',
    },
    {
      id: 'n2',
      category: 'reminder_completed',
      title: 'Reminder completed',
      message: 'You marked Luna\'s flea treatment as done. Nice work staying on schedule.',
      timestamp: hoursAgo(5),
      read: false,
      petName: 'Luna',
    },
    {
      id: 'n3',
      category: 'passport',
      title: 'Passport updated',
      message: 'Emergency passport now includes Luna\'s latest vaccination record.',
      timestamp: hoursAgo(8),
      read: true,
      petName: 'Luna',
      actionPath: '/emergency-passport',
    },
    {
      id: 'n4',
      category: 'shared_pet',
      title: 'Sarah joined Luna\'s care circle',
      message: 'Sarah accepted your invitation and can now help manage reminders.',
      timestamp: daysAgo(1),
      read: true,
      petName: 'Luna',
      actionPath: '/family',
    },
    {
      id: 'n5',
      category: 'reminder',
      title: 'Annual wellness checkup',
      message: 'Luna\'s annual vet visit is coming up in two weeks.',
      timestamp: daysAgo(1),
      read: true,
      petName: 'Luna',
      actionPath: '/reminders',
    },
    {
      id: 'n6',
      category: 'product',
      title: 'PetCare Score is here',
      message: 'See how organized Luna\'s care is and discover gentle ways to improve.',
      timestamp: daysAgo(3),
      read: true,
      actionPath: '/pet-care-score',
    },
    {
      id: 'n7',
      category: 'passport',
      title: 'New document added',
      message: 'A vaccination certificate was added to Luna\'s health vault.',
      timestamp: daysAgo(5),
      read: true,
      petName: 'Luna',
    },
  ];
}
