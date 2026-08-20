import type { ReactNode } from 'react';
import type { ComparisonRecord } from '@content-types/comparison';
import { comparisons } from '@/content/loadContentData';
import type { ContentFaq } from '@/templates/shared/ContentTemplateShell';
import { ROUTES } from '@/routes/paths';

export type ComparisonCompleteness = {
  ok: boolean;
  reasons: string[];
};

/** Route slug: petclues-vs-{competitor-slug} */
export function toComparePageSlug(competitorSlug: string): string {
  return `petclues-vs-${competitorSlug}`;
}

export function toComparePagePath(competitorSlug: string): string {
  return `${ROUTES.COMPARE}/${toComparePageSlug(competitorSlug)}`;
}

/** Parse /compare/:slug param → competitor slug from comparisons.json */
export function competitorSlugFromPageSlug(pageSlug: string): string | null {
  if (!pageSlug.startsWith('petclues-vs-')) return null;
  const rest = pageSlug.slice('petclues-vs-'.length);
  return rest.length > 0 ? rest : null;
}

export function auditComparisonRecord(record: ComparisonRecord): ComparisonCompleteness {
  const reasons: string[] = [];
  if (!record.slug?.trim()) reasons.push('missing slug');
  if (!record.name?.trim()) reasons.push('missing name');
  if (!record.category) reasons.push('missing category');
  if (!Array.isArray(record.features) || record.features.length === 0) {
    reasons.push('no verified feature rows');
  } else {
    record.features.forEach((row, index) => {
      if (!row.feature?.trim()) reasons.push(`feature[${index}] missing label`);
      if (!row.value?.trim()) reasons.push(`feature[${index}] missing value`);
      if (!row.source?.trim()) reasons.push(`feature[${index}] missing source`);
    });
  }
  return { ok: reasons.length === 0, reasons };
}

export function listFlaggedComparisons(): Array<{
  slug: string;
  name: string;
  reasons: string[];
  source_notes?: string;
}> {
  return comparisons
    .map((record) => {
      const audit = auditComparisonRecord(record);
      if (audit.ok) return null;
      return {
        slug: record.slug,
        name: record.name,
        reasons: audit.reasons,
        source_notes: record.source_notes,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

export function listPublishableComparisons(): ComparisonRecord[] {
  return comparisons.filter((record) => auditComparisonRecord(record).ok);
}

export function getPublishableComparisonBySlug(slug: string): ComparisonRecord | undefined {
  const record = comparisons.find((c) => c.slug === slug);
  if (!record || !auditComparisonRecord(record).ok) return undefined;
  return record;
}

export function getPublishableComparisonByPageSlug(
  pageSlug: string,
): ComparisonRecord | undefined {
  const competitorSlug = competitorSlugFromPageSlug(pageSlug);
  if (!competitorSlug) return undefined;
  return getPublishableComparisonBySlug(competitorSlug);
}

function categoryLabel(category: ComparisonRecord['category']): string {
  return category.replace(/-/g, ' ');
}

function presentFeatures(record: ComparisonRecord): ComparisonRecord['features'] {
  return record.features.filter((row) => {
    const v = row.value.toLowerCase();
    return v.startsWith('yes') || v.startsWith('partial') || v.startsWith('often');
  });
}

function limitedFeatures(record: ComparisonRecord): ComparisonRecord['features'] {
  return record.features.filter((row) => {
    const v = row.value.toLowerCase();
    return (
      v.startsWith('no') ||
      v.startsWith('not') ||
      v.startsWith('poor') ||
      v.startsWith('high') ||
      v.includes('not claimed') ||
      v.includes('not a core') ||
      v.includes('primary value is clinic')
    );
  });
}

export function buildComparisonPrimaryKeyword(record: ComparisonRecord): string {
  return `PetClues vs ${record.name}`;
}

export function buildComparisonMetaDescription(record: ComparisonRecord): string {
  const verifiedCount = record.features.length;
  return `PetClues vs ${record.name}: ${verifiedCount} verified feature rows from primary sources. Founding member pricing stays front and center while the vault is early.`;
}

export function buildComparisonFaqs(record: ComparisonRecord): ContentFaq[] {
  const faqs: ContentFaq[] = [
    {
      question: `What category is ${record.name}?`,
      answer: `${categoryLabel(record.category)}. This page only lists claims we could verify with a cited source.`,
    },
    {
      question: `Where do the ${record.name} feature rows come from?`,
      answer:
        record.website != null
          ? `Each row cites a source URL or baseline note. Start with ${record.website} and the per-row sources in the table above.`
          : 'Each row cites a baseline note or primary source in the feature table. We do not invent competitor capabilities.',
    },
  ];

  const limited = limitedFeatures(record);
  if (limited[0]) {
    faqs.push({
      question: `Where does ${record.name} fall short for pet records?`,
      answer: `Verified limitation: ${limited[0].feature} — ${limited[0].value}.`,
    });
  } else {
    const present = presentFeatures(record);
    if (present[0]) {
      faqs.push({
        question: `What does ${record.name} do well (verified)?`,
        answer: `${present[0].feature}: ${present[0].value}.`,
      });
    }
  }

  return faqs;
}

/** Body copy derived only from verified comparison rows + category framing. */
export function buildComparisonBody(record: ComparisonRecord): ReactNode {
  const present = presentFeatures(record);
  const limited = limitedFeatures(record);

  return (
    <>
      <h2>How to read this comparison</h2>
      <p>
        Every feature row for {record.name} cites a source. If a capability is not in the table,
        treat it as unverified — we do not guess at competitor pricing or undocumented features.
      </p>

      {record.identity_note ? (
        <>
          <h2>Identity note</h2>
          <p>{record.identity_note}</p>
        </>
      ) : null}

      <h2>Category framing</h2>
      <p>
        {record.name} sits in the “{categoryLabel(record.category)}” category. PetClues is an
        owner-owned pet health vault with reminders and shareable records — use the table to compare
        on verified surfaces, then decide with founding member pricing in view.
      </p>

      {present.length > 0 ? (
        <>
          <h2>What {record.name} does (verified)</h2>
          <ul>
            {present.map((row) => (
              <li key={row.feature}>
                {row.feature}: {row.value}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {limited.length > 0 ? (
        <>
          <h2>Where {record.name} is limited (verified)</h2>
          <ul>
            {limited.map((row) => (
              <li key={row.feature}>
                {row.feature}: {row.value}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h2>Why PetClues shows up in this matchup</h2>
      <p>
        PetClues is built for the moment paper, folders, or clinic-only portals fail: one place for
        certificates, meds, vaccines, and an emergency-ready summary you control. The founding
        member offer is the conversion path on these pages — compare features first, then lock early
        pricing if the vault fits.
      </p>

      {record.source_notes ? (
        <>
          <h2>Editor notes</h2>
          <p>{record.source_notes}</p>
        </>
      ) : null}
    </>
  );
}
