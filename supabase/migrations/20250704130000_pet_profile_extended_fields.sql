-- Pet profile fields shown on Records (diet, coat, microchip, conditions notes)

alter table public.pets
  add column if not exists diet text,
  add column if not exists coat_color text,
  add column if not exists microchip_id text,
  add column if not exists conditions_notes text;

comment on column public.pets.diet is 'Free-text diet description (food brand, type, schedule).';
comment on column public.pets.coat_color is 'Coat or fur color for identification.';
comment on column public.pets.microchip_id is 'ISO microchip number when implanted.';
comment on column public.pets.conditions_notes is 'Owner-entered chronic conditions and care notes.';
