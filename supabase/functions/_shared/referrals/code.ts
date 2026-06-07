export function generateReferralCode(name: string): string {
  const base = name
    .trim()
    .split(/\s+/)[0]
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 6);
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${base || 'PET'}${suffix}`;
}

