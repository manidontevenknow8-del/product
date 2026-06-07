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
  getSettingsService,
  type ISettingsService,
} from '@/services/settings/settingsService';
import type { UserSettings } from '@/types/settings';

type SettingsContextValue = {
  settings: UserSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  updateSettings: (settings: UserSettings) => Promise<void>;
  refresh: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

type SettingsProviderProps = {
  children: ReactNode;
  settingsService?: ISettingsService;
};

export function SettingsProvider({
  children,
  settingsService = getSettingsService(),
}: SettingsProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setSettings(null);
      return;
    }
    setIsLoading(true);
    const data = await settingsService.getSettings(user.id, user.name, user.email);
    setSettings(data);
    setIsLoading(false);
  }, [user?.id, user?.name, user?.email, settingsService]);

  const updateSettings = useCallback(
    async (next: UserSettings) => {
      if (!user?.id) return;
      setIsSaving(true);
      const saved = await settingsService.updateSettings(user.id, next);
      setSettings(saved);
      setIsSaving(false);
    },
    [user?.id, settingsService],
  );

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      void refresh();
    } else {
      setSettings(null);
    }
  }, [isAuthenticated, user?.id, refresh]);

  const value = useMemo(
    () => ({ settings, isLoading, isSaving, updateSettings, refresh }),
    [settings, isLoading, isSaving, updateSettings, refresh],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
