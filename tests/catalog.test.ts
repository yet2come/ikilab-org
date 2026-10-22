import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../src/data/catalog.ts';
import { validateCatalog, type CatalogItem } from '../src/lib/feed.ts';

const validProject: CatalogItem = {
  key: 'sample-project',
  kind: 'project',
  title: 'サンプル',
  body: '説明文',
  href: '/projects/sample-project',
  status: 'active',
  tags: ['テスト'],
  updated: '2026-04-09',
  placement: 'list',
};

const validCase: CatalogItem = {
  key: 'sample-case',
  kind: 'case',
  title: '事例',
  body: '説明文',
  status: 'ended',
  tags: ['テスト'],
  updated: '2026-04-09',
  category: 'Education / Community',
};

// 本物の catalog に1項目を足した配列。top 6件の検査を満たしたまま、壊した1項目だけを検査させる
function withItem(item: CatalogItem): CatalogItem[] {
  return [...catalog, item];
}

test('catalog passes validation', () => {
  assert.doesNotThrow(() => validateCatalog(catalog));
});

test('catalog has 11 projects and 3 cases', () => {
  assert.equal(catalog.filter((i) => i.kind === 'project').length, 11);
  assert.equal(catalog.filter((i) => i.kind === 'case').length, 3);
});

test('exactly 6 projects are placed top', () => {
  assert.equal(catalog.filter((i) => i.placement === 'top').length, 6);
});

test('catalog order matches current display', () => {
  assert.deepEqual(catalog.map((i) => i.key), [
    'iki-keikaku',
    'iki-gikai',
    'iki-calendar',
    'iki-pop-sim',
    'rito-job-matching',
    'iki-loc',
    'iki-digital-twin',
    'iki-open-dialogue',
    'iki-now',
    'rito-mobility',
    'kanko-dx',
    'iki-kodomo-senkyo',
    'sakusen-kaigi',
    'shima-challenge-2024',
  ]);
});

test('valid extra items pass', () => {
  assert.doesNotThrow(() => validateCatalog(withItem(validProject)));
  assert.doesNotThrow(() => validateCatalog(withItem(validCase)));
});

test('rejects duplicate key', () => {
  assert.throws(() => validateCatalog(withItem({ ...validProject, key: 'iki-keikaku' })), /iki-keikaku.*key/);
});

test('rejects key with uppercase', () => {
  assert.throws(() => validateCatalog(withItem({ ...validProject, key: 'Sample' })), /Sample.*key/);
});

test('rejects empty tags', () => {
  assert.throws(() => validateCatalog(withItem({ ...validProject, tags: [] })), /sample-project.*tags/);
});

test('rejects non-existent date', () => {
  assert.throws(() => validateCatalog(withItem({ ...validProject, updated: '2026-02-30' })), /sample-project.*updated/);
});

test('rejects wrong date format', () => {
  assert.throws(() => validateCatalog(withItem({ ...validProject, updated: '2026/04/09' })), /sample-project.*updated/);
});

test('rejects unknown status', () => {
  const item = { ...validProject, status: 'done' } as unknown as CatalogItem;
  assert.throws(() => validateCatalog(withItem(item)), /sample-project.*status/);
});

test('rejects ended project', () => {
  assert.throws(() => validateCatalog(withItem({ ...validProject, status: 'ended' })), /sample-project.*status/);
});

test('rejects project without placement', () => {
  const { placement: _, ...item } = validProject;
  assert.throws(() => validateCatalog(withItem(item)), /sample-project.*placement/);
});

test('rejects case without category', () => {
  const { category: _, ...item } = validCase;
  assert.throws(() => validateCatalog(withItem(item)), /sample-case.*category/);
});

test('rejects when top placement is not 6', () => {
  const items = catalog.map((i) => (i.key === 'iki-loc' ? { ...i, placement: 'list' as const } : i));
  assert.throws(() => validateCatalog(items), /placement/);
});

test('rejects href that does not match kind and key', () => {
  assert.throws(() => validateCatalog(withItem({ ...validProject, href: '/projects/other' })), /sample-project.*href/);
  assert.throws(() => validateCatalog(withItem({ ...validCase, href: '/projects/sample-case' })), /sample-case.*href/);
});

test('accepts href with trailing slash', () => {
  assert.doesNotThrow(() => validateCatalog(withItem({ ...validProject, href: '/projects/sample-project/' })));
});
