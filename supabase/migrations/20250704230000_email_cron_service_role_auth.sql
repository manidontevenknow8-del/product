-- Fix scheduled email processor auth: pass service role key from Vault when available.
-- Store your service role key in Dashboard → Project Settings → Vault as `service_role_key`
-- (or set CRON_SECRET on the edge function and use `petclues_cron_secret` in Vault instead).

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.unschedule(jobid)
from cron.job
where jobname = 'petclues-process-email-jobs-daily';

select cron.schedule(
  'petclues-process-email-jobs-daily',
  '0 8 * * *',
  $$
  select net.http_post(
    url := 'https://jjrmxdxswelusrtcvsjf.supabase.co/functions/v1/process-email-jobs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(
        (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key' limit 1),
        ''
      )
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

comment on extension pg_cron is 'Daily 08:00 UTC: reminder emails + Sunday weekly pet digest via process-email-jobs';
