import { useAuth } from '@/auth/AuthProvider';
import { useHealthRecords } from '@/healthRecords';
import {
  canCreateHealthRecord,
  FREE_HEALTH_RECORD_LIMIT,
} from '@/subscription/featureGates';

export function useHealthRecordLimit() {
  const { user } = useAuth();
  const { records } = useHealthRecords();

  const accessInput = {
    subscriptionStatus: user?.subscriptionStatus,
    subscriptionTier: user?.subscriptionTier ?? 'free',
  };

  const recordCount = records.length;
  const canAdd = canCreateHealthRecord(accessInput, recordCount);

  return {
    recordCount,
    limit: FREE_HEALTH_RECORD_LIMIT,
    canAdd,
    atLimit: !canAdd,
  };
}
