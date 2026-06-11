-- Fix pet-documents storage RLS for all users.
--
-- Bug: security_hardening policies used unqualified `name` inside a pets EXISTS
-- subquery. Postgres resolves that to pets.name (e.g. "Luna"), not the storage
-- object path, so every upload fails RLS. Qualify as storage.objects.name.
-- See: https://github.com/supabase/supabase/issues/25992

drop policy if exists "Users can upload own pet document files" on storage.objects;
drop policy if exists "Users can read own pet document files" on storage.objects;
drop policy if exists "Users can delete own pet document files" on storage.objects;

create policy "Users can read own pet document files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'pet-documents'
    and (storage.foldername(storage.objects.name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.pets
      where pets.id::text = (storage.foldername(storage.objects.name))[2]
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can upload own pet document files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'pet-documents'
    and (storage.foldername(storage.objects.name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.pets
      where pets.id::text = (storage.foldername(storage.objects.name))[2]
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can delete own pet document files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'pet-documents'
    and (storage.foldername(storage.objects.name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.pets
      where pets.id::text = (storage.foldername(storage.objects.name))[2]
        and pets.owner_id = auth.uid()
    )
  );
