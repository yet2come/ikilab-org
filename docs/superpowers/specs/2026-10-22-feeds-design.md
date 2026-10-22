# sitemap.xml と一覧フィード（/feed.json）設計

作成日: 2026-10-22

## 目的

クロスポート武生水の Instagram で本の紹介文を Claude が下書きする仕組みがあり、紹介する本と関係の深い ikilab の活動があれば紹介文で一言つなげたい。その取り込み元として、ikilab.org のプロジェクトと事例を機械が読める形で出す。

現状は RSS もサイトマップの固定 URL もなく、取り込み側はページを読み込んで差分を取るしかない。ページの作りが変わると取り込みが止まる。これを、URL と形式を固定したフィードに置き換える。

## ゴール / 非ゴール / やってはいけないこと

**ゴール**

- `/feed.json` で、プロジェクトと事例の全件を、名前・概要・URL・状態・種別・タグ・最終更新日つきで出す
- `/sitemap.xml` を 200 で返し、`/robots.txt` から参照する
- 情報の抜け（タグや更新日の書き忘れ）をビルドで止め、壊れたフィードを配信しない
- 検証手順を決めておく

**非ゴール**

- 更新情報の RSS / Atom（書く元になる更新欄がサイトにない。更新欄を作るときに `/feed.xml`（Atom）として足す）
- 詳細ページコンポーネント8本の共通化
- 詳細ページの中身（知見・沿革など）をフィードに載せること

**やってはいけないこと**

- 既存ページの見た目を変える（不可視の `id` 属性の追加のみ許す）
- 一度決めたフィードの URL や、項目の `id` を後から変える

## 現状（2026-10-22 時点の事実）

- Astro 7、`output: 'static'`、`site: 'https://ikilab.org'`。Cloudflare Pages が `main` の push で `npm run build` し `dist/` を配信。リクエスト時に動く処理はない
- `@astrojs/sitemap` 3.7.4 導入済み。`/sitemap-index.xml` と `/sitemap-0.xml`（18 URL）が本番で 200。`<lastmod>` なし。`/sitemap.xml` は 404
- `public/robots.txt` はない。本番の `/robots.txt` は Cloudflare の「管理された robots.txt」が返すコメントのみ（content signals の説明）で、ディレクティブも `Sitemap:` 行もない
- プロジェクト・事例の情報の置き場所が分散している

| 情報 | 置き場所 | 件数 |
|---|---|---|
| トップ 02 のプロジェクト（status / title / body / href） | `src/data/home.ts` の `experiments.items` | 6 |
| /projects にだけ出るプロジェクト | `src/pages/[...slug].astro` の `additionalProjects`（ページ内に直書き） | 5 |
| トップ 03 の事例（tag / title / body / href） | `src/data/home.ts` の `proof.cases` | 3 |
| /cases の事例一覧 | `src/content/cases/*.md`（`src/data/cases.ts` 経由） | 1 |
| 詳細ページの中身 | 各 `src/components/projects/*DetailD.astro` の `d` | 8 |

- /projects の一覧カードは `status` の値（`active` / `planned`）をそのまま表示している。詳細ページは別系統の4段階（`Operating` / `Beta` / `Development` / `Planning`）
- 自分のページを持たない項目が5件ある
  - プロジェクト: 壱岐オープンダイアログ、離島型モビリティ実証、観光DX支援（いずれも /projects にカードのみ）
  - 事例: サクセンカイギ、しまチャレ2024 協賛（トップ 03 にのみ表示。/cases には出ていない）
- タグ・キーワード、最終更新日はどこにもない

## 決定事項

