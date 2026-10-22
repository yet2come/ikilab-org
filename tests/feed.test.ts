import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../src/data/catalog.ts';
import { buildFeed, itemUrl, type CatalogItem } from '../src/lib/feed.ts';

const site = 'https://ikilab.org';
const feed = buildFeed(catalog, site);
const byKey = (key: string) => {
  const item = feed.items.find((i) => i.id.endsWith(`/${key}`));
  assert.ok(item, `${key} がフィードにない`);
  return item;
};

test('feed header', () => {
  assert.equal(feed.version, 'https://jsonfeed.org/version/1.1');
  assert.equal(feed.title, 'IKILAB — Projects & Cases');
  assert.equal(feed.home_page_url, 'https://ikilab.org/');
  assert.equal(feed.feed_url, 'https://ikilab.org/feed.json');
  assert.equal(feed.language, 'ja');
  assert.ok(feed.description.length > 0);
  assert.ok(feed.icon.startsWith('https://ikilab.org/'));
  assert.ok(feed.favicon.startsWith('https://ikilab.org/'));
});

test('item fields for a page item', () => {
  const source = catalog.find((i) => i.key === 'iki-keikaku')!;
  const item = byKey('iki-keikaku');
  assert.equal(item.id, 'https://ikilab.org/items/project/iki-keikaku');
  assert.equal(item.url, 'https://ikilab.org/projects/iki-keikaku/');
  assert.equal(item.title, source.title);
  assert.equal(item.content_text, source.body);
  assert.equal(item.summary, source.body);
  assert.equal(item.date_modified, '2026-08-11T00:00:00+09:00');
  assert.deepEqual(item.tags, source.tags);
  assert.deepEqual(item._ikilab, {
    about: 'https://github.com/yet2come/ikilab-org/blob/main/docs/feed.md',
    kind: 'project',
    status: 'active',
    status_label: '進行中',
    has_page: true,
  });
});

test('url for items without a page', () => {
  const dialogue = byKey('iki-open-dialogue');
  assert.equal(dialogue.url, 'https://ikilab.org/projects/#iki-open-dialogue');
  assert.equal(dialogue._ikilab.has_page, false);
  const sakusen = byKey('sakusen-kaigi');
  assert.equal(sakusen.url, 'https://ikilab.org/#sakusen-kaigi');
  assert.equal(sakusen._ikilab.has_page, false);
});

test('case item has category', () => {
  const item = byKey('iki-kodomo-senkyo');
  assert.equal(item.url, 'https://ikilab.org/cases/iki-kodomo-senkyo/');
  assert.equal(item._ikilab.kind, 'case');
  assert.equal(item._ikilab.category, 'Education / Community');
});

test('status labels', () => {
  assert.equal(byKey('kanko-dx')._ikilab.status_label, '計画中');
  assert.equal(byKey('shima-challenge-2024')._ikilab.status_label, '終了');
});

test('href with trailing slash is not doubled', () => {
  const item = { ...catalog[0], href: '/projects/x/' } as CatalogItem;
  assert.equal(itemUrl(item, site), 'https://ikilab.org/projects/x/');
});

test('items sorted by date_modified desc, ties keep catalog order', () => {
  assert.deepEqual(
    feed.items.map((i) => i.id.split('/').pop()),
    [
      'iki-keikaku',
      'iki-gikai',
      'iki-calendar',
      'iki-pop-sim',
      'rito-job-matching',
      'iki-loc',
      'iki-digital-twin',
      'iki-open-dialogue',
      'iki-now',
      'iki-kodomo-senkyo',
      'rito-mobility',
      'kanko-dx',
      'sakusen-kaigi',
      'shima-challenge-2024',
    ],
  );
});

test('buildFeed validates', () => {
  const broken = catalog.map((i, n) => (n === 0 ? { ...i, tags: [] } : i));
  assert.throws(() => buildFeed(broken, site), /tags/);
});
