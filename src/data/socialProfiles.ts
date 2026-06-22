/** Official PetClues social profiles - keep in sync with Organization schema `sameAs`. */
export const SOCIAL_PROFILES = {
  instagram: 'https://instagram.com/thepetclues',
  facebook: 'https://facebook.com/profile.php?id=61590826104670',
  linkedin: 'https://www.linkedin.com/company/petclues',
} as const;

export const ORGANIZATION_SAME_AS = [
  SOCIAL_PROFILES.instagram,
  SOCIAL_PROFILES.facebook,
  SOCIAL_PROFILES.linkedin,
] as const;
