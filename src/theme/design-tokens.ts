/** Single source of truth for PetClues design tokens (JS/TS consumers) */

export const colors = {
  bg: '#FAF9F7',
  bgElevated: '#FFFFFF',
  bgMuted: '#F3F1ED',
  bgDark: '#2C3E35',

  text: '#1A1F1C',
  textMuted: '#6B7269',
  textLight: '#9BA39A',
  textInverse: '#FAF9F7',

  accent: '#C4A882',
  accentLight: '#E8D9C4',
  accentDark: '#A08860',

  border: '#E8E5DF',
  borderLight: '#F0EDE8',

  success: '#5A8F7B',
  warning: '#C4A060',
  danger: '#B85C5C',
} as const;

export const fonts = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'Inter', system-ui, sans-serif",
} as const;

export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  '4xl': '2.75rem',
  '5xl': '3.5rem',
} as const;

export const spacing = {
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

export const radius = {
  sm: '6px',
  md: '12px',
  lg: '20px',
  xl: '28px',
  full: '9999px',
} as const;

export const shadow = {
  sm: '0 1px 3px rgba(26, 31, 28, 0.04)',
  md: '0 4px 16px rgba(26, 31, 28, 0.06)',
  lg: '0 8px 32px rgba(26, 31, 28, 0.08)',
} as const;

export const layout = {
  maxWidth: '1200px',
  maxWidthSm: '640px',
  maxWidthMd: '720px',
  maxWidthLg: '960px',
  headerHeight: '64px',
  sidebarWidth: '240px',
  bottomNavHeight: '64px',
} as const;

export const transition = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '350ms ease',
} as const;

export const breakpoints = {
  sm: '480px',
  md: '640px',
  lg: '900px',
  xl: '1200px',
} as const;
