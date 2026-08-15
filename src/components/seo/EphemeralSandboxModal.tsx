import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '@/services/supabase/client';
import { ROUTES } from '@/routes/paths';
import styles from './EphemeralSandboxModal.module.css';

type EphemeralSandboxModalProps = {
  isOpen: boolean;
  onClose: () => void;
  breed: string;
  condition: string;
};

type LaunchState = 'idle' | 'loading' | 'error';

/**
 * Exit-intent PLG modal: launches a zero-friction sandbox session via
 * server-side credentials (never embedded in the client bundle).
 */
export function EphemeralSandboxModal({
  isOpen,
  onClose,
  breed,
  condition,
}: EphemeralSandboxModalProps) {
  const navigate = useNavigate();
  const [state, setState] = useState<LaunchState>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setState('idle');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function launch() {
    setState('loading');
    setError(null);
    try {
      const response = await fetch('/api/ephemeral-sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ breed, condition }),
      });
      const payload = (await response.json()) as {
        access_token?: string;
        refresh_token?: string;
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok || !payload.access_token || !payload.refresh_token) {
        throw new Error(payload.error || 'Unable to launch sandbox session.');
      }

      const supabase = getSupabaseClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
      });
      if (sessionError) throw new Error(sessionError.message);

      sessionStorage.setItem(
        'petclues_ephemeral_context',
        JSON.stringify({ breed, condition, launchedAt: Date.now() }),
      );

      navigate(payload.redirectTo || ROUTES.TIMELINE, { replace: true });
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Launch failed. Try the free sandbox signup.');
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ephemeral-sandbox-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
        <p className={styles.eyebrow}>Zero-friction clinical preview</p>
        <h2 id="ephemeral-sandbox-title" className={styles.title}>
          Before you go: see a live clinical recovery timeline for a {breed} with {condition}
        </h2>
        <p className={styles.body}>
          No email required. Launch an ephemeral sandbox session inside the PetClues vault -
          pre-loaded with realistic medical timeline structure so you can feel the workflow before
          Genesis.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => void launch()}
            disabled={state === 'loading'}
          >
            {state === 'loading' ? 'Launching vault…' : 'Launch Ephemeral Timeline'}
          </button>
          <button type="button" className={styles.secondary} onClick={onClose}>
            Stay on this guide
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}
