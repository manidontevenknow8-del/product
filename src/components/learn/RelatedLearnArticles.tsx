import { Link } from 'react-router-dom';
import type { LearnArticle } from '@/types/learn';
import { ROUTES } from '@/routes/paths';
import styles from './RelatedLearnArticles.module.css';

type RelatedLearnArticlesProps = {
  articles: LearnArticle[];
};

export function RelatedLearnArticles({ articles }: RelatedLearnArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="related-learn-heading">
      <h2 id="related-learn-heading" className={styles.title}>
        Related guides
      </h2>
      <ul className={styles.list}>
        {articles.map((article) => (
          <li key={article.slug}>
            <Link to={`${ROUTES.LEARN}/${article.slug}`} className={styles.link}>
              <span className={styles.articleTitle}>
                {article.title.replace(' | PetClues Learn', '')}
              </span>
              <span className={styles.excerpt}>{article.excerpt}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
