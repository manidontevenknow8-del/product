import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { usePets } from '@/pets';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import {
  getDocumentService,
  validateDocumentFile,
  type IDocumentService,
  type PetDocumentRecord,
} from '@/services/documents/documentService';
import { appendActivityLogEntry } from '@/services/activity/activityLogService';
import { getUserFacingError } from '@/utils/userFacingErrors';

export type UploadState = 'idle' | 'uploading' | 'success' | 'error';

type DocumentContextValue = {
  documents: PetDocumentRecord[];
  isLoading: boolean;
  uploadState: UploadState;
  uploadProgress: number;
  uploadError: string | null;
  lastUploaded: PetDocumentRecord | null;
  refreshDocuments: () => Promise<void>;
  uploadDocument: (file: File) => Promise<PetDocumentRecord>;
  deleteDocument: (documentId: string) => Promise<void>;
  getDocumentUrl: (documentId: string) => Promise<string | null>;
  resetUploadState: () => void;
};

export const DOCUMENT_VAULT_LIMIT_MESSAGE =
  'Document Vault Limit Reached. Upgrade to Plus to unlock unlimited secure medical document storage.';

const DocumentContext = createContext<DocumentContextValue | null>(null);

type DocumentProviderProps = {
  children: ReactNode;
  documentService?: IDocumentService;
};

export function DocumentProvider({
  children,
  documentService: service = getDocumentService(),
}: DocumentProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const { activePet } = usePets();
  const { refresh: refreshSubscription } = useSubscription();
  const documentAccess = useFeatureAccess('documents');
  const [documents, setDocuments] = useState<PetDocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastUploaded, setLastUploaded] = useState<PetDocumentRecord | null>(null);

  const refreshDocuments = useCallback(async () => {
    if (!user?.id || !activePet?.id) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const list = await service.listByPet(user.id, activePet.id);
      setDocuments(list);
    } catch {
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [service, user?.id, activePet?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id && activePet?.id) {
      void refreshDocuments();
    } else {
      setDocuments([]);
    }
  }, [isAuthenticated, user?.id, activePet?.id, refreshDocuments]);

  const resetUploadState = useCallback(() => {
    setUploadState('idle');
    setUploadProgress(0);
    setUploadError(null);
    setLastUploaded(null);
  }, []);

  const uploadDocument = useCallback(
    async (file: File) => {
      if (!user?.id || !activePet?.id) {
        throw new Error('Select a pet before uploading documents.');
      }

      const validationError = validateDocumentFile(file);
      if (validationError) {
        setUploadState('error');
        setUploadError(validationError);
        throw new Error(validationError);
      }

      if (!documentAccess.isAllowed) {
        setUploadState('error');
        setUploadError(DOCUMENT_VAULT_LIMIT_MESSAGE);
        throw new Error(DOCUMENT_VAULT_LIMIT_MESSAGE);
      }

      setUploadState('uploading');
      setUploadProgress(0);
      setUploadError(null);
      setLastUploaded(null);

      try {
        const document = await service.upload(user.id, activePet.id, file, (progress) => {
          setUploadProgress(progress);
        });
        setDocuments((prev) => [document, ...prev]);
        setLastUploaded(document);
        setUploadState('success');
        appendActivityLogEntry({
          petId: activePet.id,
          type: 'scan',
          title: document.fileName,
          description: 'Document uploaded to your pet vault.',
        });
        void refreshSubscription();
        return document;
      } catch (err) {
        const message = getUserFacingError(err, 'upload', 'Upload failed.');
        setUploadState('error');
        setUploadError(message);
        throw err;
      }
    },
    [service, user?.id, activePet?.id, documentAccess.isAllowed, refreshSubscription],
  );

  const deleteDocument = useCallback(
    async (documentId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      await service.delete(user.id, documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      void refreshSubscription();
    },
    [service, user?.id, refreshSubscription],
  );

  const getDocumentUrl = useCallback(
    async (documentId: string) => {
      if (!user?.id) return null;
      return service.getDownloadUrl(user.id, documentId);
    },
    [service, user?.id],
  );

  const value = useMemo<DocumentContextValue>(
    () => ({
      documents,
      isLoading,
      uploadState,
      uploadProgress,
      uploadError,
      lastUploaded,
      refreshDocuments,
      uploadDocument,
      deleteDocument,
      getDocumentUrl,
      resetUploadState,
    }),
    [
      documents,
      isLoading,
      uploadState,
      uploadProgress,
      uploadError,
      lastUploaded,
      refreshDocuments,
      uploadDocument,
      deleteDocument,
      getDocumentUrl,
      resetUploadState,
    ],
  );

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
}

export function useDocuments(): DocumentContextValue {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocuments must be used within DocumentProvider');
  return ctx;
}
