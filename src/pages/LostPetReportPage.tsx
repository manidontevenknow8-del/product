import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { PageContainer, Button, Badge } from '@/components/ui';
import { ReportSightingModal } from '@/components/lost-pet/community';
import { ContactOwnerCard } from '@/components/lost-pet/sharing';
import { LOST_PET_EMERGENCY_CONTACTS } from '@/data/lostPetData';
import { mockLostPetService } from '@/services/lostPet/lostPetService';
import type { LostPetCase } from '@/types/lostPet';
import { formatDateTime } from '@/utils/lostPetUtils';
import { ROUTES } from '@/routes/paths';
import styles from './LostPetReportPage.module.css';

export function LostPetReportPage() {
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('case');
  const [activeCase, setActiveCase] = useState<LostPetCase | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (caseId) {
      mockLostPetService.getCaseById(caseId).then(setActiveCase);
    }
  }, [caseId]);

  const handleReport = async (input: Parameters<typeof mockLostPetService.reportSighting>[1]) => {
    if (!caseId) return;
    await mockLostPetService.reportSighting(caseId, input);
    setSubmitted(true);
  };

  return (
    <PublicLayout>
      <PageContainer size="md" className={styles.page}>
        {!caseId || !activeCase ? (
          <div className={styles.empty}>
            <h1 className={styles.title}>Recovery link not found</h1>
            <p className={styles.text}>
              This recovery page may have expired or the pet may have been found.
            </p>
            <Link to={ROUTES.LANDING}>
              <Button variant="secondary" size="md">
                Go to PetClues
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <Badge variant="danger">Missing pet</Badge>
              <h1 className={styles.petName}>{activeCase.petName}</h1>
              <p className={styles.breed}>{activeCase.breed}</p>
            </div>

            <div className={styles.photo}>{activeCase.avatarInitials}</div>

            <div className={styles.details}>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>Last seen</span>
                <p>{activeCase.lastSeenLocation}</p>
                <p className={styles.detailMeta}>{formatDateTime(activeCase.lastSeenAt)}</p>
              </div>
              {activeCase.notes && (
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Description</span>
                  <p>{activeCase.notes}</p>
                </div>
              )}
            </div>

            <ContactOwnerCard contacts={LOST_PET_EMERGENCY_CONTACTS} />

            {submitted ? (
              <div className={styles.thanks}>
                <h2>Thank you for reporting</h2>
                <p>The owner has been notified. Your report helps bring {activeCase.petName} home.</p>
              </div>
            ) : (
              <Button variant="primary" size="lg" fullWidth onClick={() => setReportOpen(true)}>
                Report a sighting
              </Button>
            )}
          </>
        )}
      </PageContainer>

      {activeCase && (
        <ReportSightingModal
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
          onSubmit={handleReport}
          petName={activeCase.petName}
          isPublic
        />
      )}
    </PublicLayout>
  );
}
