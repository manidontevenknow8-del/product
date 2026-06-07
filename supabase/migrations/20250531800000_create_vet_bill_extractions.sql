-- PetClues Vet Bill Decoder — extraction history (AI, user-reviewed)
create table if not exists public.vet_bill_extractions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  document_id uuid not null references public.pet_documents (id) on delete cascade,
  status text not null default 'pending_review' check (
    status in ('pending_review', 'approved', 'partially_approved', 'rejected')
  ),
  extraction_result jsonb not null,
  approved_snapshot jsonb,
  model_used text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists vet_bill_extractions_pet_id_idx
  on public.vet_bill_extractions (pet_id);

create index if not exists vet_bill_extractions_document_id_idx
  on public.vet_bill_extractions (document_id);

create index if not exists vet_bill_extractions_user_id_idx
  on public.vet_bill_extractions (user_id);

alter table public.vet_bill_extractions enable row level security;

create policy "Users can read own vet bill extractions"
  on public.vet_bill_extractions
  for select
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.pets
      where pets.id = vet_bill_extractions.pet_id
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can insert own vet bill extractions"
  on public.vet_bill_extractions
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.pets
      where pets.id = pet_id
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can update own vet bill extractions"
  on public.vet_bill_extractions
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
