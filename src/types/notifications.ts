export type NotificationCategory =
  | 'reminder'
  | 'reminder_completed'
  | 'passport'
  | 'shared_pet'
  | 'product';

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  petName?: string;
  actionPath?: string;
};

export type NotificationGroup = {
  dateLabel: string;
  dateKey: string;
  items: AppNotification[];
};
