import type { CreateReminderInput, Reminder } from '@/types/reminder';

const now = new Date().toISOString();
const today = new Date();

function daysFromNow(days: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Seed reminders for demo - keyed per user in service */
export function getSeedReminders(userId: string): Reminder[] {
  return [
    {
      id: 'rem-1',
      userId,
      petId: '1',
      petName: 'Luna',
      title: 'Flea prevention due',
      category: 'medication',
      dueDate: daysFromNow(3),
      repeatFrequency: 'monthly',
      notes: 'Topical treatment - apply between shoulder blades.',
      priority: 'high',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rem-2',
      userId,
      petId: '1',
      petName: 'Luna',
      title: 'Annual vaccination booster',
      category: 'vaccinations',
      dueDate: daysFromNow(14),
      repeatFrequency: 'yearly',
      priority: 'medium',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rem-3',
      userId,
      petId: '1',
      petName: 'Luna',
      title: 'Grooming appointment',
      category: 'grooming',
      dueDate: daysFromNow(-2),
      repeatFrequency: 'none',
      priority: 'low',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rem-4',
      userId,
      petId: '1',
      petName: 'Luna',
      title: 'Deworming tablet',
      category: 'deworming',
      dueDate: daysFromNow(21),
      repeatFrequency: 'quarterly',
      priority: 'medium',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rem-5',
      userId,
      petId: '1',
      petName: 'Luna',
      title: 'Vet wellness check',
      category: 'vet_visits',
      dueDate: daysFromNow(45),
      repeatFrequency: 'yearly',
      priority: 'medium',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rem-6',
      userId,
      petId: '1',
      petName: 'Luna',
      title: 'Premium kibble refill',
      category: 'food_refill',
      dueDate: daysFromNow(-5),
      repeatFrequency: 'monthly',
      priority: 'low',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rem-7',
      userId,
      petId: '1',
      petName: 'Luna',
      title: 'Pet insurance renewal',
      category: 'insurance_renewal',
      dueDate: daysFromNow(60),
      repeatFrequency: 'yearly',
      priority: 'low',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rem-8',
      userId,
      petId: '1',
      petName: 'Luna',
      title: 'Heartworm prevention',
      category: 'medication',
      dueDate: daysFromNow(0),
      repeatFrequency: 'monthly',
      priority: 'high',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export const defaultCreateReminderInput = (
  petId = '1',
  petName = 'Luna',
): CreateReminderInput => ({
  petId,
  petName,
  title: '',
  category: 'custom',
  dueDate: daysFromNow(7),
  repeatFrequency: 'none',
  notes: '',
  priority: 'medium',
});
