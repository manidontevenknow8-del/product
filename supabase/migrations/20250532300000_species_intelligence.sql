-- Species Intelligence Foundation - knowledge layer for future AI features

-- ---------------------------------------------------------------------------
-- Phase 1: species

create table if not exists public.species (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint species_slug_key unique (slug)
);

create index if not exists species_slug_idx on public.species (slug);

-- ---------------------------------------------------------------------------
-- Phase 2: breeds

create table if not exists public.breeds (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.species (id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  size_category text check (
    size_category is null
    or size_category in ('small', 'medium', 'large', 'giant', 'variable')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint breeds_species_slug_key unique (species_id, slug)
);

create index if not exists breeds_species_id_idx on public.breeds (species_id);
create index if not exists breeds_slug_idx on public.breeds (slug);

-- ---------------------------------------------------------------------------
-- Phase 3 & 4: care_guidelines (structured care knowledge)

create table if not exists public.care_guidelines (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.species (id) on delete cascade,
  breed_id uuid references public.breeds (id) on delete cascade,
  lifespan jsonb not null default '{}',
  diet jsonb not null default '{}',
  exercise_needs jsonb not null default '{}',
  common_conditions jsonb not null default '[]',
  vaccination_guidance jsonb not null default '{}',
  seasonal_considerations jsonb not null default '[]',
  source text,
  version integer not null default 1,
  status text not null default 'published'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One species-default row (breed_id null) and one row per breed
create unique index if not exists care_guidelines_species_default_uidx
  on public.care_guidelines (species_id)
  where breed_id is null;

create unique index if not exists care_guidelines_breed_uidx
  on public.care_guidelines (breed_id)
  where breed_id is not null;

create index if not exists care_guidelines_species_id_idx on public.care_guidelines (species_id);
create index if not exists care_guidelines_breed_id_idx on public.care_guidelines (breed_id);
create index if not exists care_guidelines_status_idx on public.care_guidelines (status);

-- ---------------------------------------------------------------------------
-- RLS - reference knowledge; public read for published guidelines

alter table public.species enable row level security;
alter table public.breeds enable row level security;
alter table public.care_guidelines enable row level security;

create policy "Public read species"
  on public.species
  for select
  using (true);

create policy "Public read breeds"
  on public.breeds
  for select
  using (true);

create policy "Public read published care guidelines"
  on public.care_guidelines
  for select
  using (status = 'published');

-- ---------------------------------------------------------------------------
-- updated_at triggers

create or replace function public.set_species_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists species_set_updated_at on public.species;
create trigger species_set_updated_at
  before update on public.species
  for each row execute function public.set_species_updated_at();

create or replace function public.set_breeds_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists breeds_set_updated_at on public.breeds;
create trigger breeds_set_updated_at
  before update on public.breeds
  for each row execute function public.set_breeds_updated_at();

create or replace function public.set_care_guidelines_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists care_guidelines_set_updated_at on public.care_guidelines;
create trigger care_guidelines_set_updated_at
  before update on public.care_guidelines
  for each row execute function public.set_care_guidelines_updated_at();

-- ---------------------------------------------------------------------------
-- Seed: species

insert into public.species (slug, name, description) values
  ('dog', 'Dog', 'Domestic dogs - highly variable by breed; preventive care and vaccination cadence are essential.'),
  ('cat', 'Cat', 'Domestic cats - independent companions with species-specific nutrition and litter-related health needs.'),
  ('bird', 'Bird', 'Companion birds - sensitive respiratory systems; weight and environment monitoring matter.'),
  ('rabbit', 'Rabbit', 'Domestic rabbits - herbivores with dental and GI health as primary concerns.'),
  ('reptile', 'Reptile', 'Common pet reptiles - habitat parameters (temperature, humidity, UVB) directly affect health.')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Seed: breeds (species resolved via subquery)

insert into public.breeds (species_id, slug, name, description, size_category)
select s.id, v.slug, v.name, v.description, v.size_category
from public.species s
cross join (values
  ('dog', 'labrador-retriever', 'Labrador Retriever', 'Friendly, active retriever; prone to joint and weight issues.', 'large'),
  ('dog', 'golden-retriever', 'Golden Retriever', 'Social family dog; regular grooming and exercise.', 'large'),
  ('dog', 'mixed-breed', 'Mixed Breed Dog', 'Genetic diversity; tailor care to observed size and energy.', 'variable'),
  ('cat', 'domestic-shorthair', 'Domestic Shorthair', 'Common adaptable house cat.', 'medium'),
  ('cat', 'maine-coon', 'Maine Coon', 'Large, long-haired cat; cardiac screening may be advised.', 'large'),
  ('bird', 'parakeet', 'Parakeet (Budgie)', 'Small parrot; seed-only diets are insufficient long-term.', 'small'),
  ('bird', 'cockatiel', 'Cockatiel', 'Gentle companion bird; social and vocal.', 'small'),
  ('rabbit', 'holland-lop', 'Holland Lop', 'Small lop-eared rabbit; hay-based diet is critical.', 'small'),
  ('reptile', 'bearded-dragon', 'Bearded Dragon', 'Popular lizard; requires UVB and controlled heat gradient.', 'medium')
) as v(species_slug, slug, name, description, size_category)
where s.slug = v.species_slug
on conflict (species_id, slug) do nothing;

-- ---------------------------------------------------------------------------
-- Seed: species-level care guidelines

insert into public.care_guidelines (
  species_id, breed_id, lifespan, diet, exercise_needs,
  common_conditions, vaccination_guidance, seasonal_considerations, source, status
)
select
  s.id,
  null,
  v.lifespan::jsonb,
  v.diet::jsonb,
  v.exercise_needs::jsonb,
  v.common_conditions::jsonb,
  v.vaccination_guidance::jsonb,
  v.seasonal_considerations::jsonb,
  'PetClues Species Intelligence v1',
  'published'
from public.species s
cross join (values
  ('dog',
    '{"min_years":10,"max_years":13,"notes":"Varies widely by size; giant breeds often shorter."}',
    '{"summary":"Complete, balanced commercial or vet-formulated diet matched to life stage.","feeding_frequency":"Typically 2 meals/day for adults.","restrictions":["Chocolate","Grapes/raisins","Xylitol","Onions/garlic"],"notes":"Adjust calories for neuter status and activity."}',
    '{"level":"moderate","minutes_per_day":45,"activities":["Walks","Fetch","Sniff enrichment"],"notes":"Puppies need controlled exercise to protect joints."}',
    '[{"name":"Dental disease","description":"Plaque leads to pain and systemic infection.","prevalence":"common"},{"name":"Obesity","description":"Excess weight worsens arthritis and metabolic disease.","prevalence":"common"},{"name":"Ear infections","description":"Especially in floppy-eared breeds.","prevalence":"occasional"}]',
    '{"core":["DHPP (distemper combo)","Rabies"],"optional":["Bordetella","Leptospirosis","Lyme (region-dependent)"],"schedule_notes":"Puppy series every 3–4 weeks until ~16 weeks; adult boosters per vet protocol.","booster_notes":"Titers or boosters per local law and lifestyle."}',
    '[{"season":"summer","title":"Heat safety","considerations":["Avoid hot pavement","Provide shade and water","Never leave in parked car"]},{"season":"winter","title":"Cold & toxins","considerations":["Salt on paws can irritate","Antifreeze is highly toxic"]}]'
  ),
  ('cat',
    '{"min_years":12,"max_years":18,"notes":"Indoor cats often live longer with routine preventive care."}',
    '{"summary":"High-protein, moisture-rich diet; wet food helps hydration.","feeding_frequency":"2–4 small meals or measured free-feed per vet advice.","restrictions":["Lilies (toxic)","Onions","Raw dough"],"notes":"Obesity is common; use puzzle feeders."}',
    '{"level":"low","minutes_per_day":20,"activities":["Interactive play","Vertical climbing"],"notes":"Brief intense play sessions mimic hunting."}',
    '[{"name":"Chronic kidney disease","description":"Common in seniors; early labs help.","prevalence":"common"},{"name":"Dental disease","description":"Painful; affects eating and kidneys.","prevalence":"common"},{"name":"Hyperthyroidism","description":"Weight loss despite appetite in older cats.","prevalence":"occasional"}]',
    '{"core":["FVRCP","Rabies"],"optional":["FeLV for at-risk cats"],"schedule_notes":"Kitten series then boosters; indoor-only cats may have reduced exposure risk.","booster_notes":"Discuss FeLV/FIV testing for new adoptees."}',
    '[{"season":"year-round","title":"Litter & environment","considerations":["One more box than cats","Reduce stress from multi-cat conflict","Hiding spots reduce anxiety"]}]'
  ),
  ('bird',
    '{"min_years":5,"max_years":15,"notes":"Lifespan varies greatly by species."}',
    '{"summary":"Pelleted base diet plus vegetables; limit seed mixes.","feeding_frequency":"Fresh food daily; remove spoilage within hours.","restrictions":["Avocado","Chocolate","Teflon fumes"],"notes":"Calcium and vitamin A deficiencies are common with seed-only diets."}',
    '{"level":"moderate","minutes_per_day":30,"activities":["Flight time in safe room","Foraging toys"],"notes":"Cage size must allow wing spread and movement."}',
    '[{"name":"Respiratory illness","description":"Drafts, smoke, and poor air quality are triggers.","prevalence":"common"},{"name":"Liver disease","description":"Often linked to poor diet.","prevalence":"occasional"},{"name":"Egg binding","description":"Risk in females; environmental and diet factors.","prevalence":"occasional"}]',
    '{"core":[],"optional":[],"schedule_notes":"No standard dog/cat vaccines; annual avian wellness exam recommended.","booster_notes":"Discuss chlamydia/psittacosis testing if symptomatic."}',
    '[{"season":"winter","title":"Dry air & heating","considerations":["Humidify room slightly","Avoid drafts near cage"]},{"season":"summer","title":"Overheating","considerations":["No direct sun on cage","Ensure fresh water"]}]'
  ),
  ('rabbit',
    '{"min_years":8,"max_years":12,"notes":"Spayed/neutered rabbits often live longer."}',
    '{"summary":"Unlimited timothy hay; limited pellets; leafy greens daily.","feeding_frequency":"Hay always available; measured pellets.","restrictions":["Iceberg lettuce","High-starch treats","Avocado"],"notes":"GI stasis is an emergency - appetite loss needs same-day vet care."}',
    '{"level":"moderate","minutes_per_day":30,"activities":["Hop space","Tunnel play","Chew toys"],"notes":"Need safe flooring; avoid wire-only cages."}',
    '[{"name":"Dental malocclusion","description":"Teeth grow continuously; hay wear is critical.","prevalence":"common"},{"name":"GI stasis","description":"Slow gut motility; painful and life-threatening.","prevalence":"common"},{"name":"E. cuniculi","description":"Neurologic and kidney parasite; discuss testing.","prevalence":"occasional"}]',
    '{"core":["RHDV2 where endemic"],"optional":[],"schedule_notes":"RHDV2 vaccination per regional vet guidance; no routine dog/cat vaccines.","booster_notes":"Annual wellness including teeth and weight."}',
    '[{"season":"summer","title":"Heat stress","considerations":["Rabbits overheat easily","Frozen water bottles in extreme heat","Indoor housing preferred"]}]'
  ),
  ('reptile',
    '{"min_years":8,"max_years":12,"notes":"Highly species-dependent; bearded dragons commonly 8–12 years."}',
    '{"summary":"Insect + plant offerings per species; calcium with D3 when UVB is inadequate.","feeding_frequency":"Juveniles daily; adults often every 1–2 days.","restrictions":["Wild-caught insects with pesticides"],"notes":"Gut-load insects before feeding."}',
    '{"level":"low","minutes_per_day":15,"activities":["Climbing","Exploration in secure enclosure"],"notes":"Enrichment via habitat complexity, not long walks."}',
    '[{"name":"Metabolic bone disease","description":"UVB/lighting and calcium balance prevent MBD.","prevalence":"common"},{"name":"Impaction","description":"Substrate ingestion or oversized prey.","prevalence":"occasional"},{"name":"Parasites","description":"Fecal exams on new acquisitions.","prevalence":"occasional"}]',
    '{"core":[],"optional":[],"schedule_notes":"No mammalian vaccines; parasite screens and husbandry review at wellness visits.","booster_notes":"Log temps, humidity, and UVB bulb replacement dates."}',
    '[{"season":"year-round","title":"Habitat stability","considerations":["Replace UVB bulbs per manufacturer schedule","Night drop temperatures species-specific","Quarantine new animals"]}]'
  )
) as v(
  species_slug, lifespan, diet, exercise_needs,
  common_conditions, vaccination_guidance, seasonal_considerations
)
where s.slug = v.species_slug
  and not exists (
    select 1 from public.care_guidelines cg
    where cg.species_id = s.id and cg.breed_id is null
  );

-- Breed-specific overrides (Labrador, Domestic Shorthair, Bearded Dragon)

insert into public.care_guidelines (
  species_id, breed_id, lifespan, diet, exercise_needs,
  common_conditions, vaccination_guidance, seasonal_considerations, source, status
)
select
  s.id,
  b.id,
  v.lifespan::jsonb,
  v.diet::jsonb,
  v.exercise_needs::jsonb,
  v.common_conditions::jsonb,
  v.vaccination_guidance::jsonb,
  v.seasonal_considerations::jsonb,
  'PetClues Species Intelligence v1',
  'published'
from (values
  ('dog', 'labrador-retriever',
    '{"min_years":10,"max_years":12,"notes":"Prone to obesity; lifespan linked to lean body condition."}',
    '{"summary":"Large-breed appropriate diet; monitor calories strictly.","feeding_frequency":"2 meals/day; weigh monthly.","restrictions":["Table scraps","Excess treats"],"notes":"Use slow feeders to reduce bloat risk if recommended by vet."}',
    '{"level":"high","minutes_per_day":60,"activities":["Swimming","Retrieving","Long walks"],"notes":"Under-exercise contributes to destructive behavior."}',
    '[{"name":"Hip dysplasia","description":"Screening (OFA/PennHIP) advised for breeding lines.","prevalence":"common"},{"name":"Exercise-induced collapse","description":"Genetic in some lines; avoid overheating.","prevalence":"occasional"},{"name":"Obesity","description":"Very common; joint stress multiplier.","prevalence":"common"}]',
    '{"core":["DHPP","Rabies"],"optional":["Bordetella if daycare/boarding"],"schedule_notes":"Same core schedule as species; lifestyle drives optional vaccines.","booster_notes":null}',
    '[{"season":"summer","title":"Swimming safety","considerations":["Rinse chlorine after pools","Watch for ear infections after water"]}]'
  ),
  ('cat', 'domestic-shorthair',
    '{"min_years":12,"max_years":16,"notes":"Indoor DSH often exceeds outdoor averages."}',
    '{"summary":"Portion-controlled wet + dry or all-wet per vet.","feeding_frequency":"Measured meals 2x/day.","restrictions":null,"notes":"Hairballs managed with grooming and fiber."}',
    '{"level":"low","minutes_per_day":15,"activities":["Wand toys","Laser (always end with catch toy)"],"notes":null}',
    '[{"name":"Urinary issues","description":"Stress and hydration affect FLUTD risk.","prevalence":"occasional"}]',
    '{"core":["FVRCP","Rabies"],"optional":[],"schedule_notes":"Indoor cats: discuss reduced exposure protocol with vet.","booster_notes":null}',
    '[]'
  ),
  ('reptile', 'bearded-dragon',
    '{"min_years":8,"max_years":12,"notes":null}',
    '{"summary":"Gut-loaded insects + salad greens; calcium dusting schedule per age.","feeding_frequency":"Juveniles: insects daily; adults: insects 2–3x/week + daily greens.","restrictions":["Fireflies (toxic)","Wild insects"],"notes":"UVB 10–12 hours; replace bulbs on schedule."}',
    '{"level":"low","minutes_per_day":10,"activities":["Hand-walk in safe area","Climbing branches"],"notes":"Brumation may reduce appetite seasonally - confirm with vet."}',
    '[{"name":"Impaction","description":"Loose substrate risk; use tile/paper or supervised loose substrate.","prevalence":"common"},{"name":"MBD","description":"Weak jaw/legs if UVB/calcium insufficient.","prevalence":"common"}]',
    '{"core":[],"optional":[],"schedule_notes":"Fecal parasite exam annually.","booster_notes":null}',
    '[{"season":"winter","title":"Brumation awareness","considerations":["Appetite drop may be normal","Weigh weekly","Vet check if lethargy is prolonged"]}]'
  )
) as v(species_slug, breed_slug, lifespan, diet, exercise_needs, common_conditions, vaccination_guidance, seasonal_considerations)
join public.species s on s.slug = v.species_slug
join public.breeds b on b.species_id = s.id and b.slug = v.breed_slug
where not exists (
  select 1 from public.care_guidelines cg
  where cg.breed_id = b.id
);
