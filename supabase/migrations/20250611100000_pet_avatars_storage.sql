-- Pet profile avatars - public read, owner-scoped write
-- Path format: {owner_id}/{pet_id}/avatar.{ext}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-avatars',
  'pet-avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read pet avatars" on storage.objects;
drop policy if exists "Users upload own pet avatars" on storage.objects;
drop policy if exists "Users update own pet avatars" on storage.objects;
drop policy if exists "Users delete own pet avatars" on storage.objects;

create policy "Public read pet avatars"
  on storage.objects
  for select
  using (bucket_id = 'pet-avatars');

create policy "Users upload own pet avatars"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'pet-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own pet avatars"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'pet-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'pet-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own pet avatars"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'pet-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
