import type { Pet, TimelineEvent, ScanResult, EmergencyContact } from '@/types';

export const mockPet: Pet = {
  id: '1',
  name: 'Luna',
  species: 'dog',
  breed: 'Golden Retriever',
  age: '4 years',
  weight: '28 kg',
  avatarInitials: 'LU',
};

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    date: '2026-05-28',
    title: 'Annual wellness check',
    description: 'Routine examination — all vitals normal.',
    category: 'vet',
  },
  {
    id: '2',
    date: '2026-05-15',
    title: 'Skin scan completed',
    description: 'No abnormalities detected in coat analysis.',
    category: 'scan',
  },
  {
    id: '3',
    date: '2026-05-01',
    title: 'Flea prevention administered',
    description: 'Monthly topical treatment applied.',
    category: 'medication',
  },
  {
    id: '4',
    date: '2026-04-20',
    title: 'Behavioral note',
    description: 'Increased activity levels noted — monitor for 2 weeks.',
    category: 'note',
  },
];

export const mockScans: ScanResult[] = [
  {
    id: '1',
    date: '2026-05-15',
    type: 'Coat & Skin Analysis',
    status: 'completed',
    summary: 'Healthy coat density. No irritation markers.',
  },
  {
    id: '2',
    date: '2026-04-02',
    type: 'Eye Health Scan',
    status: 'completed',
    summary: 'Clear corneas. Normal pupil response.',
  },
];

export const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    role: 'Primary Veterinarian',
    phone: '+1 (555) 234-8901',
  },
  {
    id: '2',
    name: 'City Pet Emergency Clinic',
    role: '24/7 Emergency',
    phone: '+1 (555) 987-6543',
  },
];

export const mockDashboardStats = {
  lastScan: '12 days ago',
  nextAppointment: 'Jun 15, 2026',
  healthScore: 94,
  activeAlerts: 0,
};
