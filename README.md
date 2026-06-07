# PetClues

Premium pet health intelligence — frontend scaffold.

## Getting started

```bash
cd source-code
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project structure

```
source-code/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI primitives (Button, Card, Input…)
│   │   ├── layout/          # Header, Footer, Sidebar
│   │   ├── landing/         # Landing page sections
│   │   ├── onboarding/      # Onboarding flow
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── pet-profile/     # Profile sections
│   │   ├── scan/            # Scan capture & history
│   │   ├── timeline/        # Timeline feed
│   │   └── emergency/       # Emergency passport
│   ├── layouts/             # PublicLayout, AppLayout
│   ├── pages/               # One file per route
│   ├── routes/              # Route path constants
│   ├── types/               # Shared TypeScript types
│   ├── data/                # Mock data (replace with API later)
│   └── styles/              # Global CSS & design tokens
```

## Pages

| Route | Page |
|---|---|
| `/` | Landing |
| `/onboarding` | Onboarding |
| `/dashboard` | Dashboard |
| `/pet-profile` | Pet Profile |
| `/scan` | Scan |
| `/timeline` | Timeline |
| `/emergency-passport` | Emergency Passport |

## Design

- Soft premium palette (warm cream, sage dark, muted gold accent)
- Cormorant Garamond + Inter typography
- CSS Modules for component-scoped styles
- Design tokens in `src/styles/global.css`

## Extending

Each major section lives in its own TSX file. To swap a section later, replace the component file without touching the page or layout. Mock data in `src/data/mockData.ts` can be replaced with API calls when backend logic is added.
