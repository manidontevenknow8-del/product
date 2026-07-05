import { useMemo } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useDailyCheckIn } from '@/dailyCheckIn';
import { useHousehold } from '@/household';
import { buildHouseholdCheckInActivities } from '@/services/dailyCheckIn/formatHouseholdCheckInActivity';
import styles from '../../DashboardPage.module.css';

type HouseholdCheckInActivityStripProps = {
  petName: string;
};

export function HouseholdCheckInActivityStrip({ petName }: HouseholdCheckInActivityStripProps) {
  const { user } = useAuth();
  const { members, isLoading: householdLoading } = useHousehold();
  const { checkIns, isLoading: checkInsLoading } = useDailyCheckIn();

  const activities = useMemo(() => {
    if (!user?.id || members.length <= 1) return [];
    return buildHouseholdCheckInActivities({
      checkIns,
      petName,
      members,
      currentUserId: user.id,
    });
  }, [checkIns, members, petName, user?.id]);

  if (householdLoading || checkInsLoading) return null;
  if (members.length <= 1 || activities.length === 0) return null;

  return (
    <aside className={styles.householdActivityStrip} aria-label="Recent household check-in activity">
      <p className={styles.householdActivityText}>{activities.join(' · ')}</p>
    </aside>
  );
}
