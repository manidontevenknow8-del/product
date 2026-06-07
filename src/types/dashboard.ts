export type DashboardReminder = {
  id: string;
  title: string;
  dueDate: string;
  dueLabel: string;
  category: 'medication' | 'appointment' | 'scan' | 'other';
};

export type DashboardInsight = {
  id: string;
  title: string;
  message: string;
  type: 'observation' | 'alert' | 'tip';
};

export type ActivityItem = {
  id: string;
  type: 'scan' | 'reminder' | 'note' | 'update' | 'automation';
  title: string;
  description: string;
  timestamp: string;
};

export type PetCareScore = {
  score: number;
  label: string;
  summary: string;
};
