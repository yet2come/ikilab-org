import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../src/data/catalog.ts';
import { buildSitemapIndex, isExcludedFromSitemap, lastmodMap } from '../src/lib/sitemap.ts';

const site = 'https://ikilab.org';

test('buildSitemapIndex', () => {
  const xml = buildSitemapIndex(['https://ikilab.org/sitemap-0.xml']);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.match(xml, /<sitemapindex xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.match(xml, /<sitemap><loc>https:\/\/ikilab\.org\/sitemap-0\.xml<\/loc><\/sitemap>/);
});

test('lastmodMap covers only items with a page', () => {
  const map = lastmodMap(catalog, site);
  assert.equal(map.size, 9);
  assert.equal(map.get('https://ikilab.org/projects/iki-keikaku/'), '2026-08-11');
  assert.equal(map.get('https://ikilab.org/cases/iki-kodomo-senkyo/'), '2026-04-07');
  assert.equal(map.has('https://ikilab.org/projects/#iki-open-dialogue'), false);
});

test('isExcludedFromSitemap', () => {
  assert.equal(isExcludedFromSitemap('https://ikilab.org/feed.json'), true);
  assert.equal(isExcludedFromSitemap('https://ikilab.org/feed.json/'), true);
  assert.equal(isExcludedFromSitemap('https://ikilab.org/sitemap.xml'), true);
  assert.equal(isExcludedFromSitemap('https://ikilab.org/sitemap.xml/'), true);
  assert.equal(isExcludedFromSitemap('https://ikilab.org/projects/'), false);
});
