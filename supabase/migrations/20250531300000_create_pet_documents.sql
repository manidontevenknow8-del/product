-- PetClues: private document storage bucket + pet_documents metadata table
-- Run via Supabase CLI: supabase db push

-- Phase 1: Storage bucket (private, authenticated access only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-documents',
  'pet-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS: path format {owner_id}/{pet_id}/{document_id}/{file_name}
create policy "Users can read own pet document files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'pet-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload own pet document files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'pet-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own pet document files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'pet-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Phase 2: pet_documents metadata table
create table if not exists public.pet_documents (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  file_name text not null,
  file_type text not null,
  storage_path text not null unique,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists pet_documents_pet_id_idx on public.pet_documents (pet_id);
create index if not exists pet_documents_uploaded_at_idx on public.pet_documents (uploaded_at desc);

alter table public.pet_documents enable row level security;

create policy "Users can read documents for own pets"
  on public.pet_documents
  for select
  using (
    exists (
      select 1
      from public.pets
      where pets.id = pet_documents.pet_id
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can insert documents for own pets"
  on public.pet_documents
  for insert
  with check (
    exists (
      select 1
      from public.pets
      where pets.id = pet_id
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can delete documents for own pets"
  on public.pet_documents
  for delete
  using (
    exists (
      select 1
      from public.pets
      where pets.id = pet_documents.pet_id
        and pets.owner_id = auth.uid()
    )
  );
