import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { eventTracker } from '@/analytics/EventTracker';
import { useAuth } from '@/auth/AuthProvider';
import { usePets } from '@/pets';
import { useReminders } from '@/reminders';
import {
  appendActivityLogEntry,
  logAutomationReminderCreated,
} from '@/services/activity/activityLogService';
import { runHealthRecordAutomation } from '@/services/automation/automationEngine';
import { automationRuleLabels } from '@/services/automation/automationRules';
import { getReminderService } from '@/services/reminders/reminderService';
import {
  deriveProfileHealthSummary,
  getHealthRecordService,
  type CreateHealthRecordInput,
  type HealthRecord,
  type HealthRecordType,
  type IHealthRecordService,
  type ProfileHealthSummary,
  type UpdateHealthRecordInput,
} from '@/services/healthRecords/healthRecordService';

type HealthRecordContextValue = {
  records: HealthRecord[];
  healthSummary: ProfileHealthSummary;
  isLoading: boolean;
  refreshRecords: () => Promise<void>;
  getRecordsByType: (recordType: HealthRecordType) => HealthRecord[];
  createRecord: (input: CreateHealthRecordInput) => Promise<HealthRecord>;
  updateRecord: (recordId: string, input: UpdateHealthRecordInput) => Promise<HealthRecord>;
  deleteRecord: (recordId: string) => Promise<void>;
};

const HealthRecordContext = createContext<HealthRecordContextValue | null>(null);

type HealthRecordProviderProps = {
  children: ReactNode;
  healthRecordService?: IHealthRecordService;
};

export function HealthRecordProvider({
  children,
  healthRecordService: service = getHealthRecordService(),
}: HealthRecordProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const { activePet } = usePets();
  const { reminders, refresh: refreshReminders } = useReminders();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshRecords = useCallback(async () => {
    if (!user?.id || !activePet?.id) {
      setRecords([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const list = await service.getRecordsByPet(user.id, activePet.id);
      setRecords(list);
    } catch {
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [service, user?.id, activePet?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id && activePet?.id) {
      void refreshRecords();
    } else {
      setRecords([]);
    }
  }, [isAuthenticated, user?.id, activePet?.id, refreshRecords]);

  const runAutomation = useCallback(
    async (record: HealthRecord) => {
      if (!user?.id || !activePet) return;

      const petReminders = reminders.filter((reminder) => reminder.petId === record.petId);
      const result = await runHealthRecordAutomation({
        ownerId: user.id,
        record,
        petName: activePet.name,
        reminders: petReminders,
        reminderService: getReminderService(),
      });

      if (result.action === 'created' || result.action === 'updated') {
        if (result.ruleId && result.reminderTitle && result.dueDate) {
          logAutomationReminderCreated({
            petId: record.petId,
            reminderTitle: result.reminderTitle,
            dueDate: result.dueDate,
            ruleLabel: automationRuleLabels[result.ruleId],
          });
        }

        eventTracker.track('automation_reminder_created', {
          ruleId: result.ruleId ?? 'unknown',
          action: result.action,
          healthRecordId: record.id,
          reminderId: result.reminderId ?? null,
        });

        await refreshReminders();
      }
    },
    [user?.id, activePet, reminders, refreshReminders],
  );

  const createRecord = useCallback(
    async (input: CreateHealthRecordInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      const record = await service.createRecord(user.id, input);
      setRecords((prev) =>
        [record, ...prev].sort((a, b) => b.dateRecorded.localeCompare(a.dateRecorded)),
      );
      appendActivityLogEntry({
        petId: input.petId,
        type: 'update',
        title: record.title,
        description: 'Health record added to your vault.',
      });
      eventTracker.track('health_record_created', {
        recordType: record.recordType,
        source: record.sourceDocumentId ? 'document' : 'manual',
      });
      await runAutomation(record);
      return record;
    },
    [service, user?.id, runAutomation],
  );

  const updateRecord = useCallback(
    async (recordId: string, input: UpdateHealthRecordInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      const updated = await service.updateRecord(user.id, recordId, input);
      setRecords((prev) =>
        prev
          .map((record) => (record.id === recordId ? updated : record))
          .sort((a, b) => b.dateRecorded.localeCompare(a.dateRecorded)),
      );
      await runAutomation(updated);
      return updated;
    },
    [service, user?.id, runAutomation],
  );

  const deleteRecord = useCallback(
    async (recordId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      await service.deleteRecord(user.id, recordId);
      setRecords((prev) => prev.filter((record) => record.id !== recordId));
    },
    [service, user?.id],
  );

  const getRecordsByType = useCallback(
    (recordType: HealthRecordType) =>
      records.filter((record) => record.recordType === recordType),
    [records],
  );

  const healthSummary = useMemo(() => deriveProfileHealthSummary(records), [records]);

  const value = useMemo<HealthRecordContextValue>(
    () => ({
      records,
      healthSummary,
      isLoading,
      refreshRecords,
      getRecordsByType,
      createRecord,
      updateRecord,
      deleteRecord,
    }),
    [
      records,
      healthSummary,
      isLoading,
      refreshRecords,
      getRecordsByType,
      createRecord,
      updateRecord,
      deleteRecord,
    ],
  );

  return (
    <HealthRecordContext.Provider value={value}>{children}</HealthRecordContext.Provider>
  );
}

export function useHealthRecords(): HealthRecordContextValue {
  const ctx = useContext(HealthRecordContext);
  if (!ctx) throw new Error('useHealthRecords must be used within HealthRecordProvider');
  return ctx;
}
