-- Track which household member logged each daily check-in (for shared-home attribution).

alter table public.daily_check_ins
  add column if not exists logged_by_user_id uuid references auth.users (id) on delete set null;

update public.daily_check_ins dci
set logged_by_user_id = p.owner_id
from public.pets p
where p.id = dci.pet_id
  and dci.logged_by_user_id is null;

alter table public.daily_check_ins
  alter column logged_by_user_id set default auth.uid();

create or replace function public.set_daily_check_in_logged_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    new.logged_by_user_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists daily_check_ins_set_logged_by on public.daily_check_ins;

create trigger daily_check_ins_set_logged_by
  before insert or update on public.daily_check_ins
  for each row
  execute function public.set_daily_check_in_logged_by();
