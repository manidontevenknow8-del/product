import { getBlogImageForSlug } from '@/data/blogImages';
import type { BlogPost } from '@/types/blog';

/** Ensures every post uses its slug-specific hero image */
export function attachBlogImages(posts: BlogPost[]): BlogPost[] {
  return posts.map((post) => ({
    ...post,
    featuredImage: getBlogImageForSlug(post.slug),
  }));
}
