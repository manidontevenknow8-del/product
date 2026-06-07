import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadow,
  layout,
  transition,
  breakpoints,
} from './design-tokens';

export const theme = {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadow,
  layout,
  transition,
  breakpoints,
} as const;

/** Typography scale — maps to CSS utility classes in typography.css */
export const typography = {
  display: 'type-display',
  heading: 'type-heading',
  subheading: 'type-subheading',
  body: 'type-body',
  caption: 'type-caption',
} as const;

export type Theme = typeof theme;
export type TypographyVariant = keyof typeof typography;
