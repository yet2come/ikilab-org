// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { catalog } from './src/data/catalog.ts';
import { isExcludedFromSitemap, lastmodMap } from './src/lib/sitemap.ts';

const site = 'https://ikilab.org';
const lastmods = lastmodMap(catalog, site);

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site,
  integrations: [
    sitemap({
      filter: (page) => !isExcludedFromSitemap(page),
      // 詳細ページには catalog.ts の updated を lastmod として付ける
      serialize(item) {
        const lastmod = lastmods.get(item.url);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
  // Astro 7 の既定（'jsx'）はインライン要素間の空白を削除するため、v6 と同じ HTML 方式を維持する
  compressHTML: true,
});
