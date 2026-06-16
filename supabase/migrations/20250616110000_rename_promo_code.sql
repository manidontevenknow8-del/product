-- Rename live promo code to shorter format (migration already seeded PETCLUES-6QDZ-LC4A).

update public.promo_codes
set code = '6QDZ-LC4A',
    description = '1 month free Pro trial — marketing promo'
where code = 'PETCLUES-6QDZ-LC4A';
