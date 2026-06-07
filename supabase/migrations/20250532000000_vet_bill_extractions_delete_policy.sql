-- Allow users to delete their own vet bill extraction reports
create policy "Users can delete own vet bill extractions"
  on public.vet_bill_extractions
  for delete
  using (user_id = auth.uid());
