import type { APIRoute } from 'astro';
import { catalog } from '../data/catalog';
import { buildFeed } from '../lib/feed';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(buildFeed(catalog, 'https://ikilab.org'), null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
