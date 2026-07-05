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
import { usePets } from '@/pets';
import {
  getSymptomLogService,
  type CreateSymptomLogInput,
  type ISymptomLogService,
  type SymptomLog,
} from '@/services/symptomLog';

type SymptomLogContextValue = {
  logs: SymptomLog[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  createLog: (input: Omit<CreateSymptomLogInput, 'petId'>) => Promise<SymptomLog>;
};

const SymptomLogContext = createContext<SymptomLogContextValue | null>(null);

type SymptomLogProviderProps = {
  children: ReactNode;
  service?: ISymptomLogService;
};

export function SymptomLogProvider({
  children,
  service = getSymptomLogService(),
}: SymptomLogProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const { activePet } = usePets();
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id || !activePet?.id) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const list = await service.getLogsByPet(user.id, activePet.id);
      setLogs(list);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [service, user?.id, activePet?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id && activePet?.id) {
      void refresh();
    } else {
      setLogs([]);
    }
  }, [isAuthenticated, user?.id, activePet?.id, refresh]);

  const createLog = useCallback(
    async (input: Omit<CreateSymptomLogInput, 'petId'>) => {
      if (!user?.id || !activePet?.id) {
        throw new Error('Sign in and select a pet to log symptoms.');
      }

      const saved = await service.createLog(user.id, {
        petId: activePet.id,
        ...input,
      });
      await refresh();
      return saved;
    },
    [user?.id, activePet?.id, service, refresh],
  );

  const value = useMemo(
    () => ({
      logs,
      isLoading,
      refresh,
      createLog,
    }),
    [logs, isLoading, refresh, createLog],
  );

  return <SymptomLogContext.Provider value={value}>{children}</SymptomLogContext.Provider>;
}

export function useSymptomLogs(): SymptomLogContextValue {
  const context = useContext(SymptomLogContext);
  if (!context) {
    throw new Error('useSymptomLogs must be used within SymptomLogProvider');
  }
  return context;
}
