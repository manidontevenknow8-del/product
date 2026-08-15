/**
 * Lead-gen resource matrix: 100 US metros x 20 high-intent record packets = 2,000 URLs.
 * Route: /resources/:city/:topic
 */
export type ResourceRegion = 'northeast' | 'south' | 'midwest' | 'west';

export type ResourceCity = {
  slug: string;
  name: string;
  state: string;
  stateAbbr: string;
  region: ResourceRegion;
  climateNote: string;
  facilityNote: string;
};

export type ResourceTopic = {
  slug: string;
  label: string;
  kicker: string;
  searchIntent: string;
};

export type ResourceMatrixEntry = {
  city: ResourceCity;
  topic: ResourceTopic;
  path: string;
};

export const EXPECTED_RESOURCE_CITY_COUNT = 100;
export const EXPECTED_RESOURCE_TOPIC_COUNT = 20;
export const EXPECTED_RESOURCE_URL_COUNT = 2_000;

export const RESOURCE_CITIES: readonly ResourceCity[] = [
  { slug: 'new-york', name: 'New York', state: 'New York', stateAbbr: 'NY', region: 'northeast', climateNote: 'cold winters and dense high-rise living', facilityNote: 'Most NYC boarding and daycare desks want current rabies plus Bordetella on file.' },
  { slug: 'los-angeles', name: 'Los Angeles', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'year-round mild weather and long car trips', facilityNote: 'LA facilities often ask for DHPP, rabies, Bordetella, and sometimes canine influenza.' },
  { slug: 'chicago', name: 'Chicago', state: 'Illinois', stateAbbr: 'IL', region: 'midwest', climateNote: 'harsh winters and indoor daycare demand', facilityNote: 'Chicago boarding desks typically want rabies, DHPP, and Bordetella dated within 12 months.' },
  { slug: 'houston', name: 'Houston', state: 'Texas', stateAbbr: 'TX', region: 'south', climateNote: 'heat, humidity, and hurricane prep', facilityNote: 'Houston sitters and kennels usually want rabies plus heartworm and flea prevention notes.' },
  { slug: 'phoenix', name: 'Phoenix', state: 'Arizona', stateAbbr: 'AZ', region: 'west', climateNote: 'extreme summer heat', facilityNote: 'Phoenix facilities often require current vaccines and a heat-safety note in the file.' },
  { slug: 'philadelphia', name: 'Philadelphia', state: 'Pennsylvania', stateAbbr: 'PA', region: 'northeast', climateNote: 'four-season climate and walk-up clinics', facilityNote: 'Philly boarding typically wants rabies, DHPP, and Bordetella certificates in one packet.' },
  { slug: 'san-antonio', name: 'San Antonio', state: 'Texas', stateAbbr: 'TX', region: 'south', climateNote: 'hot summers and military PCS traffic', facilityNote: 'San Antonio movers and kennels want rabies, microchip, and a dated health certificate.' },
  { slug: 'san-diego', name: 'San Diego', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'coastal climate and frequent pet travel', facilityNote: 'San Diego daycare often asks for DHPP, rabies, Bordetella, and fecal tests.' },
  { slug: 'dallas', name: 'Dallas', state: 'Texas', stateAbbr: 'TX', region: 'south', climateNote: 'hot summers and large suburban kennels', facilityNote: 'Dallas boarding groups commonly want rabies, DHPP, Bordetella, and sometimes CIV.' },
  { slug: 'san-jose', name: 'San Jose', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'tech-commute households and indoor cats', facilityNote: 'Bay Area facilities usually want digital copies of rabies and core vaccines.' },
  { slug: 'austin', name: 'Austin', state: 'Texas', stateAbbr: 'TX', region: 'south', climateNote: 'heat and a busy boarding market', facilityNote: 'Austin kennels typically want rabies, DHPP, Bordetella, and a fecal within 6-12 months.' },
  { slug: 'jacksonville', name: 'Jacksonville', state: 'Florida', stateAbbr: 'FL', region: 'south', climateNote: 'humid subtropical weather and hurricane season', facilityNote: 'Jacksonville boarding wants rabies plus parasite prevention dates in the same folder.' },
  { slug: 'fort-worth', name: 'Fort Worth', state: 'Texas', stateAbbr: 'TX', region: 'south', climateNote: 'hot summers and large-lot suburban dogs', facilityNote: 'Fort Worth daycare desks usually want DHPP, rabies, and Bordetella.' },
  { slug: 'columbus', name: 'Columbus', state: 'Ohio', stateAbbr: 'OH', region: 'midwest', climateNote: 'four seasons and campus-area sitters', facilityNote: 'Columbus facilities typically want rabies and DHPP with a Bordetella add-on for group play.' },
  { slug: 'indianapolis', name: 'Indianapolis', state: 'Indiana', stateAbbr: 'IN', region: 'midwest', climateNote: 'cold winters and weekend travel', facilityNote: 'Indy boarding often wants rabies, DHPP, and Bordetella on a single printable sheet.' },
  { slug: 'charlotte', name: 'Charlotte', state: 'North Carolina', stateAbbr: 'NC', region: 'south', climateNote: 'humid summers and bank-town relocations', facilityNote: 'Charlotte kennels commonly want rabies, DHPP, Bordetella, and heartworm status.' },
  { slug: 'san-francisco', name: 'San Francisco', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'fog, hills, and small-apartment pets', facilityNote: 'SF daycare usually wants core vaccines, Bordetella, and sometimes a titer letter.' },
  { slug: 'seattle', name: 'Seattle', state: 'Washington', stateAbbr: 'WA', region: 'west', climateNote: 'rain, hiking, and leptospirosis exposure', facilityNote: 'Seattle boarding often asks for DHPP, rabies, Bordetella, and lepto.' },
  { slug: 'denver', name: 'Denver', state: 'Colorado', stateAbbr: 'CO', region: 'west', climateNote: 'altitude, dry air, and weekend trail dogs', facilityNote: 'Denver facilities typically want rabies, DHPP, Bordetella, and a recent fecal.' },
  { slug: 'nashville', name: 'Nashville', state: 'Tennessee', stateAbbr: 'TN', region: 'south', climateNote: 'hot summers and tourism boarding spikes', facilityNote: 'Nashville kennels usually want rabies, DHPP, and Bordetella dated within a year.' },
  { slug: 'washington-dc', name: 'Washington', state: 'District of Columbia', stateAbbr: 'DC', region: 'northeast', climateNote: 'dense urban living and frequent travel', facilityNote: 'DC boarding desks typically want rabies, DHPP, Bordetella, and a digital PDF copy.' },
  { slug: 'boston', name: 'Boston', state: 'Massachusetts', stateAbbr: 'MA', region: 'northeast', climateNote: 'cold winters and university-area sitters', facilityNote: 'Boston daycare often wants rabies, DHPP, Bordetella, and sometimes influenza.' },
  { slug: 'el-paso', name: 'El Paso', state: 'Texas', stateAbbr: 'TX', region: 'south', climateNote: 'desert heat and border-adjacent travel', facilityNote: 'El Paso facilities want rabies certificates that match the microchip record.' },
  { slug: 'detroit', name: 'Detroit', state: 'Michigan', stateAbbr: 'MI', region: 'midwest', climateNote: 'cold winters and indoor daycare', facilityNote: 'Detroit boarding typically wants rabies, DHPP, and Bordetella.' },
  { slug: 'oklahoma-city', name: 'Oklahoma City', state: 'Oklahoma', stateAbbr: 'OK', region: 'south', climateNote: 'tornado season and heat', facilityNote: 'OKC kennels usually want rabies plus core vaccines and a parasite log.' },
  { slug: 'portland', name: 'Portland', state: 'Oregon', stateAbbr: 'OR', region: 'west', climateNote: 'rain and off-leash park culture', facilityNote: 'Portland daycare often wants DHPP, rabies, Bordetella, and fecal screening.' },
  { slug: 'las-vegas', name: 'Las Vegas', state: 'Nevada', stateAbbr: 'NV', region: 'west', climateNote: 'heat and travel-heavy households', facilityNote: 'Vegas boarding typically wants rabies, DHPP, Bordetella, and a heat-safety note.' },
  { slug: 'memphis', name: 'Memphis', state: 'Tennessee', stateAbbr: 'TN', region: 'south', climateNote: 'humidity and heartworm pressure', facilityNote: 'Memphis kennels usually want rabies, DHPP, and current heartworm prevention.' },
  { slug: 'louisville', name: 'Louisville', state: 'Kentucky', stateAbbr: 'KY', region: 'south', climateNote: 'humid summers and derby-weekend boarding', facilityNote: 'Louisville facilities typically want rabies, DHPP, and Bordetella.' },
  { slug: 'baltimore', name: 'Baltimore', state: 'Maryland', stateAbbr: 'MD', region: 'northeast', climateNote: 'four seasons and city-county clinic mix', facilityNote: 'Baltimore boarding often wants rabies, DHPP, Bordetella, and a digital certificate.' },
  { slug: 'milwaukee', name: 'Milwaukee', state: 'Wisconsin', stateAbbr: 'WI', region: 'midwest', climateNote: 'cold winters and indoor play', facilityNote: 'Milwaukee daycare typically wants rabies, DHPP, and Bordetella.' },
  { slug: 'albuquerque', name: 'Albuquerque', state: 'New Mexico', stateAbbr: 'NM', region: 'west', climateNote: 'high desert and altitude', facilityNote: 'Albuquerque kennels usually want rabies plus core vaccines and a hydration note.' },
  { slug: 'tucson', name: 'Tucson', state: 'Arizona', stateAbbr: 'AZ', region: 'west', climateNote: 'desert heat and monsoon season', facilityNote: 'Tucson boarding typically wants rabies, DHPP, and a heat-risk note in the file.' },
  { slug: 'fresno', name: 'Fresno', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'central valley heat', facilityNote: 'Fresno facilities usually want rabies, DHPP, and Bordetella.' },
  { slug: 'sacramento', name: 'Sacramento', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'hot summers and valley allergens', facilityNote: 'Sacramento daycare often wants DHPP, rabies, Bordetella, and fecal tests.' },
  { slug: 'mesa', name: 'Mesa', state: 'Arizona', stateAbbr: 'AZ', region: 'west', climateNote: 'desert heat and family suburbs', facilityNote: 'Mesa kennels typically want rabies plus core vaccines dated this year.' },
  { slug: 'kansas-city', name: 'Kansas City', state: 'Missouri', stateAbbr: 'MO', region: 'midwest', climateNote: 'storms and weekend travel', facilityNote: 'KC boarding usually wants rabies, DHPP, and Bordetella.' },
  { slug: 'atlanta', name: 'Atlanta', state: 'Georgia', stateAbbr: 'GA', region: 'south', climateNote: 'heat, humidity, and Hartsfield travel', facilityNote: 'Atlanta facilities typically want rabies, DHPP, Bordetella, and heartworm status.' },
  { slug: 'omaha', name: 'Omaha', state: 'Nebraska', stateAbbr: 'NE', region: 'midwest', climateNote: 'cold winters and suburban kennels', facilityNote: 'Omaha boarding often wants rabies, DHPP, and Bordetella.' },
  { slug: 'colorado-springs', name: 'Colorado Springs', state: 'Colorado', stateAbbr: 'CO', region: 'west', climateNote: 'altitude and military PCS moves', facilityNote: 'Colorado Springs kennels want rabies, microchip, and a dated health certificate.' },
  { slug: 'raleigh', name: 'Raleigh', state: 'North Carolina', stateAbbr: 'NC', region: 'south', climateNote: 'research-triangle relocations', facilityNote: 'Raleigh daycare typically wants DHPP, rabies, Bordetella, and a fecal.' },
  { slug: 'miami', name: 'Miami', state: 'Florida', stateAbbr: 'FL', region: 'south', climateNote: 'heat, humidity, and international travel', facilityNote: 'Miami boarding often wants rabies, DHPP, Bordetella, and parasite prevention dates.' },
  { slug: 'virginia-beach', name: 'Virginia Beach', state: 'Virginia', stateAbbr: 'VA', region: 'south', climateNote: 'coastal climate and military families', facilityNote: 'Virginia Beach facilities typically want rabies, DHPP, and Bordetella.' },
  { slug: 'oakland', name: 'Oakland', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'Bay Area boarding demand', facilityNote: 'Oakland daycare usually wants core vaccines, Bordetella, and a digital PDF.' },
  { slug: 'minneapolis', name: 'Minneapolis', state: 'Minnesota', stateAbbr: 'MN', region: 'midwest', climateNote: 'harsh winters and indoor daycare', facilityNote: 'Minneapolis kennels typically want rabies, DHPP, and Bordetella.' },
  { slug: 'tulsa', name: 'Tulsa', state: 'Oklahoma', stateAbbr: 'OK', region: 'south', climateNote: 'storms and heat', facilityNote: 'Tulsa boarding usually wants rabies plus core vaccines.' },
  { slug: 'tampa', name: 'Tampa', state: 'Florida', stateAbbr: 'FL', region: 'south', climateNote: 'humidity, storms, and heartworm pressure', facilityNote: 'Tampa facilities typically want rabies, DHPP, Bordetella, and heartworm notes.' },
  { slug: 'arlington-tx', name: 'Arlington', state: 'Texas', stateAbbr: 'TX', region: 'south', climateNote: 'DFW heat and suburban kennels', facilityNote: 'Arlington daycare often wants DHPP, rabies, and Bordetella.' },
  { slug: 'new-orleans', name: 'New Orleans', state: 'Louisiana', stateAbbr: 'LA', region: 'south', climateNote: 'humidity, flooding, and hurricane prep', facilityNote: 'New Orleans boarding wants rabies plus parasite prevention in one packet.' },
  { slug: 'wichita', name: 'Wichita', state: 'Kansas', stateAbbr: 'KS', region: 'midwest', climateNote: 'storms and prairie allergens', facilityNote: 'Wichita kennels typically want rabies, DHPP, and Bordetella.' },
  { slug: 'cleveland', name: 'Cleveland', state: 'Ohio', stateAbbr: 'OH', region: 'midwest', climateNote: 'lake-effect winters', facilityNote: 'Cleveland daycare usually wants rabies, DHPP, and Bordetella.' },
  { slug: 'bakersfield', name: 'Bakersfield', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'valley heat', facilityNote: 'Bakersfield boarding typically wants rabies and core vaccines.' },
  { slug: 'aurora-co', name: 'Aurora', state: 'Colorado', stateAbbr: 'CO', region: 'west', climateNote: 'altitude and Front Range travel', facilityNote: 'Aurora facilities usually want rabies, DHPP, and Bordetella.' },
  { slug: 'anaheim', name: 'Anaheim', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'theme-park travel and boarding spikes', facilityNote: 'Anaheim kennels typically want DHPP, rabies, and Bordetella.' },
  { slug: 'honolulu', name: 'Honolulu', state: 'Hawaii', stateAbbr: 'HI', region: 'west', climateNote: 'island import rules and tropical climate', facilityNote: 'Honolulu travel packets need rabies, microchip, and often a titer timeline.' },
  { slug: 'santa-ana', name: 'Santa Ana', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'OC boarding demand', facilityNote: 'Santa Ana daycare often wants core vaccines and Bordetella.' },
  { slug: 'riverside', name: 'Riverside', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'inland heat', facilityNote: 'Riverside kennels typically want rabies, DHPP, and Bordetella.' },
  { slug: 'corpus-christi', name: 'Corpus Christi', state: 'Texas', stateAbbr: 'TX', region: 'south', climateNote: 'coastal humidity and hurricane prep', facilityNote: 'Corpus Christi boarding wants rabies plus parasite dates.' },
  { slug: 'lexington', name: 'Lexington', state: 'Kentucky', stateAbbr: 'KY', region: 'south', climateNote: 'horse-country travel weekends', facilityNote: 'Lexington facilities typically want rabies, DHPP, and Bordetella.' },
  { slug: 'henderson', name: 'Henderson', state: 'Nevada', stateAbbr: 'NV', region: 'west', climateNote: 'desert heat next to Las Vegas travel', facilityNote: 'Henderson kennels usually want rabies and core vaccines.' },
  { slug: 'stockton', name: 'Stockton', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'valley heat', facilityNote: 'Stockton boarding typically wants rabies, DHPP, and Bordetella.' },
  { slug: 'saint-paul', name: 'Saint Paul', state: 'Minnesota', stateAbbr: 'MN', region: 'midwest', climateNote: 'cold winters', facilityNote: 'Saint Paul daycare often wants rabies, DHPP, and Bordetella.' },
  { slug: 'cincinnati', name: 'Cincinnati', state: 'Ohio', stateAbbr: 'OH', region: 'midwest', climateNote: 'four seasons and river-city travel', facilityNote: 'Cincinnati kennels typically want rabies, DHPP, and Bordetella.' },
  { slug: 'st-louis', name: 'St. Louis', state: 'Missouri', stateAbbr: 'MO', region: 'midwest', climateNote: 'humidity and weekend travel', facilityNote: 'St. Louis boarding usually wants rabies, DHPP, and Bordetella.' },
  { slug: 'pittsburgh', name: 'Pittsburgh', state: 'Pennsylvania', stateAbbr: 'PA', region: 'northeast', climateNote: 'hills, cold winters, and walk-up clinics', facilityNote: 'Pittsburgh daycare typically wants rabies, DHPP, and Bordetella.' },
  { slug: 'greensboro', name: 'Greensboro', state: 'North Carolina', stateAbbr: 'NC', region: 'south', climateNote: 'humid summers', facilityNote: 'Greensboro kennels usually want rabies and core vaccines.' },
  { slug: 'lincoln', name: 'Lincoln', state: 'Nebraska', stateAbbr: 'NE', region: 'midwest', climateNote: 'campus sitters and cold winters', facilityNote: 'Lincoln boarding typically wants rabies, DHPP, and Bordetella.' },
  { slug: 'anchorage', name: 'Anchorage', state: 'Alaska', stateAbbr: 'AK', region: 'west', climateNote: 'extreme cold and wildlife exposure', facilityNote: 'Anchorage facilities want rabies plus a winter-ready medication list.' },
  { slug: 'plano', name: 'Plano', state: 'Texas', stateAbbr: 'TX', region: 'south', climateNote: 'north Dallas suburbs', facilityNote: 'Plano daycare often wants DHPP, rabies, Bordetella, and CIV.' },
  { slug: 'orlando', name: 'Orlando', state: 'Florida', stateAbbr: 'FL', region: 'south', climateNote: 'tourism boarding spikes and humidity', facilityNote: 'Orlando kennels typically want rabies, DHPP, Bordetella, and heartworm status.' },
  { slug: 'irvine', name: 'Irvine', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'planned-community daycare demand', facilityNote: 'Irvine facilities usually want digital vaccine PDFs.' },
  { slug: 'newark', name: 'Newark', state: 'New Jersey', stateAbbr: 'NJ', region: 'northeast', climateNote: 'airport travel and dense housing', facilityNote: 'Newark boarding typically wants rabies, DHPP, and Bordetella.' },
  { slug: 'durham', name: 'Durham', state: 'North Carolina', stateAbbr: 'NC', region: 'south', climateNote: 'research-triangle relocations', facilityNote: 'Durham daycare often wants DHPP, rabies, and Bordetella.' },
  { slug: 'chula-vista', name: 'Chula Vista', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'border-adjacent travel', facilityNote: 'Chula Vista kennels typically want rabies matching the microchip.' },
  { slug: 'toledo', name: 'Toledo', state: 'Ohio', stateAbbr: 'OH', region: 'midwest', climateNote: 'lake winters', facilityNote: 'Toledo boarding usually wants rabies, DHPP, and Bordetella.' },
  { slug: 'fort-wayne', name: 'Fort Wayne', state: 'Indiana', stateAbbr: 'IN', region: 'midwest', climateNote: 'cold winters', facilityNote: 'Fort Wayne facilities typically want rabies and core vaccines.' },
  { slug: 'st-petersburg', name: 'St. Petersburg', state: 'Florida', stateAbbr: 'FL', region: 'south', climateNote: 'gulf humidity and storms', facilityNote: 'St. Pete kennels want rabies, DHPP, and heartworm notes.' },
  { slug: 'laredo', name: 'Laredo', state: 'Texas', stateAbbr: 'TX', region: 'south', climateNote: 'border travel and heat', facilityNote: 'Laredo boarding typically wants rabies certificates that match ID records.' },
  { slug: 'jersey-city', name: 'Jersey City', state: 'New Jersey', stateAbbr: 'NJ', region: 'northeast', climateNote: 'Hudson high-rises and NYC overflow boarding', facilityNote: 'Jersey City daycare often wants digital rabies and DHPP PDFs.' },
  { slug: 'chandler', name: 'Chandler', state: 'Arizona', stateAbbr: 'AZ', region: 'west', climateNote: 'desert heat', facilityNote: 'Chandler kennels usually want rabies plus core vaccines.' },
  { slug: 'madison', name: 'Madison', state: 'Wisconsin', stateAbbr: 'WI', region: 'midwest', climateNote: 'cold winters and campus sitters', facilityNote: 'Madison boarding typically wants rabies, DHPP, and Bordetella.' },
  { slug: 'lubbock', name: 'Lubbock', state: 'Texas', stateAbbr: 'TX', region: 'south', climateNote: 'dry heat and wind', facilityNote: 'Lubbock facilities usually want rabies and DHPP.' },
  { slug: 'scottsdale', name: 'Scottsdale', state: 'Arizona', stateAbbr: 'AZ', region: 'west', climateNote: 'resort boarding and extreme heat', facilityNote: 'Scottsdale daycare often wants vaccines plus a heat-safety card.' },
  { slug: 'reno', name: 'Reno', state: 'Nevada', stateAbbr: 'NV', region: 'west', climateNote: 'high desert and Tahoe weekends', facilityNote: 'Reno kennels typically want rabies, DHPP, and Bordetella.' },
  { slug: 'buffalo', name: 'Buffalo', state: 'New York', stateAbbr: 'NY', region: 'northeast', climateNote: 'lake-effect snow', facilityNote: 'Buffalo boarding usually wants rabies, DHPP, and Bordetella.' },
  { slug: 'gilbert', name: 'Gilbert', state: 'Arizona', stateAbbr: 'AZ', region: 'west', climateNote: 'family suburbs and desert heat', facilityNote: 'Gilbert facilities typically want rabies and core vaccines.' },
  { slug: 'glendale-az', name: 'Glendale', state: 'Arizona', stateAbbr: 'AZ', region: 'west', climateNote: 'desert heat', facilityNote: 'Glendale kennels usually want rabies, DHPP, and Bordetella.' },
  { slug: 'north-las-vegas', name: 'North Las Vegas', state: 'Nevada', stateAbbr: 'NV', region: 'west', climateNote: 'heat and travel', facilityNote: 'North Las Vegas boarding typically wants rabies plus core vaccines.' },
  { slug: 'winston-salem', name: 'Winston-Salem', state: 'North Carolina', stateAbbr: 'NC', region: 'south', climateNote: 'humid summers', facilityNote: 'Winston-Salem daycare often wants DHPP, rabies, and Bordetella.' },
  { slug: 'chesapeake', name: 'Chesapeake', state: 'Virginia', stateAbbr: 'VA', region: 'south', climateNote: 'coastal humidity and military families', facilityNote: 'Chesapeake kennels typically want rabies, DHPP, and Bordetella.' },
  { slug: 'norfolk', name: 'Norfolk', state: 'Virginia', stateAbbr: 'VA', region: 'south', climateNote: 'navy PCS moves', facilityNote: 'Norfolk boarding wants rabies, microchip, and a dated health certificate.' },
  { slug: 'fremont', name: 'Fremont', state: 'California', stateAbbr: 'CA', region: 'west', climateNote: 'Bay Area commute households', facilityNote: 'Fremont daycare usually wants digital vaccine copies.' },
  { slug: 'garland', name: 'Garland', state: 'Texas', stateAbbr: 'TX', region: 'south', climateNote: 'DFW suburbs', facilityNote: 'Garland facilities typically want rabies, DHPP, and Bordetella.' },
  { slug: 'irving', name: 'Irving', state: 'Texas', stateAbbr: 'TX', region: 'south', climateNote: 'airport-adjacent travel', facilityNote: 'Irving kennels often want rabies, DHPP, Bordetella, and a health certificate.' },
  { slug: 'hialeah', name: 'Hialeah', state: 'Florida', stateAbbr: 'FL', region: 'south', climateNote: 'south Florida humidity and bilingual clinics', facilityNote: 'Hialeah boarding typically wants rabies plus core vaccines.' },
  { slug: 'richmond', name: 'Richmond', state: 'Virginia', stateAbbr: 'VA', region: 'south', climateNote: 'humid summers and I-95 travel', facilityNote: 'Richmond daycare usually wants DHPP, rabies, and Bordetella.' },
  { slug: 'boise', name: 'Boise', state: 'Idaho', stateAbbr: 'ID', region: 'west', climateNote: 'dry climate and outdoor dogs', facilityNote: 'Boise kennels typically want rabies, DHPP, and Bordetella.' },
  { slug: 'spokane', name: 'Spokane', state: 'Washington', stateAbbr: 'WA', region: 'west', climateNote: 'inland northwest winters', facilityNote: 'Spokane boarding usually wants rabies, DHPP, and Bordetella.' },
  { slug: 'baton-rouge', name: 'Baton Rouge', state: 'Louisiana', stateAbbr: 'LA', region: 'south', climateNote: 'humidity, heat, and storm prep', facilityNote: 'Baton Rouge facilities want rabies plus parasite prevention dates.' },
  { slug: 'tacoma', name: 'Tacoma', state: 'Washington', stateAbbr: 'WA', region: 'west', climateNote: 'rain and military families', facilityNote: 'Tacoma daycare typically wants DHPP, rabies, Bordetella, and lepto.' },
];

