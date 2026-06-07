import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { PAGE_IMG } from '@/data/pageImages';
import { EmptyStateFrame } from './EmptyStateFrame';
import { ROUTES } from '@/routes/paths';

type EmptyDocumentsStateProps = {
  context?: 'scan' | 'vault';
  onUpload?: () => void;
  compact?: boolean;
};

export function EmptyDocumentsState({
  context = 'scan',
  onUpload,
  compact = false,
}: EmptyDocumentsStateProps) {
  const isVault = context === 'vault';

  return (
    <EmptyStateFrame
      variant="documents"
      image={PAGE_IMG.scan.docs}
      imageAlt="Illustration of scanned pet documents"
      title={isVault ? 'No documents stored yet' : 'Upload your first pet document'}
      description={
        isVault
          ? 'Bills, prescriptions, reports, and images will appear here once uploaded.'
          : 'Scan or upload vaccination records, vet bills, and health reports — PetClues will organize them for you.'
      }
      hint={isVault ? 'Documents stay encrypted and private' : 'PDF, JPG, or PNG supported'}
      compact={compact}
      action={
        onUpload ? (
          <Button variant="primary" size="md" onClick={onUpload}>
            Upload document
          </Button>
        ) : (
          <Link to={ROUTES.SCAN}>
            <Button variant="primary" size="md">
              Go to scan
            </Button>
          </Link>
        )
      }
    />
  );
}
