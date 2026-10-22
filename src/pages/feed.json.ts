import type { APIRoute } from 'astro';
import { catalog } from '../data/catalog';
import { buildFeed } from '../lib/feed';
import { SITE } from '../lib/site';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(buildFeed(catalog, SITE), null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