export const RESOURCE_TOPICS: readonly ResourceTopic[] = [
  { slug: 'dog-boarding-vaccine-requirements', label: 'Dog Boarding Vaccine Requirements', kicker: 'Boarding intake', searchIntent: 'rabies DHPP Bordetella daycare kennel vaccine proof' },
  { slug: 'cat-boarding-vaccine-requirements', label: 'Cat Boarding Vaccine Requirements', kicker: 'Cattery intake', searchIntent: 'FVRCP rabies FeLV boarding cattery records' },
  { slug: 'dog-daycare-shot-records', label: 'Dog Daycare Shot Records', kicker: 'Group play intake', searchIntent: 'daycare DHPP Bordetella influenza fecal records' },
  { slug: 'pet-sitter-medical-handoff', label: 'Pet Sitter Medical Handoff', kicker: 'Sitter packet', searchIntent: 'petsitter medication allergy emergency vet records' },
  { slug: 'emergency-vet-records-kit', label: 'Emergency Vet Records Kit', kicker: 'ER intake', searchIntent: 'emergency vet records medications allergies QR' },
  { slug: 'rabies-certificate-copy', label: 'Rabies Certificate Digital Copy', kicker: 'Rabies proof', searchIntent: 'rabies certificate PDF tag number clinic' },
  { slug: 'titer-records-for-travel', label: 'Titer Records for Travel', kicker: 'Export titer', searchIntent: 'rabies titer FAVN travel records' },
  { slug: 'puppy-class-vaccine-proof', label: 'Puppy Class Vaccine Proof', kicker: 'Training intake', searchIntent: 'puppy class DA2PP vaccine proof' },
  { slug: 'airline-pet-health-certificate', label: 'Airline Pet Health Certificate', kicker: 'Flight packet', searchIntent: 'airline health certificate APHIS pet travel' },
  { slug: 'lost-pet-qr-id', label: 'Lost Pet QR ID Kit', kicker: 'Recovery ID', searchIntent: 'lost pet QR microchip emergency profile' },
  { slug: 'new-puppy-health-folder', label: 'New Puppy Health Folder', kicker: 'First 90 days', searchIntent: 'puppy vaccines deworming records folder' },
  { slug: 'new-kitten-health-folder', label: 'New Kitten Health Folder', kicker: 'First 90 days', searchIntent: 'kitten FVRCP rabies records folder' },
  { slug: 'senior-dog-medication-log', label: 'Senior Dog Medication Log', kicker: 'Chronic meds', searchIntent: 'senior dog medication log NSAID kidney' },
  { slug: 'multi-pet-household-records', label: 'Multi-Pet Household Records', kicker: 'Household vault', searchIntent: 'multi pet records vaccines reminders' },
  { slug: 'groomer-vaccine-proof', label: 'Groomer Vaccine Proof', kicker: 'Salon intake', searchIntent: 'groomer rabies vaccine requirements' },
  { slug: 'dog-park-vaccine-rules', label: 'Dog Park Vaccine Rules', kicker: 'Public play', searchIntent: 'dog park rabies DHPP requirements' },
  { slug: 'foster-intake-records', label: 'Foster Intake Records', kicker: 'Rescue handoff', searchIntent: 'foster intake vaccines medical history' },
  { slug: 'moving-with-pets-documents', label: 'Moving With Pets Document Packet', kicker: 'Relocation file', searchIntent: 'moving pets records health certificate' },
  { slug: 'pet-insurance-claim-packet', label: 'Pet Insurance Claim Packet', kicker: 'Claims file', searchIntent: 'pet insurance claim invoices records' },
  { slug: 'after-hours-emergency-card', label: 'After-Hours Emergency Card', kicker: 'Night ER', searchIntent: 'after hours emergency card vet phone meds' },
];

