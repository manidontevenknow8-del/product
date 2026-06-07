-- PetClues: link auto-created reminders to source health records (dedup)
alter table public.reminders
  add column if not exists source_health_record_id uuid
  references public.health_records (id) on delete set null;

create unique index if not exists reminders_source_health_record_id_unique
  on public.reminders (source_health_record_id)
  where source_health_record_id is not null;
