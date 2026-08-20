import type { ToolRecord } from '@content-types/tool';
import { TOOL_FAMILY_LABELS } from '@content-types/tool';
import type { SEOConfig } from '@/data/seoConfig';
import { DEFAULT_OG_IMAGE, SITE_META } from '@/data/seoConfig';
import { buildBreadcrumbListSchema } from '@/seo/breadcrumbSchema';
import {
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildSoftwareApplicationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
} from '@/seo/structuredDataSchemas';
import { formatMetaDescription, formatPageTitle } from '@/seo/seoFormatters';

export function isToolDownloadPath(pathname: string): boolean {
  if (pathname === '/tools') return true;
  if (!pathname.startsWith('/tools/')) return false;
  const slug = pathname.slice('/tools/'.length);
  if (!slug || slug.includes('/')) return false;
  return slug !== 'vaccine-scheduler' && slug !== 'qr-generator';
}

export function getToolDownloadSEO(tool: ToolRecord): SEOConfig {
  const path = `/tools/${tool.slug}`;
  const title = formatPageTitle(tool.primary_keyword);
  const description = formatMetaDescription(tool.meta_description, title);

  return {
    title,
    description,
    canonical: `${SITE_META.siteUrl}${path}`,
    keywords: `${tool.primary_keyword}, printable pet template, petclues download`,
    ogType: 'article',
    ogTitle: title,
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: tool.h1,
    noIndex: false,
  };
}

export function getToolsHubSEO(): SEOConfig {
  const title = formatPageTitle('Printable pet tools and templates');
  const description = formatMetaDescription(
    'Free printable vaccination sheets, emergency cards, vet visit logs, and pet sitter templates. Unlock downloads with a PetClues account.',
    title,
  );
  return {
    title,
    description,
    canonical: `${SITE_META.siteUrl}/tools`,
    keywords: 'printable pet templates, pet vaccination record sheet, pet emergency card, pet sitter instructions',
    ogType: 'website',
    ogTitle: title,
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues printable pet tools',
    noIndex: false,
  };
}

export function getToolDownloadStructuredData(tool: ToolRecord) {
  const url = `/tools/${tool.slug}`;
  const breadcrumbs = buildBreadcrumbListSchema([
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: TOOL_FAMILY_LABELS[tool.family], path: '/tools' },
    { name: tool.h1, path: url },
  ]);

  const faq = buildFaqPageSchema(
    tool.faqs.map((f) => ({ question: f.question, answer: f.answer })),
  );

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildSoftwareApplicationSchema(),
    buildWebPageSchema({
      url: `${SITE_META.siteUrl}${url}`,
      name: tool.h1,
      description: tool.meta_description,
    }),
    breadcrumbs,
    faq,
  );
}

export function getToolsHubStructuredData(toolCount: number) {
  const url = `${SITE_META.siteUrl}/tools`;
  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildSoftwareApplicationSchema(),
    buildWebPageSchema({
      url,
      name: 'Printable pet tools and templates',
      description: `${toolCount} gated printable templates for pet parents.`,
    }),
    buildBreadcrumbListSchema([
      { name: 'Home', path: '/' },
      { name: 'Tools', path: '/tools' },
    ]),
  );
}
