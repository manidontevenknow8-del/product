import { BREEDER_SOLUTION } from '@/data/b2bSolutions';
import { B2BSolutionView } from './B2BSolutionPage';

/** Luxury / high-end breeder portal - `/for-breeders`. */
export function B2BBreederPage() {
  return <B2BSolutionView solution={BREEDER_SOLUTION} />;
}
