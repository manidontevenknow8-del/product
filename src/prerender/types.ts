import type { BlogPost, BlogPostListItem } from '@/types/blog';

export type PrerenderBlogPostData = {
  slug: string;
  post: BlogPost | null;
  allPosts: BlogPostListItem[];
};

export type PrerenderBlogIndexData = {
  posts: BlogPostListItem[];
};

export type PrerenderRouteData = {
  blogPost?: PrerenderBlogPostData;
  blogIndex?: PrerenderBlogIndexData;
};

declare global {
  interface Window {
    __PETCLUES_PRERENDER__?: PrerenderRouteData;
  }
}
