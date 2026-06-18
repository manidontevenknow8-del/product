export type DogBreedSeed = {
  slug: string;
  name: string;
  size: 'small' | 'medium' | 'large' | 'giant';
  lifestyle: 'active' | 'moderate' | 'low';
  healthFocus: string;
};

export const DOG_BREED_SEEDS: DogBreedSeed[] = [
  { slug: 'golden-retriever', name: 'Golden Retriever', size: 'large', lifestyle: 'active', healthFocus: 'hip dysplasia and cardiac screening' },
  { slug: 'labrador-retriever', name: 'Labrador Retriever', size: 'large', lifestyle: 'active', healthFocus: 'obesity-related joint stress' },
  { slug: 'french-bulldog', name: 'French Bulldog', size: 'small', lifestyle: 'low', healthFocus: 'brachycephalic airway and heat sensitivity' },
  { slug: 'german-shepherd', name: 'German Shepherd', size: 'large', lifestyle: 'active', healthFocus: 'hip and elbow dysplasia' },
  { slug: 'poodle', name: 'Poodle', size: 'medium', lifestyle: 'moderate', healthFocus: 'ear infections and dental disease' },
  { slug: 'dachshund', name: 'Dachshund', size: 'small', lifestyle: 'moderate', healthFocus: 'intervertebral disc disease' },
  { slug: 'beagle', name: 'Beagle', size: 'medium', lifestyle: 'active', healthFocus: 'weight management and ear care' },
  { slug: 'rottweiler', name: 'Rottweiler', size: 'large', lifestyle: 'moderate', healthFocus: 'orthopedic and cardiac screening' },
  { slug: 'yorkshire-terrier', name: 'Yorkshire Terrier', size: 'small', lifestyle: 'low', healthFocus: 'dental disease and tracheal sensitivity' },
  { slug: 'boxer', name: 'Boxer', size: 'large', lifestyle: 'active', healthFocus: 'cardiac screening and cancer awareness' },
  { slug: 'siberian-husky', name: 'Siberian Husky', size: 'medium', lifestyle: 'active', healthFocus: 'exercise needs and zinc-responsive dermatosis' },
  { slug: 'australian-shepherd', name: 'Australian Shepherd', size: 'medium', lifestyle: 'active', healthFocus: 'MDR1 drug sensitivity and eye disorders' },
  { slug: 'cavalier-king-charles-spaniel', name: 'Cavalier King Charles Spaniel', size: 'small', lifestyle: 'low', healthFocus: 'mitral valve disease' },
  { slug: 'shih-tzu', name: 'Shih Tzu', size: 'small', lifestyle: 'low', healthFocus: 'brachycephalic airway and eye irritation' },
  { slug: 'boston-terrier', name: 'Boston Terrier', size: 'small', lifestyle: 'moderate', healthFocus: 'BOAS and patellar luxation' },
  { slug: 'great-dane', name: 'Great Dane', size: 'giant', lifestyle: 'moderate', healthFocus: 'bloat risk and joint growth timing' },
  { slug: 'border-collie', name: 'Border Collie', size: 'medium', lifestyle: 'active', healthFocus: 'MDR1 testing and high exercise needs' },
  { slug: 'chihuahua', name: 'Chihuahua', size: 'small', lifestyle: 'low', healthFocus: 'dental disease and hypoglycemia in puppies' },
  { slug: 'bernese-mountain-dog', name: 'Bernese Mountain Dog', size: 'giant', lifestyle: 'moderate', healthFocus: 'cancer predisposition and joint health' },
  { slug: 'mixed-breed-dog', name: 'Mixed Breed Dog', size: 'medium', lifestyle: 'moderate', healthFocus: 'individual risk based on size and lifestyle' },
];
