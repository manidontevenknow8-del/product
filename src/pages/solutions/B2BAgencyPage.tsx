import { AGENCY_SOLUTION } from '@/data/b2bSolutions';
import { B2BSolutionView } from './B2BSolutionPage';

/** High-ticket IPATA relocation agency portal - `/for-agencies`. */
export function B2BAgencyPage() {
  return <B2BSolutionView solution={AGENCY_SOLUTION} />;
}
