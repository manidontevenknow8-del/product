import { renderBlogMarkdown } from '@/services/blog/blogContentRenderer';
import styles from './BlogPostBody.module.css';

type BlogPostBodyProps = {
  content: string;
};

export function BlogPostBody({ content }: BlogPostBodyProps) {
  const html = renderBlogMarkdown(content);

  return (
    <div
      className={styles.body}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
