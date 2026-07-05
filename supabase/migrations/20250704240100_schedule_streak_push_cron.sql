-- Hourly streak-at-risk push processor (checks each subscriber's local evening window).

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.unschedule(jobid)
from cron.job
where jobname = 'petclues-process-streak-risk-push-hourly';

select cron.schedule(
  'petclues-process-streak-risk-push-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://jjrmxdxswelusrtcvsjf.supabase.co/functions/v1/process-streak-risk-push',
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
