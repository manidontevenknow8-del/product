-- Public QR triage profile: returns ONLY high-urgency fields (no insurance, meds, vault, billing).

create or replace function public.get_emergency_triage_public(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  result jsonb;
  fields jsonb;
begin
  if p_token is null or length(trim(p_token)) < 8 then
    return null;
  end if;

  select
    ep.critical_fields_json,
    jsonb_build_object(
      'petName', p.name,
      'species', p.species,
      'breed', coalesce(p.breed, ''),
      'photoUrl', p.photo_url,
      'ownerPhonePrimary', nullif(trim(coalesce(ep.critical_fields_json->>'ownerPhonePrimary', '')), ''),
      'ownerPhoneSecondary', nullif(trim(coalesce(ep.critical_fields_json->>'ownerPhoneSecondary', '')), ''),
      'severeAllergies', coalesce(ep.critical_fields_json->'allergies', '[]'::jsonb),
      'rabiesTagNumber', nullif(trim(coalesce(ep.critical_fields_json->>'rabiesTagNumber', '')), ''),
      'vetName', nullif(trim(coalesce(ep.critical_fields_json->>'vetName', '')), ''),
      'vetPhone', nullif(trim(coalesce(ep.critical_fields_json->>'vetPhone', '')), ''),
      'updatedAt', ep.updated_at
    )
  into fields, result
  from public.emergency_passports ep
  inner join public.pets p on p.id = ep.pet_id
  where ep.public_token = trim(p_token)
    and ep.revoked_at is null;

  return result;
end;
$$;

revoke all on function public.get_emergency_triage_public(text) from public;
grant execute on function public.get_emergency_triage_public(text) to anon, authenticated, service_role;

comment on function public.get_emergency_triage_public(text) is
  'Token-gated QR triage profile. Whitelists pet identity, owner phones, allergies, rabies tag, and vet contact. Excludes insurance, medications, documents, and billing.';
