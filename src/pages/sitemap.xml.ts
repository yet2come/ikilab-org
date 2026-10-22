import type { APIRoute } from 'astro';
import { buildSitemapIndex } from '../lib/sitemap';

// robots.txt から参照する固定 URL。中身は @astrojs/sitemap が出す sitemap-0.xml を指す index
export const GET: APIRoute = () =>
  new Response(buildSitemapIndex(['https://ikilab.org/sitemap-0.xml']), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
