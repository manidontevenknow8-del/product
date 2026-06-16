import type { ActivityItem } from '@/types/dashboard';

export const mockRecentActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'scan',
    title: 'Coat & Skin Analysis completed',
    description: 'Healthy coat density. No irritation markers.',
    timestamp: 'May 15',
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Flea prevention marked done',
    description: 'Monthly topical treatment logged.',
    timestamp: 'May 1',
  },
  {
    id: '3',
    type: 'note',
    title: 'Behavioral note added',
    description: 'Increased activity levels - monitoring for 2 weeks.',
    timestamp: 'Apr 20',
  },
  {
    id: '4',
    type: 'update',
    title: 'Vet visit recorded',
    description: 'Annual wellness check - all vitals normal.',
    timestamp: 'Apr 28',
  },
];
