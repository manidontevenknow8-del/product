/**
 * Programmatic SEO matrix: 200 top dog breeds × 15 lifecycle/diet stages = 3,000 URLs.
 * Route shape: `/guides/:breed/lifecycle/:stage`
 */
export type DogSizeClass = 'toy' | 'small' | 'medium' | 'large' | 'giant';

export type LifecycleBreed = {
  slug: string;
  name: string;
  size: DogSizeClass;
  group: string;
  adultWeight: string;
  lifespanYears: string;
  healthFocus: string;
  aliases: readonly string[];
};

export type LifecycleStageCategory = 'puppy' | 'adult' | 'senior' | 'diet' | 'recovery';

export type LifecycleStage = {
  slug: string;
  label: string;
  searchIntent: string;
  category: LifecycleStageCategory;
  kicker: string;
};

export type LifecycleMatrixEntry = {
  breed: LifecycleBreed;
  stage: LifecycleStage;
  path: string;
};

export const EXPECTED_BREED_COUNT = 200;
export const EXPECTED_STAGE_COUNT = 15;
export const EXPECTED_LIFECYCLE_URL_COUNT = 3_000;

export const TOP_DOG_BREEDS: readonly LifecycleBreed[] = [
  { slug: 'labrador-retriever', name: 'Labrador Retriever', size: 'large', group: 'sporting', adultWeight: '55-80 lb', lifespanYears: '10-12', healthFocus: 'obesity-related joint stress', aliases: [] },
  { slug: 'french-bulldog', name: 'French Bulldog', size: 'small', group: 'non-sporting', adultWeight: '16-28 lb', lifespanYears: '10-12', healthFocus: 'brachycephalic airway and heat sensitivity', aliases: [] },
  { slug: 'golden-retriever', name: 'Golden Retriever', size: 'large', group: 'sporting', adultWeight: '55-75 lb', lifespanYears: '10-12', healthFocus: 'hip dysplasia and cardiac screening', aliases: [] },
  { slug: 'german-shepherd', name: 'German Shepherd', size: 'large', group: 'herding', adultWeight: '50-90 lb', lifespanYears: '9-13', healthFocus: 'hip and elbow dysplasia', aliases: ['alsatian'] },
  { slug: 'poodle', name: 'Poodle', size: 'medium', group: 'non-sporting', adultWeight: '40-70 lb', lifespanYears: '12-15', healthFocus: 'ear infections and dental disease', aliases: [] },
  { slug: 'dachshund', name: 'Dachshund', size: 'small', group: 'hound', adultWeight: '16-32 lb', lifespanYears: '12-16', healthFocus: 'intervertebral disc disease', aliases: [] },
  { slug: 'english-bulldog', name: 'English Bulldog', size: 'medium', group: 'non-sporting', adultWeight: '40-50 lb', lifespanYears: '8-10', healthFocus: 'BOAS and skin-fold care', aliases: ['bulldog'] },
  { slug: 'beagle', name: 'Beagle', size: 'medium', group: 'hound', adultWeight: '20-30 lb', lifespanYears: '12-15', healthFocus: 'weight management and ear care', aliases: [] },
  { slug: 'rottweiler', name: 'Rottweiler', size: 'large', group: 'working', adultWeight: '80-135 lb', lifespanYears: '9-10', healthFocus: 'orthopedic and cardiac screening', aliases: [] },
  { slug: 'german-shorthaired-pointer', name: 'German Shorthaired Pointer', size: 'large', group: 'sporting', adultWeight: '45-70 lb', lifespanYears: '10-12', healthFocus: 'high-drive fueling and hip screening', aliases: [] },
  { slug: 'pembroke-welsh-corgi', name: 'Pembroke Welsh Corgi', size: 'small', group: 'herding', adultWeight: '22-30 lb', lifespanYears: '12-13', healthFocus: 'IVDD and degenerative myelopathy', aliases: ['corgi'] },
  { slug: 'australian-shepherd', name: 'Australian Shepherd', size: 'medium', group: 'herding', adultWeight: '40-65 lb', lifespanYears: '12-15', healthFocus: 'MDR1 drug sensitivity and eye disorders', aliases: [] },
  { slug: 'yorkshire-terrier', name: 'Yorkshire Terrier', size: 'toy', group: 'toy', adultWeight: '4-7 lb', lifespanYears: '13-16', healthFocus: 'dental disease and tracheal sensitivity', aliases: [] },
  { slug: 'cavalier-king-charles-spaniel', name: 'Cavalier King Charles Spaniel', size: 'small', group: 'toy', adultWeight: '13-18 lb', lifespanYears: '9-14', healthFocus: 'mitral valve disease', aliases: [] },
  { slug: 'doberman-pinscher', name: 'Doberman Pinscher', size: 'large', group: 'working', adultWeight: '60-100 lb', lifespanYears: '10-13', healthFocus: 'dilated cardiomyopathy', aliases: [] },
  { slug: 'boxer', name: 'Boxer', size: 'large', group: 'working', adultWeight: '50-80 lb', lifespanYears: '10-12', healthFocus: 'cardiac screening and cancer awareness', aliases: [] },
  { slug: 'miniature-schnauzer', name: 'Miniature Schnauzer', size: 'small', group: 'terrier', adultWeight: '11-20 lb', lifespanYears: '12-15', healthFocus: 'pancreatitis and dental tartar', aliases: [] },
  { slug: 'cane-corso', name: 'Cane Corso', size: 'giant', group: 'working', adultWeight: '88-110 lb', lifespanYears: '9-12', healthFocus: 'hip dysplasia and gastric dilatation', aliases: [] },
  { slug: 'great-dane', name: 'Great Dane', size: 'giant', group: 'working', adultWeight: '110-175 lb', lifespanYears: '7-10', healthFocus: 'bloat risk and joint growth timing', aliases: [] },
  { slug: 'shih-tzu', name: 'Shih Tzu', size: 'toy', group: 'toy', adultWeight: '9-16 lb', lifespanYears: '10-18', healthFocus: 'brachycephalic airway and eye irritation', aliases: [] },
  { slug: 'siberian-husky', name: 'Siberian Husky', size: 'medium', group: 'working', adultWeight: '35-60 lb', lifespanYears: '12-14', healthFocus: 'exercise needs and zinc-responsive dermatosis', aliases: [] },
  { slug: 'bernese-mountain-dog', name: 'Bernese Mountain Dog', size: 'giant', group: 'working', adultWeight: '70-115 lb', lifespanYears: '7-10', healthFocus: 'cancer predisposition and joint health', aliases: [] },
  { slug: 'pomeranian', name: 'Pomeranian', size: 'toy', group: 'toy', adultWeight: '3-7 lb', lifespanYears: '12-16', healthFocus: 'tracheal collapse and dental crowding', aliases: [] },
  { slug: 'boston-terrier', name: 'Boston Terrier', size: 'small', group: 'non-sporting', adultWeight: '12-25 lb', lifespanYears: '11-13', healthFocus: 'BOAS and patellar luxation', aliases: [] },
  { slug: 'havanese', name: 'Havanese', size: 'small', group: 'toy', adultWeight: '7-13 lb', lifespanYears: '14-16', healthFocus: 'patellar luxation and heart murmurs', aliases: [] },
  { slug: 'shetland-sheepdog', name: 'Shetland Sheepdog', size: 'small', group: 'herding', adultWeight: '15-25 lb', lifespanYears: '12-14', healthFocus: 'MDR1 sensitivity and dermatomyositis', aliases: [] },
  { slug: 'brittany', name: 'Brittany', size: 'medium', group: 'sporting', adultWeight: '30-40 lb', lifespanYears: '12-14', healthFocus: 'hip dysplasia and ear infections', aliases: [] },
  { slug: 'english-springer-spaniel', name: 'English Springer Spaniel', size: 'medium', group: 'sporting', adultWeight: '40-50 lb', lifespanYears: '12-14', healthFocus: 'ear care and phosphofructokinase deficiency', aliases: [] },
  { slug: 'cocker-spaniel', name: 'Cocker Spaniel', size: 'medium', group: 'sporting', adultWeight: '20-30 lb', lifespanYears: '10-14', healthFocus: 'otitis and progressive retinal atrophy', aliases: [] },
  { slug: 'miniature-american-shepherd', name: 'Miniature American Shepherd', size: 'small', group: 'herding', adultWeight: '20-40 lb', lifespanYears: '12-13', healthFocus: 'MDR1 sensitivity and hip screening', aliases: [] },
  { slug: 'border-collie', name: 'Border Collie', size: 'medium', group: 'herding', adultWeight: '30-55 lb', lifespanYears: '12-15', healthFocus: 'MDR1 testing and high exercise needs', aliases: [] },
  { slug: 'pug', name: 'Pug', size: 'small', group: 'toy', adultWeight: '14-18 lb', lifespanYears: '13-15', healthFocus: 'BOAS and corneal injury risk', aliases: [] },
  { slug: 'vizsla', name: 'Vizsla', size: 'medium', group: 'sporting', adultWeight: '44-60 lb', lifespanYears: '12-14', healthFocus: 'lymphoma awareness and hip screening', aliases: [] },
  { slug: 'chihuahua', name: 'Chihuahua', size: 'toy', group: 'toy', adultWeight: '2-6 lb', lifespanYears: '14-16', healthFocus: 'dental disease and puppy hypoglycemia', aliases: [] },
  { slug: 'maltese', name: 'Maltese', size: 'toy', group: 'toy', adultWeight: '4-7 lb', lifespanYears: '12-15', healthFocus: 'tracheal collapse and white-dog shaker syndrome', aliases: [] },
  { slug: 'bichon-frise', name: 'Bichon Frise', size: 'small', group: 'non-sporting', adultWeight: '12-18 lb', lifespanYears: '14-15', healthFocus: 'allergies and patellar luxation', aliases: [] },
  { slug: 'belgian-malinois', name: 'Belgian Malinois', size: 'large', group: 'herding', adultWeight: '40-80 lb', lifespanYears: '14-16', healthFocus: 'high-drive fueling and hip screening', aliases: [] },
  { slug: 'weimaraner', name: 'Weimaraner', size: 'large', group: 'sporting', adultWeight: '55-90 lb', lifespanYears: '10-13', healthFocus: 'bloat risk and hypothyroidism', aliases: [] },
  { slug: 'rhodesian-ridgeback', name: 'Rhodesian Ridgeback', size: 'large', group: 'hound', adultWeight: '70-85 lb', lifespanYears: '10-12', healthFocus: 'dermoid sinus and hip dysplasia', aliases: [] },
  { slug: 'newfoundland', name: 'Newfoundland', size: 'giant', group: 'working', adultWeight: '100-150 lb', lifespanYears: '9-10', healthFocus: 'cardiac screening and hip dysplasia', aliases: [] },
  { slug: 'collie', name: 'Collie', size: 'large', group: 'herding', adultWeight: '50-75 lb', lifespanYears: '12-14', healthFocus: 'MDR1 sensitivity and collie eye anomaly', aliases: [] },
  { slug: 'shiba-inu', name: 'Shiba Inu', size: 'small', group: 'non-sporting', adultWeight: '17-23 lb', lifespanYears: '13-16', healthFocus: 'allergies and glaucoma risk', aliases: [] },
  { slug: 'west-highland-white-terrier', name: 'West Highland White Terrier', size: 'small', group: 'terrier', adultWeight: '15-20 lb', lifespanYears: '13-15', healthFocus: 'atopic dermatitis and pulmonary fibrosis', aliases: [] },
  { slug: 'basset-hound', name: 'Basset Hound', size: 'medium', group: 'hound', adultWeight: '40-65 lb', lifespanYears: '12-13', healthFocus: 'ear care, IVDD, and glaucoma', aliases: [] },
  { slug: 'portuguese-water-dog', name: 'Portuguese Water Dog', size: 'medium', group: 'working', adultWeight: '35-60 lb', lifespanYears: '11-13', healthFocus: 'hip dysplasia and storage disease screening', aliases: [] },
  { slug: 'irish-wolfhound', name: 'Irish Wolfhound', size: 'giant', group: 'hound', adultWeight: '105-180 lb', lifespanYears: '6-8', healthFocus: 'osteosarcoma and dilated cardiomyopathy', aliases: [] },
  { slug: 'scottish-terrier', name: 'Scottish Terrier', size: 'small', group: 'terrier', adultWeight: '18-22 lb', lifespanYears: '12-15', healthFocus: 'bladder cancer awareness and Cushing screening', aliases: [] },
  { slug: 'whippet', name: 'Whippet', size: 'medium', group: 'hound', adultWeight: '25-40 lb', lifespanYears: '12-15', healthFocus: 'anesthesia sensitivity and heart screening', aliases: [] },
  { slug: 'soft-coated-wheaten-terrier', name: 'Soft Coated Wheaten Terrier', size: 'medium', group: 'terrier', adultWeight: '30-40 lb', lifespanYears: '12-14', healthFocus: 'protein-losing enteropathy and renal disease', aliases: [] },
  { slug: 'italian-greyhound', name: 'Italian Greyhound', size: 'toy', group: 'toy', adultWeight: '7-14 lb', lifespanYears: '14-15', healthFocus: 'fracture risk and dental crowding', aliases: [] },
  { slug: 'mastiff', name: 'Mastiff', size: 'giant', group: 'working', adultWeight: '120-230 lb', lifespanYears: '6-10', healthFocus: 'joint growth timing and gastric dilatation', aliases: [] },
  { slug: 'australian-cattle-dog', name: 'Australian Cattle Dog', size: 'medium', group: 'herding', adultWeight: '35-50 lb', lifespanYears: '12-16', healthFocus: 'progressive retinal atrophy and deafness', aliases: [] },
  { slug: 'saint-bernard', name: 'Saint Bernard', size: 'giant', group: 'working', adultWeight: '120-180 lb', lifespanYears: '8-10', healthFocus: 'bloat, hips, and osteosarcoma risk', aliases: [] },
  { slug: 'samoyed', name: 'Samoyed', size: 'large', group: 'working', adultWeight: '35-65 lb', lifespanYears: '12-13', healthFocus: 'diabetes and hip dysplasia', aliases: [] },
  { slug: 'akita', name: 'Akita', size: 'large', group: 'working', adultWeight: '70-130 lb', lifespanYears: '10-13', healthFocus: 'hypothyroidism and gastric dilatation', aliases: [] },
  { slug: 'alaskan-malamute', name: 'Alaskan Malamute', size: 'large', group: 'working', adultWeight: '75-85 lb', lifespanYears: '10-14', healthFocus: 'zinc-responsive dermatosis and hip dysplasia', aliases: [] },
  { slug: 'bloodhound', name: 'Bloodhound', size: 'large', group: 'hound', adultWeight: '80-110 lb', lifespanYears: '10-12', healthFocus: 'ear care, entropion, and bloat risk', aliases: [] },
  { slug: 'dalmatian', name: 'Dalmatian', size: 'medium', group: 'non-sporting', adultWeight: '45-70 lb', lifespanYears: '11-13', healthFocus: 'urinary urate stones and deafness', aliases: [] },
  { slug: 'chinese-shar-pei', name: 'Chinese Shar-Pei', size: 'medium', group: 'non-sporting', adultWeight: '45-60 lb', lifespanYears: '8-12', healthFocus: 'familial Shar-Pei fever and entropion', aliases: ['shar-pei'] },
  { slug: 'chow-chow', name: 'Chow Chow', size: 'medium', group: 'non-sporting', adultWeight: '45-70 lb', lifespanYears: '8-12', healthFocus: 'hypothyroidism and entropion', aliases: [] },
  { slug: 'great-pyrenees', name: 'Great Pyrenees', size: 'giant', group: 'working', adultWeight: '85-160 lb', lifespanYears: '10-12', healthFocus: 'hip dysplasia and osteosarcoma', aliases: [] },
  { slug: 'old-english-sheepdog', name: 'Old English Sheepdog', size: 'large', group: 'herding', adultWeight: '60-100 lb', lifespanYears: '10-12', healthFocus: 'hip dysplasia and deafness', aliases: [] },
  { slug: 'papillon', name: 'Papillon', size: 'toy', group: 'toy', adultWeight: '5-10 lb', lifespanYears: '14-16', healthFocus: 'patellar luxation and dental disease', aliases: [] },
  { slug: 'brussels-griffon', name: 'Brussels Griffon', size: 'toy', group: 'toy', adultWeight: '8-10 lb', lifespanYears: '12-15', healthFocus: 'BOAS and syringomyelia awareness', aliases: [] },
  { slug: 'miniature-pinscher', name: 'Miniature Pinscher', size: 'toy', group: 'toy', adultWeight: '8-10 lb', lifespanYears: '12-16', healthFocus: 'patellar luxation and dental crowding', aliases: [] },
  { slug: 'bullmastiff', name: 'Bullmastiff', size: 'giant', group: 'working', adultWeight: '100-130 lb', lifespanYears: '7-10', healthFocus: 'cancer awareness and hip dysplasia', aliases: [] },
  { slug: 'staffordshire-bull-terrier', name: 'Staffordshire Bull Terrier', size: 'medium', group: 'terrier', adultWeight: '24-38 lb', lifespanYears: '12-14', healthFocus: 'L-2-HGA screening and skin allergies', aliases: [] },
  { slug: 'american-staffordshire-terrier', name: 'American Staffordshire Terrier', size: 'medium', group: 'terrier', adultWeight: '40-70 lb', lifespanYears: '12-16', healthFocus: 'hip dysplasia and cerebellar ataxia', aliases: [] },
  { slug: 'bull-terrier', name: 'Bull Terrier', size: 'medium', group: 'terrier', adultWeight: '50-70 lb', lifespanYears: '10-14', healthFocus: 'deafness and kidney screening', aliases: [] },
  { slug: 'airedale-terrier', name: 'Airedale Terrier', size: 'large', group: 'terrier', adultWeight: '44-70 lb', lifespanYears: '11-14', healthFocus: 'hip dysplasia and hypothyroidism', aliases: [] },
  { slug: 'cairn-terrier', name: 'Cairn Terrier', size: 'small', group: 'terrier', adultWeight: '13-14 lb', lifespanYears: '13-15', healthFocus: 'portosystemic shunt and ocular disease', aliases: [] },
  { slug: 'border-terrier', name: 'Border Terrier', size: 'small', group: 'terrier', adultWeight: '11-16 lb', lifespanYears: '12-15', healthFocus: 'canine epileptoid cramping syndrome', aliases: [] },
  { slug: 'norfolk-terrier', name: 'Norfolk Terrier', size: 'small', group: 'terrier', adultWeight: '11-12 lb', lifespanYears: '13-15', healthFocus: 'mitral valve disease and patella luxation', aliases: [] },
  { slug: 'norwich-terrier', name: 'Norwich Terrier', size: 'small', group: 'terrier', adultWeight: '11-12 lb', lifespanYears: '13-15', healthFocus: 'upper-airway syndrome and allergies', aliases: [] },
  { slug: 'jack-russell-terrier', name: 'Jack Russell Terrier', size: 'small', group: 'terrier', adultWeight: '13-17 lb', lifespanYears: '13-16', healthFocus: 'lens luxation and patellar luxation', aliases: ['parson-russell-terrier'] },
  { slug: 'rat-terrier', name: 'Rat Terrier', size: 'small', group: 'terrier', adultWeight: '10-25 lb', lifespanYears: '12-18', healthFocus: 'Legg-Calve-Perthes and dental disease', aliases: [] },
  { slug: 'irish-setter', name: 'Irish Setter', size: 'large', group: 'sporting', adultWeight: '60-70 lb', lifespanYears: '12-15', healthFocus: 'bloat risk and progressive retinal atrophy', aliases: [] },
  { slug: 'gordon-setter', name: 'Gordon Setter', size: 'large', group: 'sporting', adultWeight: '45-80 lb', lifespanYears: '12-13', healthFocus: 'hip dysplasia and cerebellar degeneration', aliases: [] },
  { slug: 'english-setter', name: 'English Setter', size: 'large', group: 'sporting', adultWeight: '45-80 lb', lifespanYears: '12-15', healthFocus: 'deafness and hip dysplasia', aliases: [] },
  { slug: 'pointer', name: 'Pointer', size: 'large', group: 'sporting', adultWeight: '45-75 lb', lifespanYears: '12-17', healthFocus: 'hip dysplasia and epilepsy', aliases: [] },
  { slug: 'german-wirehaired-pointer', name: 'German Wirehaired Pointer', size: 'large', group: 'sporting', adultWeight: '50-70 lb', lifespanYears: '14-16', healthFocus: 'hip dysplasia and ear care', aliases: [] },
  { slug: 'wirehaired-pointing-griffon', name: 'Wirehaired Pointing Griffon', size: 'medium', group: 'sporting', adultWeight: '50-70 lb', lifespanYears: '12-14', healthFocus: 'hip dysplasia and otitis', aliases: [] },
  { slug: 'chesapeake-bay-retriever', name: 'Chesapeake Bay Retriever', size: 'large', group: 'sporting', adultWeight: '55-80 lb', lifespanYears: '10-13', healthFocus: 'progressive retinal atrophy and hip dysplasia', aliases: [] },
  { slug: 'nova-scotia-duck-tolling-retriever', name: 'Nova Scotia Duck Tolling Retriever', size: 'medium', group: 'sporting', adultWeight: '35-50 lb', lifespanYears: '12-14', healthFocus: 'autoimmune disease and hip screening', aliases: [] },
  { slug: 'flat-coated-retriever', name: 'Flat-Coated Retriever', size: 'large', group: 'sporting', adultWeight: '55-80 lb', lifespanYears: '8-10', healthFocus: 'cancer predisposition and hip dysplasia', aliases: [] },
  { slug: 'curly-coated-retriever', name: 'Curly-Coated Retriever', size: 'large', group: 'sporting', adultWeight: '60-95 lb', lifespanYears: '10-12', healthFocus: 'glycogen storage disease and bloat', aliases: [] },
  { slug: 'irish-water-spaniel', name: 'Irish Water Spaniel', size: 'large', group: 'sporting', adultWeight: '45-68 lb', lifespanYears: '12-13', healthFocus: 'hip dysplasia and follicular dysplasia', aliases: [] },
  { slug: 'clumber-spaniel', name: 'Clumber Spaniel', size: 'large', group: 'sporting', adultWeight: '55-85 lb', lifespanYears: '10-12', healthFocus: 'entropion and intervertebral disc disease', aliases: [] },
  { slug: 'field-spaniel', name: 'Field Spaniel', size: 'medium', group: 'sporting', adultWeight: '35-50 lb', lifespanYears: '12-13', healthFocus: 'hip dysplasia and hypothyroidism', aliases: [] },
  { slug: 'sussex-spaniel', name: 'Sussex Spaniel', size: 'medium', group: 'sporting', adultWeight: '35-45 lb', lifespanYears: '13-15', healthFocus: 'heart disease and ear care', aliases: [] },
  { slug: 'welsh-springer-spaniel', name: 'Welsh Springer Spaniel', size: 'medium', group: 'sporting', adultWeight: '35-55 lb', lifespanYears: '12-15', healthFocus: 'glaucoma and hip dysplasia', aliases: [] },
  { slug: 'american-water-spaniel', name: 'American Water Spaniel', size: 'medium', group: 'sporting', adultWeight: '25-45 lb', lifespanYears: '10-14', healthFocus: 'hip dysplasia and eye screening', aliases: [] },
  { slug: 'boykin-spaniel', name: 'Boykin Spaniel', size: 'medium', group: 'sporting', adultWeight: '25-40 lb', lifespanYears: '10-15', healthFocus: 'exercise-induced collapse and hip dysplasia', aliases: [] },
  { slug: 'spinone-italiano', name: 'Spinone Italiano', size: 'large', group: 'sporting', adultWeight: '64-85 lb', lifespanYears: '10-12', healthFocus: 'cerebellar ataxia and bloat risk', aliases: [] },
  { slug: 'bracco-italiano', name: 'Bracco Italiano', size: 'large', group: 'sporting', adultWeight: '55-90 lb', lifespanYears: '10-12', healthFocus: 'ear care and hip dysplasia', aliases: [] },
  { slug: 'wirehaired-vizsla', name: 'Wirehaired Vizsla', size: 'medium', group: 'sporting', adultWeight: '45-65 lb', lifespanYears: '12-14', healthFocus: 'hip dysplasia and food sensitivities', aliases: [] },
  { slug: 'german-longhaired-pointer', name: 'German Longhaired Pointer', size: 'large', group: 'sporting', adultWeight: '55-80 lb', lifespanYears: '12-14', healthFocus: 'hip dysplasia and ear infections', aliases: [] },
  { slug: 'small-munsterlander', name: 'Small Munsterlander', size: 'medium', group: 'sporting', adultWeight: '40-60 lb', lifespanYears: '12-14', healthFocus: 'hip dysplasia and high-drive fueling', aliases: [] },
  { slug: 'large-munsterlander', name: 'Large Munsterlander', size: 'large', group: 'sporting', adultWeight: '50-75 lb', lifespanYears: '12-13', healthFocus: 'hip dysplasia and black-hair follicular dysplasia', aliases: [] },
  { slug: 'goldendoodle', name: 'Goldendoodle', size: 'medium', group: 'designer', adultWeight: '30-90 lb', lifespanYears: '10-15', healthFocus: 'ear care and hip dysplasia', aliases: [] },
  { slug: 'labradoodle', name: 'Labradoodle', size: 'medium', group: 'designer', adultWeight: '45-80 lb', lifespanYears: '12-14', healthFocus: 'ear infections and joint screening', aliases: [] },
  { slug: 'bernedoodle', name: 'Bernedoodle', size: 'large', group: 'designer', adultWeight: '50-90 lb', lifespanYears: '12-18', healthFocus: 'hip dysplasia and bloat awareness', aliases: [] },
  { slug: 'sheepadoodle', name: 'Sheepadoodle', size: 'large', group: 'designer', adultWeight: '60-80 lb', lifespanYears: '12-15', healthFocus: 'hip dysplasia and Addison screening', aliases: [] },
  { slug: 'aussiedoodle', name: 'Aussiedoodle', size: 'medium', group: 'designer', adultWeight: '25-70 lb', lifespanYears: '10-13', healthFocus: 'MDR1 sensitivity and eye disorders', aliases: [] },
  { slug: 'cockapoo', name: 'Cockapoo', size: 'small', group: 'designer', adultWeight: '12-24 lb', lifespanYears: '14-18', healthFocus: 'ear infections and progressive retinal atrophy', aliases: [] },
  { slug: 'cavapoo', name: 'Cavapoo', size: 'small', group: 'designer', adultWeight: '9-25 lb', lifespanYears: '13-15', healthFocus: 'mitral valve disease and patellar luxation', aliases: [] },
  { slug: 'maltipoo', name: 'Maltipoo', size: 'toy', group: 'designer', adultWeight: '5-20 lb', lifespanYears: '12-16', healthFocus: 'tracheal collapse and dental crowding', aliases: [] },
  { slug: 'yorkipoo', name: 'Yorkipoo', size: 'toy', group: 'designer', adultWeight: '4-14 lb', lifespanYears: '10-15', healthFocus: 'dental disease and hypoglycemia in puppies', aliases: [] },
  { slug: 'schnoodle', name: 'Schnoodle', size: 'medium', group: 'designer', adultWeight: '20-75 lb', lifespanYears: '10-16', healthFocus: 'pancreatitis risk and dental tartar', aliases: [] },
  { slug: 'pomsky', name: 'Pomsky', size: 'small', group: 'designer', adultWeight: '10-30 lb', lifespanYears: '12-15', healthFocus: 'dental crowding and eye irritation', aliases: [] },
  { slug: 'puggle', name: 'Puggle', size: 'small', group: 'designer', adultWeight: '15-30 lb', lifespanYears: '10-15', healthFocus: 'BOAS and hip dysplasia', aliases: [] },
  { slug: 'chiweenie', name: 'Chiweenie', size: 'small', group: 'designer', adultWeight: '5-12 lb', lifespanYears: '12-16', healthFocus: 'IVDD and dental disease', aliases: [] },
  { slug: 'shorkie', name: 'Shorkie', size: 'toy', group: 'designer', adultWeight: '5-15 lb', lifespanYears: '11-16', healthFocus: 'dental crowding and tracheal sensitivity', aliases: [] },
  { slug: 'cavachon', name: 'Cavachon', size: 'small', group: 'designer', adultWeight: '10-20 lb', lifespanYears: '10-15', healthFocus: 'mitral valve disease and ear care', aliases: [] },
  { slug: 'saint-berdoodle', name: 'Saint Berdoodle', size: 'giant', group: 'designer', adultWeight: '70-180 lb', lifespanYears: '8-12', healthFocus: 'bloat risk and hip dysplasia', aliases: [] },
  { slug: 'irish-doodle', name: 'Irish Doodle', size: 'large', group: 'designer', adultWeight: '40-90 lb', lifespanYears: '10-15', healthFocus: 'bloat awareness and hip screening', aliases: [] },
  { slug: 'afghan-hound', name: 'Afghan Hound', size: 'large', group: 'hound', adultWeight: '50-60 lb', lifespanYears: '12-14', healthFocus: 'anesthesia sensitivity and cancer awareness', aliases: [] },
  { slug: 'borzoi', name: 'Borzoi', size: 'giant', group: 'hound', adultWeight: '60-105 lb', lifespanYears: '9-14', healthFocus: 'bloat risk and osteosarcoma', aliases: [] },
  { slug: 'saluki', name: 'Saluki', size: 'large', group: 'hound', adultWeight: '40-65 lb', lifespanYears: '12-14', healthFocus: 'heart screening and anesthesia sensitivity', aliases: [] },
  { slug: 'greyhound', name: 'Greyhound', size: 'large', group: 'hound', adultWeight: '60-70 lb', lifespanYears: '10-14', healthFocus: 'osteosarcoma and anesthesia sensitivity', aliases: [] },
  { slug: 'scottish-deerhound', name: 'Scottish Deerhound', size: 'giant', group: 'hound', adultWeight: '75-110 lb', lifespanYears: '8-11', healthFocus: 'osteosarcoma and dilated cardiomyopathy', aliases: [] },
  { slug: 'ibizan-hound', name: 'Ibizan Hound', size: 'medium', group: 'hound', adultWeight: '45-50 lb', lifespanYears: '11-14', healthFocus: 'deafness and anesthesia sensitivity', aliases: [] },
  { slug: 'pharaoh-hound', name: 'Pharaoh Hound', size: 'medium', group: 'hound', adultWeight: '45-55 lb', lifespanYears: '12-14', healthFocus: 'anesthesia sensitivity and allergies', aliases: [] },
  { slug: 'basenji', name: 'Basenji', size: 'small', group: 'hound', adultWeight: '22-24 lb', lifespanYears: '13-14', healthFocus: 'Fanconi syndrome and progressive retinal atrophy', aliases: [] },
  { slug: 'norwegian-elkhound', name: 'Norwegian Elkhound', size: 'medium', group: 'hound', adultWeight: '48-55 lb', lifespanYears: '12-15', healthFocus: 'hip dysplasia and renal screening', aliases: [] },
  { slug: 'finnish-spitz', name: 'Finnish Spitz', size: 'medium', group: 'non-sporting', adultWeight: '20-33 lb', lifespanYears: '13-15', healthFocus: 'patellar luxation and epilepsy', aliases: [] },
  { slug: 'plott-hound', name: 'Plott Hound', size: 'large', group: 'hound', adultWeight: '40-60 lb', lifespanYears: '12-14', healthFocus: 'ear care and hip dysplasia', aliases: [] },
  { slug: 'american-foxhound', name: 'American Foxhound', size: 'large', group: 'hound', adultWeight: '60-70 lb', lifespanYears: '11-13', healthFocus: 'hip dysplasia and thrombocytopathy', aliases: [] },
  { slug: 'english-foxhound', name: 'English Foxhound', size: 'large', group: 'hound', adultWeight: '60-75 lb', lifespanYears: '10-13', healthFocus: 'hip dysplasia and ear infections', aliases: [] },
  { slug: 'harrier', name: 'Harrier', size: 'medium', group: 'hound', adultWeight: '45-60 lb', lifespanYears: '12-15', healthFocus: 'hip dysplasia and ear care', aliases: [] },
  { slug: 'otterhound', name: 'Otterhound', size: 'large', group: 'hound', adultWeight: '80-115 lb', lifespanYears: '10-13', healthFocus: 'hip dysplasia and bloat risk', aliases: [] },
  { slug: 'petit-basset-griffon-vendeen', name: 'Petit Basset Griffon Vendeen', size: 'small', group: 'hound', adultWeight: '25-40 lb', lifespanYears: '14-16', healthFocus: 'ear care and hip dysplasia', aliases: [] },
  { slug: 'grand-basset-griffon-vendeen', name: 'Grand Basset Griffon Vendeen', size: 'medium', group: 'hound', adultWeight: '40-45 lb', lifespanYears: '12-14', healthFocus: 'ear infections and hip dysplasia', aliases: [] },
  { slug: 'bluetick-coonhound', name: 'Bluetick Coonhound', size: 'large', group: 'hound', adultWeight: '45-80 lb', lifespanYears: '11-12', healthFocus: 'ear care and hip dysplasia', aliases: [] },
  { slug: 'redbone-coonhound', name: 'Redbone Coonhound', size: 'large', group: 'hound', adultWeight: '45-70 lb', lifespanYears: '11-12', healthFocus: 'hip dysplasia and ear infections', aliases: [] },
  { slug: 'treeing-walker-coonhound', name: 'Treeing Walker Coonhound', size: 'large', group: 'hound', adultWeight: '50-70 lb', lifespanYears: '12-13', healthFocus: 'ear care and hip dysplasia', aliases: [] },
  { slug: 'leonberger', name: 'Leonberger', size: 'giant', group: 'working', adultWeight: '90-170 lb', lifespanYears: '8-10', healthFocus: 'polyneuropathy and osteosarcoma', aliases: [] },
  { slug: 'anatolian-shepherd', name: 'Anatolian Shepherd', size: 'giant', group: 'working', adultWeight: '80-150 lb', lifespanYears: '11-13', healthFocus: 'hip dysplasia and entropion', aliases: [] },
  { slug: 'kuvasz', name: 'Kuvasz', size: 'giant', group: 'working', adultWeight: '70-115 lb', lifespanYears: '10-12', healthFocus: 'hip dysplasia and progressive retinal atrophy', aliases: [] },
  { slug: 'komondor', name: 'Komondor', size: 'giant', group: 'working', adultWeight: '80-130 lb', lifespanYears: '10-12', healthFocus: 'hip dysplasia and coat-related skin care', aliases: [] },
  { slug: 'dogue-de-bordeaux', name: 'Dogue de Bordeaux', size: 'giant', group: 'working', adultWeight: '99-110 lb', lifespanYears: '5-8', healthFocus: 'heart disease and gastric dilatation', aliases: [] },
  { slug: 'dogo-argentino', name: 'Dogo Argentino', size: 'large', group: 'working', adultWeight: '80-100 lb', lifespanYears: '9-15', healthFocus: 'deafness and hip dysplasia', aliases: [] },
  { slug: 'presa-canario', name: 'Presa Canario', size: 'giant', group: 'working', adultWeight: '84-110 lb', lifespanYears: '9-11', healthFocus: 'hip dysplasia and cardiac screening', aliases: ['perro-de-presa-canario'] },
  { slug: 'tibetan-mastiff', name: 'Tibetan Mastiff', size: 'giant', group: 'working', adultWeight: '70-150 lb', lifespanYears: '10-12', healthFocus: 'hypothyroidism and hip dysplasia', aliases: [] },
  { slug: 'neapolitan-mastiff', name: 'Neapolitan Mastiff', size: 'giant', group: 'working', adultWeight: '110-150 lb', lifespanYears: '7-9', healthFocus: 'cherry eye, skin folds, and hip dysplasia', aliases: [] },
  { slug: 'boerboel', name: 'Boerboel', size: 'giant', group: 'working', adultWeight: '110-200 lb', lifespanYears: '9-11', healthFocus: 'hip dysplasia and vaginal hyperplasia screening', aliases: [] },
  { slug: 'black-russian-terrier', name: 'Black Russian Terrier', size: 'giant', group: 'working', adultWeight: '80-130 lb', lifespanYears: '10-12', healthFocus: 'hip dysplasia and juvenile laryngeal paralysis', aliases: [] },
  { slug: 'giant-schnauzer', name: 'Giant Schnauzer', size: 'large', group: 'working', adultWeight: '55-85 lb', lifespanYears: '12-15', healthFocus: 'osteosarcoma and hypothyroidism', aliases: [] },
  { slug: 'standard-schnauzer', name: 'Standard Schnauzer', size: 'medium', group: 'working', adultWeight: '30-50 lb', lifespanYears: '13-16', healthFocus: 'hip dysplasia and follicular dermatitis', aliases: [] },
  { slug: 'beauceron', name: 'Beauceron', size: 'large', group: 'herding', adultWeight: '70-110 lb', lifespanYears: '10-12', healthFocus: 'gastric dilatation and hip dysplasia', aliases: [] },
  { slug: 'briard', name: 'Briard', size: 'large', group: 'herding', adultWeight: '55-100 lb', lifespanYears: '10-12', healthFocus: 'night blindness and hip dysplasia', aliases: [] },
  { slug: 'belgian-tervuren', name: 'Belgian Tervuren', size: 'large', group: 'herding', adultWeight: '45-75 lb', lifespanYears: '12-14', healthFocus: 'epilepsy and hip dysplasia', aliases: [] },
  { slug: 'belgian-sheepdog', name: 'Belgian Sheepdog', size: 'large', group: 'herding', adultWeight: '45-75 lb', lifespanYears: '12-14', healthFocus: 'epilepsy and gastric dilatation', aliases: ['belgian-groenendael'] },
  { slug: 'dutch-shepherd', name: 'Dutch Shepherd', size: 'large', group: 'herding', adultWeight: '42-75 lb', lifespanYears: '12-15', healthFocus: 'inflammatory skin disease and goniodysplasia', aliases: [] },
  { slug: 'affenpinscher', name: 'Affenpinscher', size: 'toy', group: 'toy', adultWeight: '7-10 lb', lifespanYears: '12-15', healthFocus: 'patellar luxation and dental crowding', aliases: [] },
  { slug: 'japanese-chin', name: 'Japanese Chin', size: 'toy', group: 'toy', adultWeight: '7-11 lb', lifespanYears: '10-12', healthFocus: 'BOAS and mitral valve disease', aliases: [] },
  { slug: 'pekingese', name: 'Pekingese', size: 'toy', group: 'toy', adultWeight: '6-14 lb', lifespanYears: '12-14', healthFocus: 'BOAS, IVDD, and eye injury risk', aliases: [] },
  { slug: 'lhasa-apso', name: 'Lhasa Apso', size: 'small', group: 'non-sporting', adultWeight: '12-18 lb', lifespanYears: '12-15', healthFocus: 'renal dysplasia and progressive retinal atrophy', aliases: [] },
  { slug: 'tibetan-terrier', name: 'Tibetan Terrier', size: 'medium', group: 'non-sporting', adultWeight: '18-30 lb', lifespanYears: '12-15', healthFocus: 'neuronal ceroid lipofuscinosis and hip dysplasia', aliases: [] },
  { slug: 'tibetan-spaniel', name: 'Tibetan Spaniel', size: 'small', group: 'non-sporting', adultWeight: '9-15 lb', lifespanYears: '12-15', healthFocus: 'progressive retinal atrophy and patellar luxation', aliases: [] },
  { slug: 'chinese-crested', name: 'Chinese Crested', size: 'toy', group: 'toy', adultWeight: '8-12 lb', lifespanYears: '13-18', healthFocus: 'dental disease and skin-care needs', aliases: [] },
  { slug: 'coton-de-tulear', name: 'Coton de Tulear', size: 'small', group: 'non-sporting', adultWeight: '8-13 lb', lifespanYears: '14-16', healthFocus: 'hip dysplasia and patellar luxation', aliases: [] },
  { slug: 'lowchen', name: 'Lowchen', size: 'small', group: 'non-sporting', adultWeight: '9-18 lb', lifespanYears: '13-15', healthFocus: 'patellar luxation and dental disease', aliases: [] },
  { slug: 'bolognese', name: 'Bolognese', size: 'toy', group: 'toy', adultWeight: '5-9 lb', lifespanYears: '12-14', healthFocus: 'patellar luxation and dental crowding', aliases: [] },
  { slug: 'silky-terrier', name: 'Silky Terrier', size: 'toy', group: 'toy', adultWeight: '8-10 lb', lifespanYears: '13-15', healthFocus: 'patellar luxation and dental disease', aliases: ['australian-silky-terrier'] },
  { slug: 'australian-terrier', name: 'Australian Terrier', size: 'small', group: 'terrier', adultWeight: '15-20 lb', lifespanYears: '11-15', healthFocus: 'diabetes and patellar luxation', aliases: [] },
  { slug: 'dandie-dinmont-terrier', name: 'Dandie Dinmont Terrier', size: 'small', group: 'terrier', adultWeight: '18-24 lb', lifespanYears: '12-15', healthFocus: 'glaucoma and intervertebral disc disease', aliases: [] },
  { slug: 'glen-of-imaal-terrier', name: 'Glen of Imaal Terrier', size: 'small', group: 'terrier', adultWeight: '32-40 lb', lifespanYears: '10-14', healthFocus: 'progressive retinal atrophy and allergies', aliases: [] },
  { slug: 'kerry-blue-terrier', name: 'Kerry Blue Terrier', size: 'medium', group: 'terrier', adultWeight: '33-40 lb', lifespanYears: '12-15', healthFocus: 'soft-tissue cancers and hip dysplasia', aliases: [] },
  { slug: 'lakeland-terrier', name: 'Lakeland Terrier', size: 'small', group: 'terrier', adultWeight: '15-17 lb', lifespanYears: '12-15', healthFocus: 'Legg-Calve-Perthes and lens luxation', aliases: [] },
  { slug: 'welsh-terrier', name: 'Welsh Terrier', size: 'small', group: 'terrier', adultWeight: '19-21 lb', lifespanYears: '12-15', healthFocus: 'primary lens luxation and allergies', aliases: [] },
  { slug: 'sealyham-terrier', name: 'Sealyham Terrier', size: 'small', group: 'terrier', adultWeight: '18-24 lb', lifespanYears: '12-14', healthFocus: 'deafness and lens luxation', aliases: [] },
  { slug: 'manchester-terrier', name: 'Manchester Terrier', size: 'small', group: 'terrier', adultWeight: '12-22 lb', lifespanYears: '15-17', healthFocus: 'von Willebrand disease and patellar luxation', aliases: [] },
  { slug: 'cardigan-welsh-corgi', name: 'Cardigan Welsh Corgi', size: 'small', group: 'herding', adultWeight: '25-38 lb', lifespanYears: '12-15', healthFocus: 'IVDD and progressive retinal atrophy', aliases: [] },
  { slug: 'polish-lowland-sheepdog', name: 'Polish Lowland Sheepdog', size: 'medium', group: 'herding', adultWeight: '30-50 lb', lifespanYears: '12-14', healthFocus: 'hip dysplasia and progressive retinal atrophy', aliases: [] },
  { slug: 'pyrenean-shepherd', name: 'Pyrenean Shepherd', size: 'small', group: 'herding', adultWeight: '15-32 lb', lifespanYears: '17-19', healthFocus: 'hip dysplasia and epilepsy', aliases: [] },
  { slug: 'bergamasco-sheepdog', name: 'Bergamasco Sheepdog', size: 'large', group: 'herding', adultWeight: '57-84 lb', lifespanYears: '13-15', healthFocus: 'hip dysplasia and coat-related skin care', aliases: ['bergamasco'] },
  { slug: 'entlebucher-mountain-dog', name: 'Entlebucher Mountain Dog', size: 'medium', group: 'herding', adultWeight: '45-65 lb', lifespanYears: '11-13', healthFocus: 'hip dysplasia and progressive retinal atrophy', aliases: [] },
  { slug: 'greater-swiss-mountain-dog', name: 'Greater Swiss Mountain Dog', size: 'giant', group: 'working', adultWeight: '85-140 lb', lifespanYears: '8-11', healthFocus: 'bloat risk and osteosarcoma', aliases: [] },
  { slug: 'finnish-lapphund', name: 'Finnish Lapphund', size: 'medium', group: 'herding', adultWeight: '33-53 lb', lifespanYears: '12-15', healthFocus: 'progressive retinal atrophy and hip dysplasia', aliases: [] },
  { slug: 'swedish-vallhund', name: 'Swedish Vallhund', size: 'small', group: 'herding', adultWeight: '20-35 lb', lifespanYears: '12-15', healthFocus: 'retinopathy and hip dysplasia', aliases: [] },
  { slug: 'icelandic-sheepdog', name: 'Icelandic Sheepdog', size: 'medium', group: 'herding', adultWeight: '20-30 lb', lifespanYears: '12-14', healthFocus: 'hip dysplasia and cataracts', aliases: [] },
  { slug: 'norwegian-buhund', name: 'Norwegian Buhund', size: 'medium', group: 'herding', adultWeight: '26-40 lb', lifespanYears: '12-15', healthFocus: 'hip dysplasia and cataracts', aliases: [] },
  { slug: 'australian-kelpie', name: 'Australian Kelpie', size: 'medium', group: 'herding', adultWeight: '31-46 lb', lifespanYears: '12-15', healthFocus: 'progressive retinal atrophy and cerebellar abiotrophy', aliases: [] },
  { slug: 'mudi', name: 'Mudi', size: 'medium', group: 'herding', adultWeight: '18-29 lb', lifespanYears: '13-14', healthFocus: 'hip dysplasia and epilepsy', aliases: [] },
  { slug: 'pumi', name: 'Pumi', size: 'medium', group: 'herding', adultWeight: '22-29 lb', lifespanYears: '12-13', healthFocus: 'hip dysplasia and primary lens luxation', aliases: [] },
  { slug: 'puli', name: 'Puli', size: 'medium', group: 'herding', adultWeight: '25-35 lb', lifespanYears: '10-15', healthFocus: 'hip dysplasia and progressive retinal atrophy', aliases: [] },
  { slug: 'bearded-collie', name: 'Bearded Collie', size: 'medium', group: 'herding', adultWeight: '45-55 lb', lifespanYears: '12-14', healthFocus: 'Addison disease and hip dysplasia', aliases: [] },
  { slug: 'catahoula-leopard-dog', name: 'Catahoula Leopard Dog', size: 'large', group: 'herding', adultWeight: '50-95 lb', lifespanYears: '10-14', healthFocus: 'deafness and hip dysplasia', aliases: [] },
  { slug: 'carolina-dog', name: 'Carolina Dog', size: 'medium', group: 'hound', adultWeight: '30-65 lb', lifespanYears: '12-14', healthFocus: 'tick-borne disease awareness and dental care', aliases: [] },
  { slug: 'mixed-breed-dog', name: 'Mixed Breed Dog', size: 'medium', group: 'mixed', adultWeight: 'varies', lifespanYears: '10-14', healthFocus: 'individual risk based on size and lifestyle', aliases: ['mutt'] },
  { slug: 'american-bully', name: 'American Bully', size: 'medium', group: 'companion', adultWeight: '30-120 lb', lifespanYears: '8-12', healthFocus: 'brachycephalic airway and hip dysplasia', aliases: [] },
  { slug: 'american-eskimo-dog', name: 'American Eskimo Dog', size: 'medium', group: 'non-sporting', adultWeight: '6-35 lb', lifespanYears: '13-15', healthFocus: 'progressive retinal atrophy and patellar luxation', aliases: [] },
  { slug: 'keeshond', name: 'Keeshond', size: 'medium', group: 'non-sporting', adultWeight: '35-45 lb', lifespanYears: '12-15', healthFocus: 'epilepsy, diabetes, and hip dysplasia', aliases: [] },
  { slug: 'schipperke', name: 'Schipperke', size: 'small', group: 'non-sporting', adultWeight: '10-16 lb', lifespanYears: '13-15', healthFocus: 'Legg-Calve-Perthes and MPS IIIB screening', aliases: [] },
  { slug: 'xoloitzcuintli', name: 'Xoloitzcuintli', size: 'medium', group: 'non-sporting', adultWeight: '10-55 lb', lifespanYears: '13-18', healthFocus: 'acne-like skin care and dental crowding', aliases: ['xolo'] },
  { slug: 'standard-poodle', name: 'Standard Poodle', size: 'large', group: 'non-sporting', adultWeight: '40-70 lb', lifespanYears: '12-15', healthFocus: 'Addison disease, bloat, and hip dysplasia', aliases: [] },
  { slug: 'miniature-poodle', name: 'Miniature Poodle', size: 'small', group: 'non-sporting', adultWeight: '10-15 lb', lifespanYears: '14-16', healthFocus: 'progressive retinal atrophy and patellar luxation', aliases: [] },
  { slug: 'toy-poodle', name: 'Toy Poodle', size: 'toy', group: 'non-sporting', adultWeight: '4-6 lb', lifespanYears: '14-16', healthFocus: 'tracheal collapse and dental crowding', aliases: [] },
  { slug: 'american-pit-bull-terrier', name: 'American Pit Bull Terrier', size: 'medium', group: 'terrier', adultWeight: '30-60 lb', lifespanYears: '12-16', healthFocus: 'allergies, hip dysplasia, and cruciate injury', aliases: [] },
];

