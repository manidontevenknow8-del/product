import type { ReferralReward, WaitlistMember } from '@/types/growth';
import { REFERRAL_REWARDS, SPOTS_PER_REFERRAL } from '@/data/growthData';

export function generateReferralCode(name: string): string {
  const base = name
    .trim()
    .split(/\s+/)[0]
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 6);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || 'PET'}${suffix}`;
}

export function computePosition(
  initialPosition: number,
  referralCount: number,
): number {
  return Math.max(1, initialPosition - referralCount * SPOTS_PER_REFERRAL);
}

export function getReferralUrl(code: string, origin = window.location.origin): string {
  return `${origin}/signup?ref=${code}`;
}

export function getNextReward(
  referralCount: number,
  rewards: ReferralReward[] = REFERRAL_REWARDS,
): ReferralReward | null {
  return rewards.find((r) => r.referralsRequired > referralCount) ?? null;
}

export function getEarnedRewards(
  referralCount: number,
  rewards: ReferralReward[] = REFERRAL_REWARDS,
): ReferralReward[] {
  return rewards.filter((r) => referralCount >= r.referralsRequired);
}

export function getMilestoneProgress(
  referralCount: number,
  nextReward: ReferralReward | null,
): number {
  if (!nextReward) return 100;
  const prev = REFERRAL_REWARDS.filter((r) => r.referralsRequired <= referralCount).pop();
  const start = prev?.referralsRequired ?? 0;
  const end = nextReward.referralsRequired;
  if (end === start) return 100;
  return Math.min(100, Math.round(((referralCount - start) / (end - start)) * 100));
}

export function getCountdownParts(target: Date, now = new Date()) {
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, isPast: diff === 0 };
}

export function buildShareMessage(_member: WaitlistMember, url: string): string {
  return `I've been using PetClues to organize my pet's health — daily check-ins, reminders, and an emergency passport. Create a free account with my link: ${url}`;
}

export function buildShareUrls(_url: string, message: string) {
  const encodedMessage = encodeURIComponent(message);
  return {
    whatsapp: `https://wa.me/?text=${encodedMessage}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
    email: `mailto:?subject=${encodeURIComponent('Try PetClues — pet health made calm')}&body=${encodedMessage}`,
    instagram: null as string | null,
  };
}
