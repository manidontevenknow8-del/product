export type CatBreedSeed = {
  slug: string;
  name: string;
  lifestyle: 'indoor' | 'indoor-outdoor' | 'active';
  healthFocus: string;
};

export const CAT_BREED_SEEDS: CatBreedSeed[] = [
  { slug: 'domestic-shorthair', name: 'Domestic Shorthair', lifestyle: 'indoor', healthFocus: 'weight management and dental care' },
  { slug: 'maine-coon', name: 'Maine Coon', lifestyle: 'indoor', healthFocus: 'hypertrophic cardiomyopathy screening' },
  { slug: 'siamese', name: 'Siamese', lifestyle: 'active', healthFocus: 'dental disease and respiratory sensitivity' },
  { slug: 'ragdoll', name: 'Ragdoll', lifestyle: 'indoor', healthFocus: 'HCM screening and obesity prevention' },
  { slug: 'persian', name: 'Persian', lifestyle: 'indoor', healthFocus: 'brachycephalic airway and eye care' },
  { slug: 'bengal', name: 'Bengal', lifestyle: 'active', healthFocus: 'high activity needs and GI sensitivity' },
  { slug: 'british-shorthair', name: 'British Shorthair', lifestyle: 'indoor', healthFocus: 'weight control and cardiac screening' },
  { slug: 'sphynx', name: 'Sphynx', lifestyle: 'indoor', healthFocus: 'skin care and temperature regulation' },
  { slug: 'abyssinian', name: 'Abyssinian', lifestyle: 'active', healthFocus: 'dental disease and kidney monitoring in seniors' },
  { slug: 'scottish-fold', name: 'Scottish Fold', lifestyle: 'indoor', healthFocus: 'cartilage-related joint issues' },
  { slug: 'russian-blue', name: 'Russian Blue', lifestyle: 'indoor', healthFocus: 'stress-sensitive GI and bladder health' },
  { slug: 'devon-rex', name: 'Devon Rex', lifestyle: 'indoor', healthFocus: 'skin and ear maintenance' },
  { slug: 'norwegian-forest-cat', name: 'Norwegian Forest Cat', lifestyle: 'indoor-outdoor', healthFocus: 'HCM screening and coat-related matting' },
  { slug: 'savannah', name: 'Savannah', lifestyle: 'active', healthFocus: 'high enrichment needs and hybrid regulations' },
  { slug: 'mixed-breed-cat', name: 'Mixed Breed Cat', lifestyle: 'indoor', healthFocus: 'individual risk based on lifestyle exposure' },
];
