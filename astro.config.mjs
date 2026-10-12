// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://ikilab.org',
  integrations: [sitemap()],
  // Astro 7 の既定（'jsx'）はインライン要素間の空白を削除するため、v6 と同じ HTML 方式を維持する
  compressHTML: true,
});