export const LIFECYCLE_STAGES: readonly LifecycleStage[] = [
  {
    slug: 'puppy-vaccination-schedule',
    label: 'Puppy Vaccination Schedule',
    searchIntent: 'puppy vaccination schedule',
    category: 'puppy',
    kicker: 'First-year immunity',
  },
  {
    slug: 'puppy-nutrition-guide',
    label: 'Puppy Nutrition Guide',
    searchIntent: 'best puppy food',
    category: 'diet',
    kicker: 'Growth diet',
  },
  {
    slug: 'teething-and-dental-care',
    label: 'Teething and Dental Care',
    searchIntent: 'puppy teething timeline',
    category: 'puppy',
    kicker: 'Oral health',
  },
  {
    slug: 'spay-neuter-recovery-timeline',
    label: 'Spay/Neuter Recovery Timeline',
    searchIntent: 'spay neuter recovery timeline',
    category: 'recovery',
    kicker: 'Surgical recovery',
  },
  {
    slug: 'adolescent-growth-diet',
    label: 'Adolescent Growth Diet',
    searchIntent: 'adolescent dog feeding guide',
    category: 'diet',
    kicker: 'Growth-to-adult transition',
  },
  {
    slug: 'adult-weight-management',
    label: 'Adult Weight Management',
    searchIntent: 'adult dog weight management',
    category: 'adult',
    kicker: 'Body-condition control',
  },
  {
    slug: 'best-food-for-allergies',
    label: 'Best Food for Allergies',
    searchIntent: 'best dog food for allergies',
    category: 'diet',
    kicker: 'Elimination diet',
  },
  {
    slug: 'working-dog-fueling-plan',
    label: 'Working Dog Fueling Plan',
    searchIntent: 'working dog nutrition',
    category: 'diet',
    kicker: 'Performance fueling',
  },
  {
    slug: 'breeding-pregnancy-diet',
    label: 'Breeding and Pregnancy Diet',
    searchIntent: 'pregnant dog diet',
    category: 'diet',
    kicker: 'Gestation nutrition',
  },
  {
    slug: 'postpartum-recovery-care',
    label: 'Postpartum Recovery Care',
    searchIntent: 'dog postpartum recovery',
    category: 'recovery',
    kicker: 'Whelping aftercare',
  },
  {
    slug: 'adult-heart-health-screening',
    label: 'Adult Heart Health Screening',
    searchIntent: 'dog heart screening schedule',
    category: 'adult',
    kicker: 'Cardiac surveillance',
  },
  {
    slug: 'senior-joint-care',
    label: 'Senior Joint Care',
    searchIntent: 'senior dog joint care',
    category: 'senior',
    kicker: 'Mobility preservation',
  },
  {
    slug: 'senior-kidney-support-diet',
    label: 'Senior Kidney Support Diet',
    searchIntent: 'senior dog kidney diet',
    category: 'diet',
    kicker: 'Renal nutrition',
  },
  {
    slug: 'senior-cognitive-care',
    label: 'Senior Cognitive Care',
    searchIntent: 'senior dog cognitive dysfunction',
    category: 'senior',
    kicker: 'Brain aging',
  },
  {
    slug: 'end-of-life-comfort-care',
    label: 'End-of-Life Comfort Care',
    searchIntent: 'dog hospice comfort care',
    category: 'senior',
    kicker: 'Palliative timeline',
  },
];

