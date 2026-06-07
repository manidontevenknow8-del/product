-- Replace pending_review with saved (report stored; timeline sync optional)
update public.vet_bill_extractions
set status = 'saved'
where status = 'pending_review';

alter table public.vet_bill_extractions
  drop constraint if exists vet_bill_extractions_status_check;

alter table public.vet_bill_extractions
  add constraint vet_bill_extractions_status_check
  check (status in ('saved', 'approved', 'partially_approved', 'rejected'));

alter table public.vet_bill_extractions
  alter column status set default 'saved';
