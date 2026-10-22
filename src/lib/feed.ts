// プロジェクトと事例の一覧データ（src/data/catalog.ts）の型と、フィードの組み立て。
// node --test から直接読めるよう、Astro には依存しない。

export type Kind = 'project' | 'case';
export type Status = 'active' | 'planned' | 'ended';

export interface CatalogItem {
  /** 恒久キー。ページがある項目は slug と同じ。フィードの id とカードの id 属性に使う */
  key: string;
  kind: Kind;
  title: string;
  body: string;
  href?: string;
  status: Status;
  tags: string[];
  /** 内容の最終更新日（JST, YYYY-MM-DD） */
  updated: string;
  /** project のみ。top はトップ 02 と /projects、list は /projects のみ */
  placement?: 'top' | 'list';
  /** case のみ。トップ 03 の分類表示 */
  category?: string;
}

const KINDS: readonly string[] = ['project', 'case'];
const STATUSES: readonly string[] = ['active', 'planned', 'ended'];
const PLACEMENTS: readonly string[] = ['top', 'list'];
const TOP_COUNT = 6;

function isValidDate(value: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

/** 一覧データを検査し、違反があれば項目の key とフィールド名を含めて例外を投げる */
export function validateCatalog(items: CatalogItem[]): void {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const fail = (field: string, detail: string) => errors.push(`${item.key}: ${field} ${detail}`);

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.key)) fail('key', 'は英小文字・数字・ハイフンのみ');
    if (seen.has(item.key)) fail('key', 'が重複している');
    seen.add(item.key);

    if (!KINDS.includes(item.kind)) fail('kind', `が不正（${item.kind}）`);
    if (!item.title) fail('title', 'が空');
    if (!item.body) fail('body', 'が空');
    if (!STATUSES.includes(item.status)) fail('status', `が不正（${item.status}）`);
    if (!Array.isArray(item.tags) || item.tags.length === 0 || item.tags.some((t) => !t)) {
      fail('tags', 'は1件以上の空でない文字列');
    }
    if (!isValidDate(item.updated)) fail('updated', `が実在する YYYY-MM-DD でない（${item.updated}）`);

    if (item.kind === 'project') {
      if (item.status === 'ended') fail('status', 'project に ended は使えない');
      if (!item.placement || !PLACEMENTS.includes(item.placement)) fail('placement', 'が project に必要（top / list）');
    }
    if (item.kind === 'case' && !item.category) fail('category', 'が case に必要');
  }

  const topCount = items.filter((i) => i.kind === 'project' && i.placement === 'top').length;
  if (topCount !== TOP_COUNT) errors.push(`placement: top は ${TOP_COUNT} 件であること（現在 ${topCount} 件）`);

  if (errors.length > 0) throw new Error(`catalog の検査に失敗:\n${errors.join('\n')}`);
}

export const STATUS_LABELS: Record<Status, string> = {
  active: '進行中',
  planned: '計画中',
  ended: '終了',
};

export interface JsonFeedItem {
  id: string;
  url: string;
  title: string;
  content_text: string;
  summary: string;
  date_modified: string;
  tags: string[];
  _ikilab: {
    about: string;
    kind: Kind;
    status: Status;
    status_label: string;
    has_page: boolean;
    category?: string;
  };
}

export interface JsonFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
  language: string;
  icon: string;
  favicon: string;
  items: JsonFeedItem[];
}

/** 項目の公開 URL。ページがあれば末尾 / 付き、なければ一覧のカードを指すフラグメント付き URL */
export function itemUrl(item: CatalogItem, site: string): string {
  if (item.href) return `${site}${item.href.replace(/\/*$/, '/')}`;
  return item.kind === 'project' ? `${site}/projects/#${item.key}` : `${site}/#${item.key}`;
}

/** JSON Feed 1.1 を組み立てる。項目は updated の新しい順、同日は catalog の順 */
export function buildFeed(items: CatalogItem[], site: string): JsonFeed {
  validateCatalog(items);
  const feedUrl = `${site}/feed.json`;
  const sorted = [...items].sort((a, b) => b.updated.localeCompare(a.updated));

  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'IKILAB — Projects & Cases',
    home_page_url: `${site}/`,
    feed_url: feedUrl,
    description: '壱岐島を拠点とする IKILAB のプロジェクトと事例の一覧',
    language: 'ja',
    icon: `${site}/ikilab_logo_500x500.png`,
    favicon: `${site}/iki_fav.png`,
    items: sorted.map((item) => ({
      id: `${site}/items/${item.kind}/${item.key}`,
      url: itemUrl(item, site),
      title: item.title,
      content_text: item.body,
      summary: item.body,
      date_modified: `${item.updated}T00:00:00+09:00`,
      tags: item.tags,
      _ikilab: {
        about: feedUrl,
        kind: item.kind,
        status: item.status,
        status_label: STATUS_LABELS[item.status],
        has_page: Boolean(item.href),
        ...(item.category ? { category: item.category } : {}),
      },
    })),
  };
}
