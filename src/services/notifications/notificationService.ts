import type { AppNotification } from '@/types/notifications';
import { buildMockNotifications } from '@/data/notificationData';

const STORAGE_KEY = 'petclues_notifications';

/**
 * Notification service — swap for Supabase + push/email delivery.
 *
 * Backend requirements:
 * - Real-time notification delivery (push, email, in-app)
 * - Notification preferences gate per channel
 * - Read/unread state sync across devices
 * - Grouped history with pagination and search
 * - Event triggers from reminders, passport, family sharing, product
 */
export interface INotificationService {
  getNotifications(userId: string): Promise<AppNotification[]>;
  markAsRead(userId: string, notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}

export const mockNotificationService: INotificationService = {
  async getNotifications(userId) {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) return JSON.parse(stored) as AppNotification[];
    return buildMockNotifications();
  },

  async markAsRead(userId, notificationId) {
    const notifications = await this.getNotifications(userId);
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n,
    );
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
  },

  async markAllAsRead(userId) {
    const notifications = await this.getNotifications(userId);
    const updated = notifications.map((n) => ({ ...n, read: true }));
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
  },
};