| 項目 | 決定 |
|---|---|
| 一覧フィード | `/feed.json`、JSON Feed 1.1 |
| サイトマップ | `/sitemap.xml` を 200 で返す（下記） |
| robots.txt | `public/robots.txt` を新設し `Sitemap: https://ikilab.org/sitemap.xml` を書く |
| 更新情報の RSS / Atom | 作らない（非ゴール参照） |
| 生成タイミング | ビルド時（Astro の静的エンドポイント） |
| 項目データの置き場所 | 新設の `src/data/catalog.ts` に一本化。トップ 02・03 と /projects はここから読む |
| タグと最終更新日 | `catalog.ts` に手で書く。抜けていればビルドを失敗させる |
| ページのない項目の URL | 表示している一覧の該当カードに不可視の `id` を付け、フラグメント付き URL にする |

### フィードの URL を固定する約束

- `/feed.json` と `/sitemap.xml` は今後変えない
- 各項目の `id`（下記）は今後変えない。項目にページができて `url` が変わっても `id` は据え置く

## 項目データ: `src/data/catalog.ts`

プロジェクトと事例を1つの配列（またはプロジェクト・事例の2配列）で持つ。各項目のフィールド:

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `key` | string | ○ | 項目の恒久キー（英小文字とハイフン）。ページがある項目は slug と同じ。フィードの `id` とカードの `id` 属性に使う |
| `kind` | `'project' \| 'case'` | ○ | 種別 |
| `title` | string | ○ | 一覧に表示している名前（現行の文字列そのまま） |
| `body` | string | ○ | 一覧に表示している説明文（現行の文字列そのまま）。フィードの概要に使う |
| `href` | string | 任意 | 自分のページへのパス（現行の値そのまま）。ないものはページなし |
| `status` | `'active' \| 'planned' \| 'ended'` | ○ | 状態 |
| `tags` | string[] | ○ | 1件以上。日本語のキーワード |
| `updated` | string（`YYYY-MM-DD`） | ○ | 内容の最終更新日（JST）。見た目やマークアップだけの変更では動かさない |
| `placement` | `'top' \| 'list'` | プロジェクトのみ ○ | `top` はトップ 02 と /projects、`list` は /projects のみ |
| `category` | string | 事例のみ ○ | トップ 03 の分類表示（現行の `tag` の値、例 `Education / Community`） |

- 配列の順序が表示順。現在のトップ 02 の6件、`additionalProjects` の5件、トップ 03 の3件の順序をそのまま保つ
- `home.ts` の `experiments.items` と `proof.cases`、`[...slug].astro` の `additionalProjects` は、`catalog.ts` から導出する形に置き換える。描画結果の HTML は変えない（カードの `id` 属性追加のみ）
- トップ 02 は代表6件固定（既存方針）。`placement: 'top'` が6件であることもビルド時に確かめる
- /cases の事例一覧は Markdown（`src/content/cases/`）のまま変えない。フィードの事例は `catalog.ts` を正とする

### ページのない項目の `key` と URL

| 項目 | `key` | URL |
|---|---|---|
| 壱岐オープンダイアログ | `iki-open-dialogue` | `https://ikilab.org/projects/#iki-open-dialogue` |
| 離島型モビリティ実証 | `rito-mobility` | `https://ikilab.org/projects/#rito-mobility` |
| 観光DX支援 | `kanko-dx` | `https://ikilab.org/projects/#kanko-dx` |
| サクセンカイギ | `sakusen-kaigi` | `https://ikilab.org/#sakusen-kaigi` |
| しまチャレ2024 協賛 | `shima-challenge-2024` | `https://ikilab.org/#shima-challenge-2024` |

`id` 属性は /projects の全カード（11件）とトップ 03 の全事例行（3件）に `key` の値で付ける。ページがある項目のカードにも付けるのは、付け方を統一するためで、URL にはページ側を使う。

### 状態と更新日の初期値

