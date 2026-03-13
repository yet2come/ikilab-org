// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: cloudflare({
    imageService: 'passthrough',
    sessions: false,
  }),
  site: 'https://ikilab.org',
  integrations: [sitemap()],
});