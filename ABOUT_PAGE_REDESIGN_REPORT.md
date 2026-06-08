# About Page Redesign Report

## Goal

Create a premium, story-driven About page that emotionally connects users to PetClues and reinforces the product thesis: **PetClues preserves a pet's life story**.

Constraints:
- No `LegalPageLayout` usage
- Marketing-grade layout (Apple / Notion / Linear / Airbnb inspired)
- Mobile-first, premium spacing, large typography
- Cards, gradients, subtle animations
- No em dashes

## What shipped

Implemented a complete redesign at `src/pages/legal/AboutPage.tsx` with a bespoke layout and styling in `src/pages/legal/AboutPage.module.css`. The page uses the standard public header and footer.

### Section map (as requested)

1. **Fullscreen emotional hero**
   - Full-height hero (`min-height: calc(100vh - var(--header-height))`)
   - Background image + layered scrims (radial + linear gradients)
   - Primary/secondary CTAs (Start free, Explore Pro)

2. **Memory cards grid**
   - 8 premium cards, hover lift, soft borders, elevated shadows
   - Copy focuses on emotionally resonant moments

3. **Pet life timeline visualization**
   - Timeline rows with markers + chapter cards
   - Reads like a scrollable life story

4. **Why PetClues exists**
   - Two-column editorial prose on desktop, single column on mobile
   - Pull-quote emphasis on the core question

5. **What lives inside PetClues**
   - Feature grid of cards (records, vaccines, reminders, documents, reports, timelines, passports, sharing)
   - Supports the story thesis without turning into a spec sheet

6. **Founder philosophy**
   - 3-card philosophy cluster (Reduce stress, Clarity over clutter, The right moment)

7. **Trust section**
   - Styled trust card that clearly states the veterinary disclaimer

8. **Premium CTA**
   - Full-bleed CTA with background image and deep scrim
   - Strong emotional headline + conversion buttons

## Design system alignment

- Uses existing typography tokens (`--font-serif`, `--text-*`) and spacing tokens (`--space-*`)
- Uses existing colors (`--color-bg`, `--color-bg-dark`, `--color-accent*`)
- Animation respects `prefers-reduced-motion`

## Notes

- This page is intentionally not styled as a legal page; it is a marketing / narrative page.
- Uses only existing images from `PAGE_IMG` to avoid asset churn.

