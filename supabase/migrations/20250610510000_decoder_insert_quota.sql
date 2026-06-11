-- Vet bill extractions: enforce decode quotas on direct client inserts
-- (Edge function uses service role; this blocks quota bypass via client SDK)

create or replace function public.enforce_decoder_extraction_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plan text;
  lifetime_limit integer;
  monthly_limit integer;
  lifetime_count integer;
  monthly_count integer;
  month_start timestamptz;
begin
  plan := public.resolve_commercial_plan(new.user_id);

  if plan = 'free' then
    lifetime_limit := 2;
    select count(*) into lifetime_count
    from public.vet_bill_extractions
    where user_id = new.user_id;

    if lifetime_count >= lifetime_limit then
      raise exception 'Lifetime decode limit reached. Upgrade your plan for more.'
        using errcode = 'P0001';
    end if;
  elsif plan = 'plus' then
    monthly_limit := 5;
    month_start := date_trunc('month', now());
    select count(*) into monthly_count
    from public.vet_bill_extractions
    where user_id = new.user_id
      and created_at >= month_start;

    if monthly_count >= monthly_limit then
      raise exception 'Monthly decode limit reached. Upgrade your plan for more.'
        using errcode = 'P0001';
    end if;
  elsif plan = 'pro' then
    monthly_limit := 30;
    month_start := date_trunc('month', now());
    select count(*) into monthly_count
    from public.vet_bill_extractions
    where user_id = new.user_id
      and created_at >= month_start;

    if monthly_count >= monthly_limit then
      raise exception 'Monthly decode limit reached. Upgrade your plan for more.'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_decoder_extraction_limit on public.vet_bill_extractions;

create trigger enforce_decoder_extraction_limit
  before insert on public.vet_bill_extractions
  for each row
  execute function public.enforce_decoder_extraction_limit();
