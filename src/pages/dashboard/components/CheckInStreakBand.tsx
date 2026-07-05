import { StreakModule } from '@/components/editorial';

type CheckInStreakBandProps = {
  petName: string;
};

/** @deprecated Import StreakModule from @/components/editorial */
export function CheckInStreakBand({ petName }: CheckInStreakBandProps) {
  return <StreakModule petName={petName} />;
}
