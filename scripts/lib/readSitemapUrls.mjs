import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPublicDir = join(__dirname, '..', '..', 'public');

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

/**
 * Read every page URL from sitemap.xml (index or flat urlset) and child sitemaps.
 */
export function readSitemapUrls(publicDir = defaultPublicDir) {
  const indexPath = join(publicDir, 'sitemap.xml');
  const indexXml = readFileSync(indexPath, 'utf8');

  if (indexXml.includes('<sitemapindex')) {
    const childFiles = extractLocs(indexXml).map((loc) => {
      const fileName = new URL(loc).pathname.split('/').pop();
      if (!fileName) {
        throw new Error(`Invalid child sitemap URL in index: ${loc}`);
      }
      return fileName;
    });

    const urls = [];
    for (const fileName of childFiles) {
      const childPath = join(publicDir, fileName);
      if (!existsSync(childPath)) {
        throw new Error(`Missing child sitemap referenced by index: ${fileName}`);
      }
      urls.push(...extractLocs(readFileSync(childPath, 'utf8')));
    }
    return urls;
  }

  return extractLocs(indexXml);
}
