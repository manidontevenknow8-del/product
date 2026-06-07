import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/auth/AuthProvider';
import {
  getReminderService,
  type IReminderService,
} from '@/services/reminders/reminderService';
import type {
  CreateReminderInput,
  Reminder,
  ReminderStats,
  UpdateReminderInput,
} from '@/types/reminder';
import { eventTracker } from '@/analytics/EventTracker';
import { appendActivityLogEntry } from '@/services/activity/activityLogService';
import {
  filterReminders,
  getNextReminder,
  getReminderStatus,
} from '@/utils/reminderUtils';
import type { ReminderFilters } from '@/types/reminder';

type ReminderContextValue = {
  reminders: Reminder[];
  stats: ReminderStats;
  nextReminder: Reminder | null;
  upcomingReminders: Reminder[];
  overdueReminders: Reminder[];
  isLoading: boolean;
  createReminder: (input: CreateReminderInput) => Promise<void>;
  updateReminder: (id: string, input: UpdateReminderInput) => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  rescheduleReminder: (id: string, dueDate: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  filterReminders: (filters: ReminderFilters) => Reminder[];
};

const ReminderContext = createContext<ReminderContextValue | null>(null);

type ReminderProviderProps = {
  children: ReactNode;
  reminderService?: IReminderService;
};

export function ReminderProvider({
  children,
  reminderService = getReminderService(),
}: ReminderProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setReminders([]);
      return;
    }
    setIsLoading(true);
    const list = await reminderService.list(user.id);
    setReminders(list);
    setIsLoading(false);
  }, [user?.id, reminderService]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refresh();
    } else {
      setReminders([]);
    }
  }, [isAuthenticated, user?.id, refresh]);

  const createReminder = useCallback(
    async (input: CreateReminderInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      await reminderService.create(user.id, input);
      eventTracker.track('reminder_created', { category: input.category });
      await refresh();
    },
    [user?.id, reminderService, refresh],
  );

  const updateReminder = useCallback(
    async (id: string, input: UpdateReminderInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      await reminderService.update(user.id, id, input);
      await refresh();
    },
    [user?.id, reminderService, refresh],
  );

  const completeReminder = useCallback(
    async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const reminder = reminders.find((r) => r.id === id);
      await reminderService.complete(user.id, id);
      if (reminder) {
        appendActivityLogEntry({
          petId: reminder.petId,
          type: 'reminder',
          title: reminder.title,
          description: 'Reminder marked complete.',
        });
      }
      eventTracker.track('reminder_completed', { reminderId: id });
      await refresh();
    },
    [user?.id, reminderService, reminders, refresh],
  );

  const rescheduleReminder = useCallback(
    async (id: string, dueDate: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      await reminderService.reschedule(user.id, id, dueDate);
      await refresh();
    },
    [user?.id, reminderService, refresh],
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      await reminderService.delete(user.id, id);
      await refresh();
    },
    [user?.id, reminderService, refresh],
  );

  const stats = useMemo(() => {
    let upcoming = 0;
    let overdue = 0;
    let dueToday = 0;
    let completed = 0;

    for (const reminder of reminders) {
      const status = getReminderStatus(reminder);
      if (status === 'completed') completed += 1;
      else if (status === 'overdue') overdue += 1;
      else if (status === 'due_today') dueToday += 1;
      else upcoming += 1;
    }

    return {
      total: reminders.length,
      upcoming,
      overdue,
      dueToday,
      completed,
    };
  }, [reminders]);

  const nextReminder = useMemo(() => getNextReminder(reminders), [reminders]);

  const upcomingReminders = useMemo(
    () =>
      reminders.filter((r) => {
        const status = getReminderStatus(r);
        return status === 'upcoming' || status === 'due_today';
      }),
    [reminders],
  );

  const overdueReminders = useMemo(
    () => reminders.filter((r) => getReminderStatus(r) === 'overdue'),
    [reminders],
  );

  const applyFilters = useCallback(
    (filters: ReminderFilters) => filterReminders(reminders, filters),
    [reminders],
  );

  const value = useMemo<ReminderContextValue>(
    () => ({
      reminders,
      stats,
      nextReminder,
      upcomingReminders,
      overdueReminders,
      isLoading,
      createReminder,
      updateReminder,
      completeReminder,
      rescheduleReminder,
      deleteReminder,
      refresh,
      filterReminders: applyFilters,
    }),
    [
      reminders,
      stats,
      nextReminder,
      upcomingReminders,
      overdueReminders,
      isLoading,
      createReminder,
      updateReminder,
      completeReminder,
      rescheduleReminder,
      deleteReminder,
      refresh,
      applyFilters,
    ],
  );

  return (
    <ReminderContext.Provider value={value}>{children}</ReminderContext.Provider>
  );
}

export function useReminders(): ReminderContextValue {
  const ctx = useContext(ReminderContext);
  if (!ctx) throw new Error('useReminders must be used within ReminderProvider');
  return ctx;
}
