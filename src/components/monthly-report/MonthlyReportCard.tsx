import { forwardRef } from 'react';
import type { MonthlyPetLifeReport } from '@/types/monthlyReport';
import { MonthlyReportDocument } from './MonthlyReportDocument';

type MonthlyReportCardProps = {
  report: MonthlyPetLifeReport;
};

/** @deprecated Use MonthlyReportDocument - kept for archive compatibility */
export const MonthlyReportCard = forwardRef<HTMLDivElement, MonthlyReportCardProps>(
  function MonthlyReportCard(props, ref) {
    return <MonthlyReportDocument ref={ref} {...props} />;
  },
);
