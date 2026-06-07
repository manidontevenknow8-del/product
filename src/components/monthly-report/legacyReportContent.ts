import { MONTHLY_REPORT_IMG } from '@/data/monthlyReportImages';
import type {
  MonthlyPetLifeReport,
  MonthlyReportStorySection,
} from '@/types/monthlyReport';

/** Rebuild rich sections for reports saved before the visual redesign */
export function resolveStorySections(report: MonthlyPetLifeReport): MonthlyReportStorySection[] {
  if (report.storySections?.length) return report.storySections;

  return [
    {
      id: 'overview',
      title: 'Month at a glance',
      intro: report.monthLabel,
      body: report.highlights[0] ?? `${report.monthLabel} with ${report.petName}.`,
      image: MONTHLY_REPORT_IMG.overview,
      imageAlt: 'Overview',
      bullets: report.highlights,
    },
    {
      id: 'reminders',
      title: 'Routine & reminders',
      intro: 'Activity summary',
      body: `${report.remindersCompleted} reminders completed this month.`,
      image: MONTHLY_REPORT_IMG.reminders,
      imageAlt: 'Reminders',
    },
    {
      id: 'health',
      title: 'Health & wellness',
      intro: 'Records added',
      body: `${report.healthRecordsAdded} health records added.`,
      image: MONTHLY_REPORT_IMG.health,
      imageAlt: 'Health',
    },
    {
      id: 'vault',
      title: 'Document vault',
      intro: 'Uploads',
      body: `${report.documentsUploaded} documents uploaded.`,
      image: MONTHLY_REPORT_IMG.vault,
      imageAlt: 'Vault',
    },
  ];
}

export function resolveNarrativeIntro(report: MonthlyPetLifeReport): string {
  if (report.narrativeIntro) return report.narrativeIntro;
  const joined = report.highlights.join(' ');
  return joined || `${report.petName}'s monthly life report for ${report.monthLabel}.`;
}

export function resolveCareScoreNarrative(report: MonthlyPetLifeReport): string {
  if (report.careScoreNarrative) return report.careScoreNarrative;
  const { start, end, delta } = report.petCareScore;
  if (delta == null) return 'PetCare Score data was limited this month.';
  if (start != null && end != null) {
    return `Score moved from ${start} to ${end} (${delta >= 0 ? '+' : ''}${delta}).`;
  }
  return `PetCare Score change: ${delta >= 0 ? '+' : ''}${delta}.`;
}
