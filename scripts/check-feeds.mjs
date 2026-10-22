// ビルド後の dist/ を検査する（npm run build のあとに npm run check:feeds）。
// フィード・サイトマップ・robots.txt のどれかが壊れていれば違反を列挙して終了コード 1 で終わる。
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const dist = 'dist';
const site = 'https://ikilab.org';
const errors = [];
const read = (path) => readFileSync(join(dist, path), 'utf8');
const locs = (xml) => new Set([...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]));

// 1. feed.json の形
let feed;
try {
  feed = JSON.parse(read('feed.json'));
} catch (e) {
  errors.push(`feed.json を読めない: ${e.message}`);
}
if (feed) {
  if (feed.version !== 'https://jsonfeed.org/version/1.1') errors.push(`feed.json: version が 1.1 でない（${feed.version}）`);
  if (feed.items?.length !== 14) errors.push(`feed.json: 項目数が 14 でない（${feed.items?.length}）`);
  const ids = new Set();
  for (const item of feed.items ?? []) {
    for (const field of ['id', 'url', 'title', 'content_text', 'date_modified']) {
      if (!item[field]) errors.push(`feed.json: ${item.id ?? '(id なし)'} に ${field} がない`);
    }
    if (!Array.isArray(item.tags) || item.tags.length === 0) errors.push(`feed.json: ${item.id} の tags が空`);
    if (!item._ikilab?.kind || !item._ikilab?.status) errors.push(`feed.json: ${item.id} の _ikilab.kind / status がない`);
    if (ids.has(item.id)) errors.push(`feed.json: id が重複（${item.id}）`);
    ids.add(item.id);

    // 2. ページがある項目は、そのページが実在する
    if (item._ikilab?.has_page) {
      const path = new URL(item.url).pathname;
      if (!existsSync(join(dist, path, 'index.html'))) errors.push(`feed.json: ${item.id} のページ ${path} が dist にない`);
    }
  }
}

// 3. サイトマップが XML として正しい
try {
  execFileSync('xmllint', ['--noout', join(dist, 'sitemap.xml'), join(dist, 'sitemap-0.xml')], { stdio: 'pipe' });
} catch (e) {
  errors.push(`xmllint が失敗: ${e.stderr?.toString().trim() || e.message}`);
}

// 4. /sitemap.xml と sitemap-index.xml の参照先が一致する
try {
  const a = [...locs(read('sitemap.xml'))].sort().join('\n');
  const b = [...locs(read('sitemap-index.xml'))].sort().join('\n');
  if (a !== b) errors.push(`sitemap.xml の参照先が sitemap-index.xml と違う:\n  sitemap.xml: ${a}\n  sitemap-index.xml: ${b}`);
} catch (e) {
  errors.push(`sitemap を読めない: ${e.message}`);
}

// 5. フィードとサイトマップ自身が sitemap-0.xml に載っていない
try {
  for (const loc of locs(read('sitemap-0.xml'))) {
    if (/\/(feed\.json|sitemap\.xml)\/?$/.test(loc)) errors.push(`sitemap-0.xml に ${loc} が載っている`);
  }
} catch (e) {
  errors.push(`sitemap-0.xml を読めない: ${e.message}`);
}

// 6. robots.txt が sitemap.xml を参照している
try {
  if (!read('robots.txt').split('\n').some((line) => line.trim() === `Sitemap: ${site}/sitemap.xml`)) {
    errors.push(`robots.txt に「Sitemap: ${site}/sitemap.xml」の行がない`);
  }
} catch (e) {
  errors.push(`robots.txt を読めない: ${e.message}`);
}

if (errors.length > 0) {
  console.error(`check-feeds: ${errors.length} 件の違反\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('check-feeds: OK');
