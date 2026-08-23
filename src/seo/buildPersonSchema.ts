import type { EditorialPerson } from '@/data/editorialBoard';

const SITE_ORIGIN = 'https://petclues.com';

export function buildPersonSchema(person: EditorialPerson) {
  return {
    '@type': 'Person' as const,
    name: person.name,
    ...(person.role ? { jobTitle: person.role } : {}),
    description: person.bio,
    url: person.url.startsWith('/') ? `${SITE_ORIGIN}${person.url}` : person.url,
    ...(person.image ? { image: person.image } : {}),
    ...(person.sameAs && person.sameAs.length > 0 ? { sameAs: person.sameAs } : {}),
    ...(person.specialty ? { knowsAbout: person.specialty } : {}),
  };
}

export function buildReviewedBySchema(person: EditorialPerson) {
  // Team entries without personal credentials are Organizations, not fake Persons.
  const type = person.credentials ? ('Person' as const) : ('Organization' as const);
  return {
    '@type': type,
    name: person.name,
    ...(person.role && type === 'Person' ? { jobTitle: person.role } : {}),
    ...(person.role && type === 'Organization' ? { description: person.role } : {}),
    url: person.url.startsWith('/') ? `${SITE_ORIGIN}${person.url}` : person.url,
    ...(person.credentials ? { honorificSuffix: person.credentials } : {}),
    ...(person.sameAs && person.sameAs.length > 0 ? { sameAs: person.sameAs } : {}),
  };
}
