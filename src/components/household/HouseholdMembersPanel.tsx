import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PremiumGate, EditorialUpgradeModal } from '@/components/ui';
import { useHousehold } from '@/household/HouseholdProvider';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { ROUTES } from '@/routes/paths';
import {
  HOUSEHOLD_ROLE_LABELS,
  INVITE_ROLE_LABELS,
  type InviteRole,
} from '@/services/household';
import { getUserFacingError } from '@/utils/userFacingErrors';
import styles from './HouseholdMembersPanel.module.css';

function buildInviteUrl(token: string): string {
  if (typeof window === 'undefined') return `${ROUTES.FAMILY_INVITE}/${token}`;
  return `${window.location.origin}${ROUTES.FAMILY_INVITE}/${token}`;
}

type HouseholdMembersPanelProps = {
  compact?: boolean;
};

export function HouseholdMembersPanel({ compact = false }: HouseholdMembersPanelProps) {
  const {
    household,
    members,
    outgoingInvites,
    canManageMembers,
    isLoading,
    inviteMember,
    revokeInvite,
    updateMemberRole,
    removeMember,
  } = useHousehold();
  const { currentPlan, refresh: refreshSubscription } = useSubscription();
  const memberAccess = useFeatureAccess('familyMembers');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('editor');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const nonOwnerCount = useMemo(
    () => members.filter((member) => member.role !== 'owner').length + outgoingInvites.length,
    [members, outgoingInvites],
  );

  const billingCopy = useMemo(() => {
    if (currentPlan === 'free') {
      return 'Household sharing is included with Plus at no per-seat charge. Upgrade to invite partners, family, or sitters.';
    }
    if (memberAccess.usageLimit === 'unlimited') {
      return 'Your household plan covers member access at no extra per-seat charge. Pro includes unlimited invited members.';
    }
    return `Your Plus household plan includes ${memberAccess.usageLimit} invited members at no extra charge. Pro adds unlimited seats.`;
  }, [currentPlan, memberAccess.usageLimit]);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setError(null);
    setMessage(null);
    try {
      await fn();
      await refreshSubscription();
    } catch (err) {
      setError(getUserFacingError(err, 'generic', 'Something went wrong.'));
    } finally {
      setBusy(null);
    }
  };

  const handleInvite = async () => {
    if (!memberAccess.isAllowed) {
      setUpgradeOpen(true);
      return;
    }
    await run('invite', async () => {
      const invite = await inviteMember(email, role);
      setEmail('');
      setMessage(`Invite created for ${email.trim().toLowerCase()}. Share the link below — email delivery is not set up yet.`);
      setLastInviteUrl(invite.token ? buildInviteUrl(invite.token) : null);
    });
  };

  const copyInviteUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Invite link copied.');
    } catch {
      setError('Could not copy the invite link.');
    }
  };

  if (isLoading && !household) {
    return (
      <section className={styles.wrap}>
        <p className={styles.lead}>Loading household…</p>
      </section>
    );
  }

  if (!household) {
    return (
      <section className={styles.wrap}>
        <p className={styles.lead}>No household found for this account yet.</p>
      </section>
    );
  }

  if (!canManageMembers) {
    return (
      <section className={styles.wrap}>
        <div className={styles.head}>
          <p className={styles.kicker}>Household access</p>
          <h3 className={styles.title}>{household.name}</h3>
          <p className={styles.viewerNote}>
            You are a {HOUSEHOLD_ROLE_LABELS[household.myRole]} on this household. Only the owner
            can invite or manage members.
          </p>
        </div>
        {!compact && (
          <ul className={styles.memberList}>
            {members.map((member) => (
              <li key={member.userId} className={styles.memberRow}>
                <div className={styles.memberMain}>
                  <p className={styles.memberName}>{member.name}</p>
                  <p className={styles.memberEmail}>{member.email}</p>
                </div>
                <span className={styles.roleBadge}>{HOUSEHOLD_ROLE_LABELS[member.role]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  const content = (
    <>
      <div className={styles.head}>
        <p className={styles.kicker}>Household sharing</p>
        <h3 className={styles.title}>{household.name}</h3>
        <p className={styles.lead}>
          Invite partners, family, or sitters with editor or viewer access to your shared pet records.
        </p>
        <p className={styles.billingNote}>
          <strong>No per-seat billing.</strong> {billingCopy}
        </p>
        {memberAccess.usageLimit !== 'unlimited' && (
          <p className={styles.usage}>
            {nonOwnerCount}/{memberAccess.usageLimit} member slots used (pending invites count)
          </p>
        )}
      </div>

      {memberAccess.isAllowed ? (
        <div className={styles.inviteForm}>
          <label className={styles.field}>
            <span>Email</span>
            <input
              className={styles.fieldInput}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="partner@example.com"
            />
          </label>
          <label className={styles.field}>
            <span>Role</span>
            <select
              className={styles.roleSelect}
              value={role}
              onChange={(event) => setRole(event.target.value as InviteRole)}
            >
              <option value="editor">{INVITE_ROLE_LABELS.editor}</option>
              <option value="viewer">{INVITE_ROLE_LABELS.viewer}</option>
            </select>
          </label>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={Boolean(busy) || !email.trim()}
            onClick={() => void handleInvite()}
          >
            {busy === 'invite' ? 'Sending…' : 'Send invite'}
          </button>
        </div>
      ) : (
        <button type="button" className={styles.primaryBtn} onClick={() => setUpgradeOpen(true)}>
          Upgrade to invite members
        </button>
      )}

      <h4 className={styles.sectionTitle}>Members</h4>
      <ul className={styles.memberList}>
        {members.map((member) => (
          <li key={member.userId} className={styles.memberRow}>
            <div className={styles.memberMain}>
              <p className={styles.memberName}>{member.name}</p>
              <p className={styles.memberEmail}>{member.email}</p>
            </div>
            <div className={styles.memberActions}>
              {member.role === 'owner' ? (
                <span className={styles.roleBadge}>{HOUSEHOLD_ROLE_LABELS.owner}</span>
              ) : (
                <>
                  <select
                    className={styles.roleSelect}
                    value={member.role}
                    disabled={Boolean(busy)}
                    onChange={(event) =>
                      void run(`role-${member.userId}`, async () => {
                        await updateMemberRole(member.userId, event.target.value as InviteRole);
                        setMessage(`Updated ${member.name}'s role.`);
                      })
                    }
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    disabled={Boolean(busy)}
                    onClick={() =>
                      void run(`remove-${member.userId}`, async () => {
                        await removeMember(member.userId);
                        setMessage(`Removed ${member.name} from the household.`);
                      })
                    }
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {outgoingInvites.length > 0 && (
        <>
          <h4 className={styles.sectionTitle}>Pending invites</h4>
          <ul className={styles.inviteList}>
            {outgoingInvites.map((invite) => (
              <li key={invite.id} className={styles.inviteRow}>
                <div className={styles.memberMain}>
                  <p className={styles.memberName}>{invite.invitedEmail}</p>
                  <p className={styles.memberEmail}>
                    {HOUSEHOLD_ROLE_LABELS[invite.role]} · expires{' '}
                    {new Date(invite.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  disabled={Boolean(busy)}
                  onClick={() =>
                    void run(`revoke-${invite.id}`, async () => {
                      await revokeInvite(invite.id);
                      setMessage('Invite revoked.');
                    })
                  }
                >
                  Revoke
                </button>
                {invite.token && (
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    disabled={Boolean(busy)}
                    onClick={() => void copyInviteUrl(buildInviteUrl(invite.token!))}
                  >
                    Copy link
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {compact && (
        <Link to={`${ROUTES.SETTINGS}?section=household`} className={styles.settingsLink}>
          Open household settings
        </Link>
      )}

      {lastInviteUrl && (
        <div className={styles.inviteLinkBox}>
          <p className={styles.inviteLinkLabel}>Share this invite link</p>
          <code className={styles.inviteLinkCode}>{lastInviteUrl}</code>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => void copyInviteUrl(lastInviteUrl)}
          >
            Copy invite link
          </button>
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}

      <EditorialUpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        eyebrow="PetClues Plus"
        title="Share care with your household"
        description="Plus includes 2 household members at no per-seat charge. Pro unlocks unlimited invited editors and viewers."
        requiredTier={currentPlan === 'free' ? 'Plus' : 'Pro'}
      />
    </>
  );

  if (currentPlan === 'free' && !memberAccess.isAllowed) {
    return (
      <section className={styles.wrap}>
        <PremiumGate
          requiredTier="Plus"
          title="Invite household members"
          description="Upgrade to Plus to invite up to 2 editors or viewers at no per-seat charge."
        >
          <div className={styles.head}>
            <p className={styles.title}>Household sharing</p>
            <p className={styles.lead}>{billingCopy}</p>
          </div>
        </PremiumGate>
      </section>
    );
  }

  return <section className={styles.wrap}>{content}</section>;
}
