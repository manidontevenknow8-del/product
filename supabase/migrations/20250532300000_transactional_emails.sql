-- Transactional email types: welcome, founding confirmation, premium upgrade

alter table public.email_send_log alter column user_id drop not null;

alter table public.email_jobs drop constraint if exists email_jobs_email_type_check;

alter table public.email_jobs add constraint email_jobs_email_type_check check (
  email_type in (
    'upcoming_reminder',
    'overdue_reminder',
    'weekly_pet_summary',
    'welcome',
    'founding_member_confirmation',
    'premium_upgrade'
  )
);
