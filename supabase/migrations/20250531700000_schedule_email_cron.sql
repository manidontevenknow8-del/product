-- Daily email processor cron (08:00 UTC)
-- Requires pg_cron + pg_net (enable in Dashboard → Database → Extensions if needed)

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
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
