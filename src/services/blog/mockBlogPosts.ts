import type { BlogPost } from '@/types/blog';
import { buildSiteLinkGraph } from '@/data/internalLinking/siteLinkGraph';
import { resolveBlogInternalLinks } from '@/data/internalLinking/resolveBlogInternalLinks';
import { SEO_BLOG_POSTS } from './seoBlogPosts';
import { SEO_BLOG_POSTS_EXTRA } from './seoBlogPostsExtra';
import { EXPANDED_BLOG_POSTS } from './expandedBlogPosts';
import { DOMINANCE_BLOG_POSTS } from './dominanceBlogPosts';
import { applyLongFormToPosts } from './applyLongFormContent';

/** Offline / demo posts - mirrors migration seed for consistent UX without Supabase */
const LEGACY_MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: 'mock-1',
    title: 'How to Build a Vaccination Schedule Your Dog Will Actually Follow',
    slug: 'dog-vaccination-schedule-guide',
    content: `## Why schedules fail

Most pet parents start strong, then life gets busy. The fix is not more willpower - it is a system that lives where you already look.

## The calm approach

1. List core vaccines from your vet
2. Add each due date as a reminder with a 7-day early window
3. Store the clinic receipt in your pet document vault

## What to track

- Vaccine name and lot number
- Date administered
- Next due date
- Any reaction notes

PetClues ties reminders to health records so nothing lives in three different places.`,
    excerpt:
      'A practical guide to building a dog vaccination schedule with reminders, records, and vet receipts in one place.',
    category: 'dog-health',
    tags: ['vaccination', 'dog', 'reminders'],
    author: 'PetClues Team',
    publishedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    featuredImage: '',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    title: 'Cat Health Records: What to Save After Every Vet Visit',
    slug: 'cat-health-records-checklist',
    content: `## The five-minute habit

After each visit, save three things: the summary PDF, medication changes, and the next follow-up date.

## Why it matters

Cats hide discomfort. A clear record history helps you spot patterns early - appetite shifts, weight trends, recurring symptoms.

## Starter checklist

- Wellness exam notes
- Vaccination history
- Lab results
- Dental assessments
- Prescription updates

Organized records turn anxiety into confidence.`,
    excerpt:
      "What to save after every vet visit so your cat's health story stays complete and easy to share.",
    category: 'cat-health',
    tags: ['records', 'cat', 'vet-visit'],
    author: 'PetClues Team',
    publishedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    featuredImage: '',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    title: 'Bird Care Basics: Creating a Low-Stress Health Routine',
    slug: 'bird-care-health-routine',
    content: `## Small pets, big documentation needs

Birds need consistent weight checks, nail trims, and avian-specific labs. Missed details compound quickly.

## Build a gentle routine

- Weekly weight log (grams matter)
- Monthly photo of feathers and posture
- Quarterly avian wellness targets

## Records that help your vet

Bring diet changes, cage enrichment updates, and any breathing or vocal shifts. A simple timeline makes appointments faster and calmer.`,
    excerpt:
      'How to build a low-stress health routine for companion birds with records that support better vet care.',
    category: 'bird-care',
    tags: ['bird', 'wellness', 'routine'],
    author: 'PetClues Team',
    publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    featuredImage: '',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    title: 'Exotic Pet Records: What Reptile and Small Mammal Owners Should Track',
    slug: 'exotic-pet-records-guide',
    content: `## Exotics need precision

Temperature logs, shedding cycles, appetite notes, and enclosure changes all influence health.

## What belongs in your vault

- Habitat parameters (temp / humidity)
- Feeding schedule changes
- Shed dates and quality notes
- Parasite prevention history

## Shareable summaries

When you can export a clean timeline, sitters and vets stay aligned - especially for species with specialized care needs.`,
    excerpt:
      'A practical guide to health records for reptiles and small mammals, built for precision and peace of mind.',
    category: 'exotic-pets',
    tags: ['exotic', 'reptile', 'records'],
    author: 'PetClues Team',
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    featuredImage: '',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-5',
    title: 'Pet Records 101: Turn Chaos Into a Calm Care Timeline',
    slug: 'pet-records-101-care-timeline',
    content: `## Records are a story

Vaccines, bills, prescriptions, and notes are not clutter - they are chapters in your pet's life.

## From folders to timeline

When documents become dated events, patterns emerge: seasonal allergies, medication responses, weight trends.

## Start this week

Upload your latest vet document, confirm extracted dates, and set one reminder for the next due item. Small steps create lasting clarity.`,
    excerpt:
      'Learn how organized pet records become a calm timeline that improves everyday care decisions.',
    category: 'pet-records',
    tags: ['records', 'timeline', 'organization'],
    author: 'PetClues Team',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    featuredImage: '',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-6',
    title: "PetClues Guides: Choosing the Right Care Tools for Your Pet's Life Stage",
    slug: 'petclues-guides-life-stage-care-tools',
    content: `## Puppies and kittens

Focus on vaccination cadence, socialization notes, and growth tracking.

## Adult pets

Prioritize preventive care, dental follow-ups, and medication adherence.

## Senior companions

Track mobility, appetite, lab trends, and comfort-focused reminders.

## How PetClues helps

Reminders, document vault, emergency passport, and PetCare Score work together - so you spend less time searching and more time caring.`,
    excerpt:
      'A PetClues guide to choosing the right care tools for puppies, adults, and senior pets.',
    category: 'petclues-guides',
    tags: ['petclues', 'guides', 'life-stage'],
    author: 'PetClues Team',
    publishedAt: new Date().toISOString(),
    featuredImage: '',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_BLOG_POSTS: BlogPost[] = applyLongFormToPosts([
  ...SEO_BLOG_POSTS,
  ...SEO_BLOG_POSTS_EXTRA,
  ...LEGACY_MOCK_BLOG_POSTS,
  ...EXPANDED_BLOG_POSTS,
  ...DOMINANCE_BLOG_POSTS,
]);

if (MOCK_BLOG_POSTS.length !== 250) {
  throw new Error(`Expected 250 blog posts, got ${MOCK_BLOG_POSTS.length}`);
}

const BLOG_LINK_CANDIDATES = MOCK_BLOG_POSTS.map((post) => ({
  slug: post.slug,
  title: post.title,
  category: post.category,
  tags: post.tags,
}));

for (const post of BLOG_LINK_CANDIDATES) {
  const plan = resolveBlogInternalLinks(post, BLOG_LINK_CANDIDATES);
  if (plan.blogs.length < 3) {
    throw new Error(`Blog ${post.slug} has only ${plan.blogs.length} related blog links`);
  }
}

const linkGraph = buildSiteLinkGraph(BLOG_LINK_CANDIDATES);
if (linkGraph.orphans.length > 0) {
  const sample = linkGraph.orphans
    .slice(0, 10)
    .map((node) => node.path)
    .join(', ');
  throw new Error(
    `Internal linking audit found ${linkGraph.orphans.length} orphan pages (e.g. ${sample})`,
  );
}
