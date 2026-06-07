import type {
  DashboardReminder,
  DashboardInsight,
  ActivityItem,
  PetCareScore,
} from '@/types/dashboard';

export const mockNextReminder: DashboardReminder = {
  id: '1',
  title: 'Flea prevention due',
  dueDate: '2026-06-03',
  dueLabel: 'In 3 days',
  category: 'medication',
};

export const mockInsight: DashboardInsight = {
  id: '1',
  title: 'Coat health trending well',
  message:
    'Luna\'s last two skin scans show consistent coat density. No irritation patterns detected — keep up the current grooming routine.',
  type: 'observation',
};

export const mockPetCareScore: PetCareScore = {
  score: 94,
  label: 'Excellent',
  summary: 'Records are current, scans are up to date, and no overdue tasks.',
};

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
    description: 'Increased activity levels — monitoring for 2 weeks.',
    timestamp: 'Apr 20',
  },
  {
    id: '4',
    type: 'update',
    title: 'Vet visit recorded',
    description: 'Annual wellness check — all vitals normal.',
    timestamp: 'Apr 28',
  },
];

export const mockPetStatus = {
  label: 'All clear',
  variant: 'success' as const,
};
