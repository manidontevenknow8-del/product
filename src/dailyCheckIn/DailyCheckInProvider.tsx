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
import { appendActivityLogEntry } from '@/services/activity/activityLogService';
import {
  computeCheckInStreak,
  getDailyCheckInService,
  summarizeCheckInWeek,
  todayDateKey,
} from '@/services/dailyCheckIn';
import type { IDailyCheckInService } from '@/services/dailyCheckIn/dailyCheckInTypes';
import type { DailyCheckIn, DailyCheckInWeekSummary, UpsertDailyCheckInInput } from '@/types/dailyCheckIn';

type DailyCheckInContextValue = {
  checkIns: DailyCheckIn[];
  todayCheckIn: DailyCheckIn | null;
  streak: number;
  weekSummary: DailyCheckInWeekSummary;
  isLoading: boolean;
  refresh: () => Promise<void>;
  saveCheckIn: (input: Omit<UpsertDailyCheckInInput, 'petId' | 'checkInDate'>) => Promise<DailyCheckIn>;
};

const DailyCheckInContext = createContext<DailyCheckInContextValue | null>(null);

type DailyCheckInProviderProps = {
  children: ReactNode;
  service?: IDailyCheckInService;
};

export function DailyCheckInProvider({
  children,
  service = getDailyCheckInService(),
}: DailyCheckInProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const { activePet } = usePets();
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id || !activePet?.id) {
      setCheckIns([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const list = await service.getCheckInsByPet(user.id, activePet.id);
      setCheckIns(list);
    } catch {
      setCheckIns([]);
    } finally {
      setIsLoading(false);
    }
  }, [service, user?.id, activePet?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id && activePet?.id) {
      void refresh();
    } else {
      setCheckIns([]);
    }
  }, [isAuthenticated, user?.id, activePet?.id, refresh]);

  const saveCheckIn = useCallback(
    async (input: Omit<UpsertDailyCheckInInput, 'petId' | 'checkInDate'>) => {
      if (!user?.id || !activePet?.id) {
        throw new Error('Sign in and select a pet to log a check-in.');
      }

      const dateKey = todayDateKey();
      const hadToday = checkIns.some((c) => c.checkInDate === dateKey);
      const saved = await service.upsertCheckIn(user.id, {
        petId: activePet.id,
        checkInDate: dateKey,
        ...input,
      });

      await refresh();

      if (!hadToday) {
        appendActivityLogEntry({
          petId: activePet.id,
          type: 'note',
          title: 'Daily check-in logged',
          description: `${saved.feeding}${saved.walkDistanceKm != null ? ` · ${saved.walkDistanceKm} km walk` : ''}`,
        });
        eventTracker.track('daily_check_in_logged', { petId: activePet.id });
      }

      return saved;
    },
    [user?.id, activePet?.id, checkIns, service, refresh],
  );

  const todayKey = todayDateKey();
  const todayCheckIn = checkIns.find((c) => c.checkInDate === todayKey) ?? null;
  const streak = useMemo(() => computeCheckInStreak(checkIns, todayKey), [checkIns, todayKey]);
  const weekSummary = useMemo(() => summarizeCheckInWeek(checkIns), [checkIns]);

  const value = useMemo(
    () => ({
      checkIns,
      todayCheckIn,
      streak,
      weekSummary,
      isLoading,
      refresh,
      saveCheckIn,
    }),
    [checkIns, todayCheckIn, streak, weekSummary, isLoading, refresh, saveCheckIn],
  );

  return <DailyCheckInContext.Provider value={value}>{children}</DailyCheckInContext.Provider>;
}

export function useDailyCheckIn(): DailyCheckInContextValue {
  const ctx = useContext(DailyCheckInContext);
  if (!ctx) throw new Error('useDailyCheckIn must be used within DailyCheckInProvider');
  return ctx;
}
