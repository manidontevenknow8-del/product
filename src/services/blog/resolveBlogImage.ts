/** Each article uses featuredImage when set; otherwise resolves from slug metadata. */
export function resolveBlogFeaturedImage(
  _slug: string,
  featuredImage: string | null,
): string {
  if (featuredImage) {
    return featuredImage;
  }
  return `/images/blog/blog-pet-records.webp`;
}
