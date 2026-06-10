import { isSupabaseConfigured } from '@/services/supabase/config';
import { getSupabaseClient } from '@/services/supabase/client';

export type FoundingFeatureCandidate = {
  id: string;
  title: string;
  description: string;
  voteCount: number;
  votedByUser: boolean;
};

const MOCK_CANDIDATES: FoundingFeatureCandidate[] = [
  {
    id: 'vet-decoder-plus',
    title: 'Vet Bill Decoder+',
    description: 'Deeper AI analysis of invoices, labs, and prescriptions.',
    voteCount: 0,
    votedByUser: false,
  },
  {
    id: 'checkin-streaks',
    title: 'Check-in streak insights',
    description: 'Longer trends for feeding and walk patterns across pets.',
    voteCount: 0,
    votedByUser: false,
  },
  {
    id: 'richer-reports',
    title: 'Richer monthly reports',
    description: 'More chapters, custom branding, and print-ready layouts.',
    voteCount: 0,
    votedByUser: false,
  },
  {
    id: 'ai-companion',
    title: 'AI care companion',
    description: 'Guided conversations tailored to your pet\'s routine.',
    voteCount: 0,
    votedByUser: false,
  },
  {
    id: 'family-sharing',
    title: 'Family & caretaker sharing',
    description: 'Invite partners and sitters with scoped access.',
    voteCount: 0,
    votedByUser: false,
  },
];

export async function expireFoundingTrials(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  await supabase.rpc('expire_founding_trials');
}

export async function listFoundingFeatureVotes(
  userId: string,
): Promise<FoundingFeatureCandidate[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_CANDIDATES;
  }

  const supabase = getSupabaseClient();

  const [{ data: candidates }, { data: votes }, { data: allVotes }] = await Promise.all([
    supabase
      .from('founding_feature_candidates')
      .select('id, title, description, sort_order')
      .eq('active', true)
      .order('sort_order'),
    supabase
      .from('founding_feature_votes')
      .select('feature_id')
      .eq('user_id', userId),
    supabase.from('founding_feature_votes').select('feature_id'),
  ]);

  if (!candidates?.length) return MOCK_CANDIDATES;

  const userVoteSet = new Set((votes ?? []).map((v) => v.feature_id));
  const counts = (allVotes ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.feature_id] = (acc[row.feature_id] ?? 0) + 1;
    return acc;
  }, {});

  return candidates.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    voteCount: counts[c.id] ?? 0,
    votedByUser: userVoteSet.has(c.id),
  }));
}

export async function toggleFoundingFeatureVote(
  userId: string,
  featureId: string,
  currentlyVoted: boolean,
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabaseClient();

  if (currentlyVoted) {
    const { error } = await supabase
      .from('founding_feature_votes')
      .delete()
      .eq('user_id', userId)
      .eq('feature_id', featureId);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from('founding_feature_votes').insert({
    user_id: userId,
    feature_id: featureId,
  });
  if (error) throw new Error(error.message);
}
