/** Normalize em/en dashes in blog copy for plain, readable typography. */
export function sanitizeBlogTypography(content: string): string {
  return content
    .replace(/\u2014/g, ' - ')
    .replace(/\u2013/g, '-')
    .replace(/\s+-\s+/g, ' - ')
    .replace(/  +/g, ' ');
}
