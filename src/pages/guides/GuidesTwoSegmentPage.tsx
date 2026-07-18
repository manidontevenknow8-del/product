import { useParams } from 'react-router-dom';
import { getBreedConditionBySegments } from '@/data/breedConditions';
import { isProgrammaticCollectionId } from '@/data/programmatic';
import { BreedConditionPage } from './BreedConditionPage';
import { GuidesDetailPage } from './GuidesDetailPage';

/**
 * Resolves `/guides/:breed/:condition` against either the breed–condition pSEO
 * matrix or legacy programmatic collection guides (`/guides/:collection/:slug`).
 */
export function GuidesTwoSegmentPage() {
  const { breed, condition } = useParams<{ breed: string; condition: string }>();
  const breedCondition = getBreedConditionBySegments(breed, condition);

  if (breedCondition) {
    return <BreedConditionPage meta={breedCondition} />;
  }

  // Legacy programmatic guides used :collection/:slug — same URL shape.
  if (breed && isProgrammaticCollectionId(breed)) {
    return <GuidesDetailPage collectionOverride={breed} slugOverride={condition} />;
  }

  return <BreedConditionPage />;
}
