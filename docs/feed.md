# ikilab.org のフィード

ikilab.org のプロジェクトと事例の一覧を、機械が読める形で配信しています。

| URL | 中身 |
|---|---|
| `https://ikilab.org/feed.json` | プロジェクトと事例の一覧（[JSON Feed 1.1](https://www.jsonfeed.org/version/1.1/)） |
| `https://ikilab.org/sitemap.xml` | サイトマップ（`sitemap-0.xml` を指す index） |

どちらの URL も今後変えません。各項目の `id` も変えません。

## 項目（items）

| フィールド | 中身 |
|---|---|
| `id` | 恒久 ID。`https://ikilab.org/items/<kind>/<key>` の形で、ページの URL が変わっても変わらない |
| `url` | 項目のページ。自分のページがない項目は、一覧のカードを指す `#<key>` 付きの URL（プロジェクトは `/projects/#<key>`、事例は `/#<key>`） |
| `title` | 名前 |
| `content_text` / `summary` | 2〜3行の概要（同じ文） |
| `date_modified` | 内容の最終更新日（日本時間の 0 時。`2026-04-09T00:00:00+09:00` の形） |
| `tags` | キーワード（1件以上） |

項目は `date_modified` の新しい順に並びます。同じ日付の項目は、サイトでの並び順です。

## 拡張欄（`_ikilab`）

JSON Feed の仕様にない情報は、各項目の `_ikilab` に入っています。

| フィールド | 中身 |
|---|---|
| `about` | この文書の URL |
| `kind` | `project`（プロジェクト）か `case`（事例） |
| `status` | `active`（進行中）・`planned`（計画中）・`ended`（終了）のどれか。プロジェクトには `ended` を使わない |
| `status_label` | `status` の日本語表記（進行中・計画中・終了） |
| `has_page` | 自分のページがあれば `true`。`false` のとき `url` は一覧のカードを指す |
| `category` | 事例の分類（例: `Education / Community`）。事例にだけある |

## 最終更新日の決め方

一覧の文言か詳細ページの中身が変わったときに更新します。見た目やマークアップだけの変更では動きません。
