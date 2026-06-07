export type ReminderCategory =
  | 'vaccinations'
  | 'deworming'
  | 'grooming'
  | 'vet_visits'
  | 'medication'
  | 'food_refill'
  | 'insurance_renewal'
  | 'custom';

export type RepeatFrequency =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

export type ReminderPriority = 'low' | 'medium' | 'high';

export type ReminderStatus = 'upcoming' | 'due_today' | 'overdue' | 'completed';

export type ReminderView = 'list' | 'calendar' | 'upcoming' | 'overdue';

export type Reminder = {
  id: string;
  userId: string;
  petId: string;
  petName: string;
  title: string;
  category: ReminderCategory;
  dueDate: string;
  repeatFrequency: RepeatFrequency;
  notes?: string;
  priority: ReminderPriority;
  completedAt?: string;
  sourceHealthRecordId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateReminderInput = {
  petId: string;
  petName: string;
  title: string;
  category: ReminderCategory;
  dueDate: string;
  repeatFrequency: RepeatFrequency;
  notes?: string;
  priority: ReminderPriority;
  sourceHealthRecordId?: string;
};

export type UpdateReminderInput = Partial<CreateReminderInput>;

export type ReminderStats = {
  total: number;
  upcoming: number;
  overdue: number;
  dueToday: number;
  completed: number;
};

export type ReminderFilters = {
  category: ReminderCategory | 'all';
  petId: string | 'all';
  view: ReminderView;
};

export const REMINDER_CATEGORIES: ReminderCategory[] = [
  'vaccinations',
  'deworming',
  'grooming',
  'vet_visits',
  'medication',
  'food_refill',
  'insurance_renewal',
  'custom',
];

export const categoryLabels: Record<ReminderCategory, string> = {
  vaccinations: 'Vaccinations',
  deworming: 'Deworming',
  grooming: 'Grooming',
  vet_visits: 'Vet Visits',
  medication: 'Medication',
  food_refill: 'Food Refill',
  insurance_renewal: 'Insurance Renewal',
  custom: 'Custom Reminder',
};

export const repeatLabels: Record<RepeatFrequency, string> = {
  none: 'Does not repeat',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Every 3 months',
  yearly: 'Yearly',
};

export const priorityLabels: Record<ReminderPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const viewLabels: Record<ReminderView, string> = {
  list: 'All',
  calendar: 'Calendar',
  upcoming: 'Upcoming',
  overdue: 'Overdue',
};
