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
  mockNotificationService,
  type INotificationService,
} from '@/services/notifications/notificationService';
import type { AppNotification } from '@/types/notifications';
import { groupNotificationsByDate } from '@/utils/notificationUtils';
import type { NotificationGroup } from '@/types/notifications';

type NotificationContextValue = {
  notifications: AppNotification[];
  groups: NotificationGroup[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

type NotificationProviderProps = {
  children: ReactNode;
  notificationService?: INotificationService;
};

export function NotificationProvider({
  children,
  notificationService = mockNotificationService,
}: NotificationProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }
    setIsLoading(true);
    const data = await notificationService.getNotifications(user.id);
    setNotifications(data);
    setIsLoading(false);
  }, [user?.id, notificationService]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      await notificationService.markAsRead(user.id, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
    [user?.id, notificationService],
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    await notificationService.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [user?.id, notificationService]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      void refresh();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, user?.id, refresh]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const groups = useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      groups,
      unreadCount,
      isLoading,
      markAsRead,
      markAllAsRead,
      refresh,
    }),
    [notifications, groups, unreadCount, isLoading, markAsRead, markAllAsRead, refresh],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
