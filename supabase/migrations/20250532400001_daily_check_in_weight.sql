-- Optional weight capture on daily check-ins

alter table public.daily_check_ins
  add column if not exists weight_kg numeric(6, 2);