- プロジェクトの `status` は現行の `active` / `planned` をそのまま移す
- **プロジェクトの `ended` は今回は許さない**（設計者の判断）。トップ 02 の `ExperimentsGrid.astro` のラベル表に `ended` がなく、/projects は `active` 以外を Pipeline 節に入れて「構想中」と出すため、終了したプロジェクトを正しく表示できない。ビルド時の検査で `kind: 'project'` かつ `ended` を不可にする。プロジェクトを終了扱いにする必要が出たら、表示側の扱いと合わせて別途設計する。事例は `ended` を使ってよい（トップ 03 と /cases は状態を表示しない）
- 事例の `status` と、全項目の `tags` は実装者が下書きし、PR でユーザーが確認する。下書きの方針: 事例は過去の実施なら `ended`、現在も運営中なら `active`
- **`updated` は「その項目の内容の最終更新日」とする**（設計者の判断）。内容とは、一覧の `title` / `body` と、詳細ページの中身の両方を指す。フィードには一覧の文言しか載らないが、取り込み側は「その活動に動きがあったか」を知りたいので、詳細の更新も反映する
- `updated` の初期値は git 履歴から取り、次の新しい方とする
  - その項目の一覧文言（`home.ts` の該当行、`additionalProjects` の該当行）を最後に変えたコミットの日付
  - ページがある項目は、その詳細コンポーネント（`src/components/projects/*DetailD.astro`。事例は `src/content/cases/*.md`）を最後に変えたコミットの日付。`iki-calendar` は `src/content/projects/iki-calendar.md` もある（`projects.ts` 経由で `getStaticPaths` に入る）が、表示に使われているのはコンポーネント側なので、コンポーネント側で見る
- マークアップだけの変更は内容の更新に数えない。具体的には、2026-10-22 のアクセシビリティ修正（PR #6、本設計の時点で未マージ）がこれにあたる
- 以後は、一覧文言か詳細の中身を変えたコミットで、同じ項目の `updated` も手で更新する

## `/feed.json`（JSON Feed 1.1）

`src/pages/feed.json.ts` の静的エンドポイントで生成する。

**フィード全体**

| フィールド | 値 |
|---|---|
| `version` | `https://jsonfeed.org/version/1.1` |
| `title` | `IKILAB — Projects & Cases` |
| `home_page_url` | `https://ikilab.org/` |
| `feed_url` | `https://ikilab.org/feed.json` |
| `description` | 壱岐島を拠点とする IKILAB のプロジェクトと事例の一覧 |
| `language` | `ja` |
| `icon` / `favicon` | 既存の `public/` のロゴ・ファビコンの絶対 URL |
| `items` | 下記。`date_modified` の新しい順、同日は `catalog.ts` の順 |

**項目**

| フィールド | 値 |
|---|---|
| `id` | `https://ikilab.org/items/<kind>/<key>`（URL 形式の恒久 ID。このパスにページは作らない） |
| `url` | ページがあれば `https://ikilab.org` + `href` に末尾 `/` を揃えたもの、なければ上表のフラグメント付き URL |
| `title` | `title` |
| `content_text` | `body` |
| `summary` | `body` |
| `date_modified` | `updated` を `YYYY-MM-DDT00:00:00+09:00` にしたもの |
| `tags` | `tags` |
| `_ikilab` | 下記 |

```json
"_ikilab": {
  "about": "https://ikilab.org/feed.json",
  "kind": "project",
  "status": "active",
  "status_label": "進行中",
  "has_page": true
}
```

- `status_label` は `active` → 進行中、`planned` → 計画中、`ended` → 終了
- 事例には `"category": "Education / Community"` を足す
- `about` は JSON Feed の拡張の作法（拡張オブジェクトに説明先 URL を入れる）に従う

`id` をページの URL と分けたのは、ページのない項目にあとからページができて `url` が変わっても `id` を変えずに済ませるため。

## `/sitemap.xml`

- `@astrojs/sitemap` はそのまま使う（新しいページを自動で拾うため）
- `serialize` で、`catalog.ts` にある項目の詳細ページに `<lastmod>`（`updated`）を付ける。それ以外のページには付けない
- `src/pages/sitemap.xml.ts` の静的エンドポイントで、`https://ikilab.org/sitemap-0.xml` を指す sitemap index を返す。リダイレクトにしないのは、robots.txt から参照されるサイトマップが確実に 200 を返すようにするため
- `/sitemap-index.xml` は統合が出すまま残す（既存 URL を壊さない）
- 統合はビルドされた全ルートを URL にするため、新設の `/feed.json` と `/sitemap.xml` が `sitemap-0.xml` に載りうる。統合の `filter` でこの2つを除外する
- 統合が `sitemap-1.xml` 以降に分割した場合（4.5万 URL 超）に `/sitemap.xml` が古くなるため、ビルド後の検証で `sitemap-index.xml` と `/sitemap.xml` の参照先が一致することを確かめる