export function getResourcePath(citySlug: string, topicSlug: string): string {
  return `/resources/${citySlug}/${topicSlug}`;
}

export const RESOURCE_MATRIX: readonly ResourceMatrixEntry[] = RESOURCE_CITIES.flatMap((city) =>
  RESOURCE_TOPICS.map((topic) => ({
    city,
    topic,
    path: getResourcePath(city.slug, topic.slug),
  })),
);

if (RESOURCE_CITIES.length !== EXPECTED_RESOURCE_CITY_COUNT) {
  throw new Error(`Expected ${EXPECTED_RESOURCE_CITY_COUNT} cities, got ${RESOURCE_CITIES.length}`);
}
if (RESOURCE_TOPICS.length !== EXPECTED_RESOURCE_TOPIC_COUNT) {
  throw new Error(`Expected ${EXPECTED_RESOURCE_TOPIC_COUNT} topics, got ${RESOURCE_TOPICS.length}`);
}
if (RESOURCE_MATRIX.length !== EXPECTED_RESOURCE_URL_COUNT) {
  throw new Error(`Expected ${EXPECTED_RESOURCE_URL_COUNT} resource URLs, got ${RESOURCE_MATRIX.length}`);
}

const CITY_BY_SLUG = new Map(RESOURCE_CITIES.map((city) => [city.slug, city]));
const TOPIC_BY_SLUG = new Map(RESOURCE_TOPICS.map((topic) => [topic.slug, topic]));
const ENTRY_BY_PATH = new Map(RESOURCE_MATRIX.map((entry) => [entry.path, entry]));

