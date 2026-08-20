import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { BreedHealthTemplate } from '@/templates/BreedHealthTemplate';
import { getBreedHealthPage } from '@/content/breedHealthPages';
import { resolveIssueLinks, resolveSymptomHref } from '@/content/internalPaths';

function renderMarkdown(markdown: string, issueLinks: { issue: string; href: string }[]) {
  const blocks = markdown.split(/\n\n+/);
  return blocks.map((block, index) => {
    if (block.startsWith('## ')) {
      return <h2 key={index}>{block.replace(/^##\s+/, '')}</h2>;
    }
    if (
      /^\d+\.\s/.test(block) ||
      block.split('\n').every((line) => /^\d+\.\s/.test(line) || !line.trim())
    ) {
      const items = block.split('\n').filter(Boolean);
      return (
        <ol key={index}>
          {items.map((item) => (
            <li key={item}>{item.replace(/^\d+\.\s+/, '')}</li>
          ))}
        </ol>
      );
    }

    let text = block;
    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    for (const link of issueLinks) {
      const at = text.indexOf(link.issue, cursor);
      if (at === -1) continue;
      if (at > cursor) nodes.push(text.slice(cursor, at));
      nodes.push(
        <Link key={`${link.href}-${at}`} to={link.href}>
          {link.issue}
        </Link>,
      );
      cursor = at + link.issue.length;
    }
    if (nodes.length) {
      nodes.push(text.slice(cursor));
      return <p key={index}>{nodes}</p>;
    }

    const parts = block.split(/(\/symptoms\/[a-z0-9/-]+)/g);
    return (
      <p key={index}>
        {parts.map((part, i) => {
          if (!part.startsWith('/symptoms/')) {
            return <span key={`${i}-${part.slice(0, 12)}`}>{part}</span>;
          }
          const href = resolveSymptomHref(part) ?? part;
          return (
            <Link key={`${part}-${i}`} to={href}>
              {part}
            </Link>
          );
        })}
      </p>
    );
  });
}

export function BreedHealthGuidePage() {
  const { breedSlug = '', stageSlug = '' } = useParams<{ breedSlug: string; stageSlug: string }>();
  const stage = stageSlug.replace(/-health-guide$/, '');
  const page = getBreedHealthPage(breedSlug, stage);

  if (!page) {
    return (
      <>
        <Header variant="landing" />
        <main style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1.25rem' }}>
          <h1>Breed guide not found</h1>
          <p>
            This breed × life-stage page is missing, skipped for veterinary review, or not generated
            yet.
          </p>
          <Link to="/breeds">Back to breeds</Link>
        </main>
        <Footer />
      </>
    );
  }

  const { breed, lifeStage, content } = page;
  const issueLinks = resolveIssueLinks(content.issueLinks);

  return (
    <>
      <Header variant="landing" />
      <BreedHealthTemplate
        breed={breed}
        lifeStage={lifeStage}
        path={content.path}
        primaryKeyword={content.primaryKeyword}
        metaDescription={content.metaDescription}
        body={
          <>
            {renderMarkdown(content.markdown, issueLinks)}
            {issueLinks.length > 0 ? (
              <>
                <h2>Symptom guides for issues on this page</h2>
                <ul>
                  {issueLinks.map((link) => (
                    <li key={link.href + link.issue}>
                      <Link to={link.href}>{link.issue}</Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </>
        }
        faqs={content.faqs}
      />
      <Footer />
    </>
  );
}

export default BreedHealthGuidePage;
