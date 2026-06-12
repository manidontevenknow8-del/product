/** Official PetClues social profiles - keep in sync with Organization schema `sameAs`. */
export const SOCIAL_PROFILES = {
  instagram: 'https://instagram.com/thepetclues',
  facebook: 'https://facebook.com/profile.php?id=61590826104670',
} as const;

export const ORGANIZATION_SAME_AS = [
  SOCIAL_PROFILES.instagram,
  SOCIAL_PROFILES.facebook,
] as const;