export function getResourceCity(slug: string | undefined): ResourceCity | null {
  if (!slug) return null;
  return CITY_BY_SLUG.get(slug.toLowerCase()) ?? null;
}

export function getResourceTopic(slug: string | undefined): ResourceTopic | null {
  if (!slug) return null;
  return TOPIC_BY_SLUG.get(slug.toLowerCase()) ?? null;
}

export function getResourceEntry(citySlug: string | undefined, topicSlug: string | undefined): ResourceMatrixEntry | null {
  if (!citySlug || !topicSlug) return null;
  return ENTRY_BY_PATH.get(getResourcePath(citySlug.toLowerCase(), topicSlug.toLowerCase())) ?? null;
}

export function isResourcePath(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length === 3 && parts[0] === 'resources';
}

export function listResourceEntries(): readonly ResourceMatrixEntry[] {
  return RESOURCE_MATRIX;
}

export function listTopicsForCity(citySlug: string, excludeTopic?: string): readonly ResourceMatrixEntry[] {
  return RESOURCE_MATRIX.filter((entry) => entry.city.slug === citySlug && entry.topic.slug !== excludeTopic);
}

export function listNearbyCityPages(entry: ResourceMatrixEntry, limit = 8): readonly ResourceMatrixEntry[] {
  const sameRegion = RESOURCE_MATRIX.filter(
    (candidate) =>
      candidate.topic.slug === entry.topic.slug &&
      candidate.city.slug !== entry.city.slug &&
      candidate.city.region === entry.city.region,
  );
  const others = RESOURCE_MATRIX.filter(
    (candidate) => candidate.topic.slug === entry.topic.slug && candidate.city.slug !== entry.city.slug,
  );
  const picked: ResourceMatrixEntry[] = [];
  const seen = new Set<string>();
  for (const candidate of [...sameRegion, ...others]) {
    if (seen.has(candidate.path)) continue;
    seen.add(candidate.path);
    picked.push(candidate);
    if (picked.length >= limit) break;
  }
  return picked;
}
