// sitemap まわりの組み立て。astro.config.mjs と src/pages/sitemap.xml.ts から使う。
import { itemUrl, type CatalogItem } from './feed.ts';

/** sitemap index の XML を組み立てる */
export function buildSitemapIndex(sitemapUrls: string[]): string {
  const entries = sitemapUrls.map((url) => `<sitemap><loc>${url}</loc></sitemap>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>`;
}

/** ページがある項目の URL（末尾 / 付き）から lastmod（YYYY-MM-DD）への対応表 */
export function lastmodMap(items: CatalogItem[], site: string): Map<string, string> {
  return new Map(items.filter((item) => item.href).map((item) => [itemUrl(item, site), item.updated]));
}

/** フィードとサイトマップ自身はサイトマップに載せない */
export function isExcludedFromSitemap(url: string): boolean {
  return /\/(feed\.json|sitemap\.xml)\/?$/.test(url);
}
