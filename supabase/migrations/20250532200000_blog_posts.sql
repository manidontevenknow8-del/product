-- Blog & SEO infrastructure - blog_posts table

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  content text not null,
  excerpt text not null,
  category text not null
    check (category in (
      'dog-health',
      'cat-health',
      'bird-care',
      'exotic-pets',
      'pet-records',
      'petclues-guides'
    )),
  tags text[] not null default '{}',
  author text not null default 'PetClues Team',
  published_at timestamptz,
  featured_image text,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_slug_key unique (slug)
);

create index if not exists blog_posts_slug_idx on public.blog_posts (slug);
create index if not exists blog_posts_category_idx on public.blog_posts (category);
create index if not exists blog_posts_published_at_idx on public.blog_posts (published_at desc nulls last);

alter table public.blog_posts enable row level security;

-- Public read: published posts only
create policy "Public read published blog posts"
  on public.blog_posts
  for select
  using (
    status = 'published'
    and published_at is not null
    and published_at <= now()
  );

-- Keep updated_at current
create or replace function public.set_blog_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;

create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row
  execute function public.set_blog_posts_updated_at();

-- ---------------------------------------------------------------------------
-- Seed posts (organic traffic starters)

insert into public.blog_posts (
  title, slug, content, excerpt, category, tags, author, published_at, featured_image, status
) values
(
  'How to Build a Vaccination Schedule Your Dog Will Actually Follow',
  'dog-vaccination-schedule-guide',
  E'## Why schedules fail\n\nMost pet parents start strong, then life gets busy. The fix is not more willpower - it is a system that lives where you already look.\n\n## The calm approach\n\n1. List core vaccines from your vet\n2. Add each due date as a reminder with a 7-day early window\n3. Store the clinic receipt in your pet document vault\n\n## What to track\n\n- Vaccine name and lot number\n- Date administered\n- Next due date\n- Any reaction notes\n\nPetClues ties reminders to health records so nothing lives in three different places.',
  'A practical guide to building a dog vaccination schedule with reminders, records, and vet receipts in one place.',
  'dog-health',
  array['vaccination', 'dog', 'reminders'],
  'PetClues Team',
  now() - interval '12 days',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80',
  'published'
),
(
  'Cat Health Records: What to Save After Every Vet Visit',
  'cat-health-records-checklist',
  E'## The five-minute habit\n\nAfter each visit, save three things: the summary PDF, medication changes, and the next follow-up date.\n\n## Why it matters\n\nCats hide discomfort. A clear record history helps you spot patterns early - appetite shifts, weight trends, recurring symptoms.\n\n## Starter checklist\n\n- Wellness exam notes\n- Vaccination history\n- Lab results\n- Dental assessments\n- Prescription updates\n\nOrganized records turn anxiety into confidence.',
  'What to save after every vet visit so your cat''s health story stays complete and easy to share.',
  'cat-health',
  array['records', 'cat', 'vet-visit'],
  'PetClues Team',
  now() - interval '8 days',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1d77?w=1200&q=80',
  'published'
),
(
  'Bird Care Basics: Creating a Low-Stress Health Routine',
  'bird-care-health-routine',
  E'## Small pets, big documentation needs\n\nBirds need consistent weight checks, nail trims, and avian-specific labs. Missed details compound quickly.\n\n## Build a gentle routine\n\n- Weekly weight log (grams matter)\n- Monthly photo of feathers and posture\n- Quarterly avian wellness targets\n\n## Records that help your vet\n\nBring diet changes, cage enrichment updates, and any breathing or vocal shifts. A simple timeline makes appointments faster and calmer.',
  'How to build a low-stress health routine for companion birds with records that support better vet care.',
  'bird-care',
  array['bird', 'wellness', 'routine'],
  'PetClues Team',
  now() - interval '5 days',
  'https://images.unsplash.com/photo-1552728080-5768a3990da9?w=1200&q=80',
  'published'
),
(
  'Exotic Pet Records: What Reptile and Small Mammal Owners Should Track',
  'exotic-pet-records-guide',
  E'## Exotics need precision\n\nTemperature logs, shedding cycles, appetite notes, and enclosure changes all influence health.\n\n## What belongs in your vault\n\n- Habitat parameters (temp / humidity)\n- Feeding schedule changes\n- Shed dates and quality notes\n- Parasite prevention history\n\n## Shareable summaries\n\nWhen you can export a clean timeline, sitters and vets stay aligned - especially for species with specialized care needs.',
  'A practical guide to health records for reptiles and small mammals, built for precision and peace of mind.',
  'exotic-pets',
  array['exotic', 'reptile', 'records'],
  'PetClues Team',
  now() - interval '3 days',
  'https://images.unsplash.com/photo-1548553743-1df46297a5b3?w=1200&q=80',
  'published'
),
(
  'Pet Records 101: Turn Chaos Into a Calm Care Timeline',
  'pet-records-101-care-timeline',
  E'## Records are a story\n\nVaccines, bills, prescriptions, and notes are not clutter - they are chapters in your pet''s life.\n\n## From folders to timeline\n\nWhen documents become dated events, patterns emerge: seasonal allergies, medication responses, weight trends.\n\n## Start this week\n\nUpload your latest vet document, confirm extracted dates, and set one reminder for the next due item. Small steps create lasting clarity.',
  'Learn how organized pet records become a calm timeline that improves everyday care decisions.',
  'pet-records',
  array['records', 'timeline', 'organization'],
  'PetClues Team',
  now() - interval '1 day',
  'https://images.unsplash.com/photo-1450778869188-41d0601fbe84?w=1200&q=80',
  'published'
),
(
  'PetClues Guides: Choosing the Right Care Tools for Your Pet''s Life Stage',
  'petclues-guides-life-stage-care-tools',
  E'## Puppies and kittens\n\nFocus on vaccination cadence, socialization notes, and growth tracking.\n\n## Adult pets\n\nPrioritize preventive care, dental follow-ups, and medication adherence.\n\n## Senior companions\n\nTrack mobility, appetite, lab trends, and comfort-focused reminders.\n\n## How PetClues helps\n\nReminders, document vault, emergency passport, and PetCare Score work together - so you spend less time searching and more time caring.',
  'A PetClues guide to choosing the right care tools for puppies, adults, and senior pets.',
  'petclues-guides',
  array['petclues', 'guides', 'life-stage'],
  'PetClues Team',
  now(),
  'https://images.unsplash.com/photo-1601758228041-f3b279525566?w=1200&q=80',
  'published'
)
on conflict (slug) do nothing;