## `/robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://ikilab.org/sitemap.xml
```

本番は Cloudflare の「管理された robots.txt」が有効で、ファイルを置いたときに Cloudflare の内容と合わさるのか置き換わるのかは未確認。デプロイ後に実物を見て、`Sitemap:` 行が出ていることと、content signals のコメントが意図どおりかを確かめる。

## ビルド時の検査

`catalog.ts` を読む処理（フィード生成時）で次を確かめ、違反があれば例外を投げてビルドを失敗させる。

- `key` が重複していない、形式（英小文字・数字・ハイフン）が正しい
- 必須フィールドがすべてあり、`tags` が1件以上、`updated` が実在する日付
- `status` / `kind` / `placement` が決めた値のどれか。`kind: 'project'` で `status: 'ended'` は不可
- `placement: 'top'` がちょうど6件
- `href` がある項目は、そのページが存在する（プロジェクトは `/projects/<slug>`、事例は `/cases/<slug>`）。`projects/[slug].astro` の `getStaticPaths` は「`src/content/projects/*.md` 由来の項目」と「ページ内に直書きの7件」を合わせたものなので、検査はこの両方を見るか、ビルド後の `dist/` で確かめる

## 検証手順

**ローカル（実装時と、以後 `catalog.ts` を変えたとき）**

1. `npm run build` が通る
2. `dist/feed.json` を `node -e` で `JSON.parse` でき、項目数が 14、全項目に `id` / `url` / `title` / `content_text` / `date_modified` / `tags` / `_ikilab.kind` / `_ikilab.status` がある
3. `xmllint --noout dist/sitemap.xml dist/sitemap-0.xml` が通る。`dist/sitemap.xml` の参照先と `dist/sitemap-index.xml` の参照先が一致する。`sitemap-0.xml` に `/feed.json` と `/sitemap.xml` が載っていない
4. `dist/robots.txt` に `Sitemap: https://ikilab.org/sitemap.xml` がある
5. 見た目が変わっていないこと: 変更前後の `dist/` の HTML を比べ、差分がカードの `id` 属性の追加だけである。「変更前」は、作業ブランチの分岐元と同じ `main` のコミットでビルドする。PR #6（アクセシビリティ修正）が先にマージされた場合は、それを含む `main` から分岐し、同じコミットを基準にする（PR #6 の差分を比較に混ぜないため）

2〜4 は `scripts/check-feeds.mjs` にまとめ、`npm run check:feeds` で実行できるようにする（依存パッケージは増やさない。`xmllint` は macOS 標準）。

**デプロイ後**

1. https://validator.jsonfeed.org/ に `https://ikilab.org/feed.json` を入れてエラーがない
2. `curl -sI https://ikilab.org/feed.json` が 200、`Content-Type` が JSON 系
3. `curl -sI https://ikilab.org/sitemap.xml` が 200
4. `curl -s https://ikilab.org/robots.txt` に `Sitemap:` 行がある（Cloudflare の管理 robots.txt との合わさり方もここで確認）
5. 任意: Google Search Console に `https://ikilab.org/sitemap.xml` を登録し、エラーがない

## 実装者に任せること

- `catalog.ts` の型の書き方、配列を1本にするか2本にするか
- `tags` の下書き（1項目3〜6語程度）と事例の `status` の下書き（PR でユーザー確認）
- `scripts/check-feeds.mjs` の書き方
- `Content-Type` の指定方法（Cloudflare Pages の拡張子判定で JSON 系にならない場合は `public/_headers` で指定）
