import { useMemo, useState } from 'react';
import { eventTracker } from '@/analytics/EventTracker';
import { ShareCard } from '@/components/editorial';
import { buildPublicStoryUrl } from '@/services/petStoryShare/petStoryShareTypes';
import type { PetStoryShareRecord } from '@/services/petStoryShare/petStoryShareTypes';
import { FREE_TIMELINE_DAYS } from '@/subscription/featureGates';
import shareStyles from '@/components/editorial/ShareCard.module.css';

type StoryShareCardProps = {
  petId?: string;
  petName: string;
  share: PetStoryShareRecord | null;
  isLoading: boolean;
  hasFullTimeline: boolean;
  canEdit: boolean;
  onEnsureLink: () => Promise<unknown>;
  onRefreshSnapshot: () => Promise<unknown>;
  onRegenerateToken: () => Promise<unknown>;
};

export function StoryShareCard({
  petId,
  petName,
  share,
  isLoading,
  hasFullTimeline,
  canEdit,
  onEnsureLink,
  onRefreshSnapshot,
  onRegenerateToken,
}: StoryShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicUrl = useMemo(
    () => (share && !share.revokedAt ? buildPublicStoryUrl(share.publicToken) : null),
    [share],
  );

  const windowNote = hasFullTimeline
    ? 'Visitors see your complete life story.'
    : `Visitors see the last ${FREE_TIMELINE_DAYS} days of ${petName}'s story — same window as your Free timeline. Upgrade to Plus to share every chapter.`;

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      eventTracker.track('story_share_copied', { petId: petId ?? null });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const runAction = async (
    action: () => Promise<unknown>,
    eventName?: 'story_share_published' | 'story_share_refreshed' | 'story_share_regenerated',
  ) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      if (eventName) {
        eventTracker.track(eventName, { petId: petId ?? null, hasFullTimeline });
      }
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update story link.');
    } finally {
      setBusy(false);
    }
  };

  const publishActions = (
    <>
      <button
        type="button"
        className={`ed-btn ${shareStyles.actionBtn}`}
        disabled={busy}
        onClick={() => void runAction(onEnsureLink, 'story_share_published')}
      >
        {busy ? 'Publishing…' : 'Publish story link'}
      </button>
    </>
  );

  const activeActions = (
    <>
      <button type="button" className={`ed-btn ${shareStyles.actionBtn}`} onClick={() => void handleCopy()}>
        {copied ? 'Link copied' : 'Copy public link'}
      </button>
      {canEdit && (
        <>
          <button
            type="button"
            className={`ed-btn-dark ${shareStyles.actionBtn}`}
            disabled={busy}
            onClick={() => void runAction(onRefreshSnapshot, 'story_share_refreshed')}
          >
            {busy ? 'Working…' : 'Refresh story'}
          </button>
          <button
            type="button"
            className={`ed-btn-dark ${shareStyles.actionBtn}`}
            disabled={busy}
            onClick={() => void runAction(onRegenerateToken, 'story_share_regenerated')}
          >
            Regenerate link
          </button>
        </>
      )}
    </>
  );

  return (
    <ShareCard
      kicker="Share outside the app"
      title={`Share ${petName}'s story`}
      lead="Publish a read-only page with the auto-built narrative, milestone moments, and recent chronology — no PetClues login required."
      windowNote={windowNote}
      tone="gold"
      publicUrl={publicUrl}
      isLoading={isLoading}
      loadingMessage="Checking share link…"
      canEdit={canEdit}
      viewerMessage={`No active link yet. Ask a household editor to publish ${petName}'s story.`}
      error={error}
      actions={publicUrl ? activeActions : publishActions}
      qrCaption={publicUrl ? `QR code for ${petName}'s life story` : undefined}
      aria-labelledby="story-share-title"
    />
  );
}
