import { pdf } from '@react-pdf/renderer';
import { HealthDossierTemplate } from '@/components/pdf/HealthDossierTemplate';
import type { HealthDossierData } from '@/services/healthDossier/buildHealthDossierData';
import { buildDossierFileName } from '@/services/healthDossier/buildHealthDossierData';

/**
 * Render the Official Health Dossier to a Blob and trigger a browser download.
 */
export async function downloadHealthDossierPdf(data: HealthDossierData): Promise<string> {
  const blob = await pdf(<HealthDossierTemplate data={data} />).toBlob();
  const fileName = buildDossierFileName(data.petName, data.yearStamp);

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return fileName;
}