export function getLifecyclePath(breedSlug: string, stageSlug: string): string {
  return `/guides/${breedSlug}/lifecycle/${stageSlug}`;
}

export const LIFECYCLE_MATRIX: readonly LifecycleMatrixEntry[] = TOP_DOG_BREEDS.flatMap((breed) =>
  LIFECYCLE_STAGES.map((stage) => ({
    breed,
    stage,
    path: getLifecyclePath(breed.slug, stage.slug),
  })),
);

if (TOP_DOG_BREEDS.length !== EXPECTED_BREED_COUNT) {
  throw new Error(`Expected ${EXPECTED_BREED_COUNT} breeds, got ${TOP_DOG_BREEDS.length}`);
}
if (LIFECYCLE_STAGES.length !== EXPECTED_STAGE_COUNT) {
  throw new Error(`Expected ${EXPECTED_STAGE_COUNT} stages, got ${LIFECYCLE_STAGES.length}`);
}
if (LIFECYCLE_MATRIX.length !== EXPECTED_LIFECYCLE_URL_COUNT) {
  throw new Error(`Expected ${EXPECTED_LIFECYCLE_URL_COUNT} lifecycle URLs, got ${LIFECYCLE_MATRIX.length}`);
}

const BREED_BY_SLUG = new Map<string, LifecycleBreed>();
for (const breed of TOP_DOG_BREEDS) {
  BREED_BY_SLUG.set(breed.slug, breed);
  for (const alias of breed.aliases) {
    BREED_BY_SLUG.set(alias, breed);
  }
}

const STAGE_BY_SLUG = new Map(LIFECYCLE_STAGES.map((stage) => [stage.slug, stage]));
const ENTRY_BY_PATH = new Map(LIFECYCLE_MATRIX.map((entry) => [entry.path, entry]));

export function getLifecycleBreed(slug: string | undefined): LifecycleBreed | null {
  if (!slug) return null;
  return BREED_BY_SLUG.get(slug.toLowerCase()) ?? null;
}

export function getLifecycleStage(slug: string | undefined): LifecycleStage | null {
  if (!slug) return null;
  return STAGE_BY_SLUG.get(slug.toLowerCase()) ?? null;
}

export function getLifecycleEntry(
  breedSlug: string | undefined,
  stageSlug: string | undefined,
): LifecycleMatrixEntry | null {
  if (!breedSlug || !stageSlug) return null;
  return ENTRY_BY_PATH.get(getLifecyclePath(breedSlug.toLowerCase(), stageSlug.toLowerCase())) ?? null;
}

export function isLifecycleGuidePath(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length === 4 && parts[0] === 'guides' && parts[2] === 'lifecycle';
}

export function listLifecycleEntries(): readonly LifecycleMatrixEntry[] {
  return LIFECYCLE_MATRIX;
}

export function listLifecycleStagesForBreed(breedSlug: string): readonly LifecycleMatrixEntry[] {
  return LIFECYCLE_MATRIX.filter((entry) => entry.breed.slug === breedSlug);
}

export function listRelatedLifecycleStages(
  breedSlug: string,
  currentStageSlug: string,
): readonly LifecycleMatrixEntry[] {
  return listLifecycleStagesForBreed(breedSlug).filter((entry) => entry.stage.slug !== currentStageSlug);
}
