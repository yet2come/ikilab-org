# IKILAB.ORG プロジェクトログ

## 概要

`docs/crossport-top-mockup-C.html`（CROSSPORT名義のデザインモック）をベースに、**IKILAB.ORG** として新規ウェブサイトを構築。3段階のバリエーション（パターンA/B/C）を作成・比較した結果、**パターンAを採用**し、サイトルート（`/`）で運用中。

## 技術スタック

| 項目 | 選定 |
|---|---|
| Framework | Astro v7（静的サイト生成） |
| スタイリング | CSS（モックのCSSをベースに整理、CSS変数活用） |
| ホスティング | Cloudflare Pages |
| フォント | Google Fonts（Instrument Serif, JetBrains Mono, Zen Kaku Gothic New, Noto Sans JP） |
| サイトマップ | @astrojs/sitemap |

## 3パターンの比較（完了）

比較検討の結果、**パターンAを採用**。パターンB/Cのページ・データファイルは削除済み。

| パターン | 変更内容 | 結果 |
|---|---|---|
| **A: 名称のみ** | CROSSPORT → IKILAB に名称差し替え。デザイン・構成・コンテンツはモックのまま | **採用** → `/` に昇格 |
| **B: 名称＋コンテンツ** | 名称変更に加え、説明文・セクション内容をIKILABの文脈に合わせて書き換え | 削除済み |
| **C: 名称＋コンテンツ＋ナビ構成** | 名称・コンテンツに加え、ナビゲーション・ページ構成もIKILABとして再設計 | 削除済み |

## ディレクトリ構成

```
src/
  layouts/
    Base.astro              # 共通レイアウト（head, fonts, OGP, アニメーション）
  components/
    Header.astro            # 固定ヘッダー（props でナビ項目を切替）
    Footer.astro            # フッター（props でリンク構成を切替）
    SectionBar.astro        # セクション区切りバー
    HeroSection.astro       # ヒーローセクション
    WhySection.astro        # Why セクション（3カラム）
    ExperimentsGrid.astro   # 実験カードグリッド
    ProofSection.astro      # 実績統計＋事例リスト
    ConnectSection.astro    # 接続カード（暗背景）
    InfraSection.astro      # 施設情報
    projects/               # プロジェクト詳細コンポーネント（*DetailD.astro、7本）
  styles/
    global.css              # CSS変数、リセット、全コンポーネントスタイル
  data/
    home.ts                 # トップページのコンテンツデータ（旧 pattern-a.ts）
    projects.ts             # プロジェクト定義
    cases.ts                # 事例定義
    site.ts                 # サイト共通メタ
  content/
    projects/ cases/        # Markdown コンテンツ
  pages/
    index.astro             # トップページ
    [...slug].astro         # 下層ページ（concept, contact 等）
    404.astro               # 404ページ
    projects/[slug].astro   # プロジェクト詳細
    cases/[slug].astro      # 事例詳細
    digital-twin.astro      # 3Dデジタルツイン
    population/ pop2/       # 人口シミュレーション／カウンター比較
docs/
  crossport-top-mockup-C.html  # 元モック（参照用）
  superpowers/                 # 設計spec・実装plan
scripts/
  gen-ogp.mjs                  # OGP画像生成（satori + resvg）
```

## 設計方針

- **コンポーネント駆動**: 全セクションを props ベースのコンポーネントに分離
- **データ分離**: コンテンツは `src/data/`（home.ts / projects.ts / cases.ts / site.ts）に集約。コンポーネントはデータに依存しない
- **動的ルーティング**: `[...slug].astro` でサブページ（concept, contact 等）を自動生成

## デプロイ経緯

### 2026-03-14

1. **Astro プロジェクト初期化**
   - `npm create astro@latest` でプロジェクト作成
   - TypeScript strict モード

2. **共通基盤・コンポーネント・3パターン作成**
   - モックのCSS（867行）を `global.css` に抽出
   - 9個の再利用コンポーネント作成
   - 3パターン分のデータファイルとページ作成
   - トップページ、404ページ、favicon、sitemap

3. **ビルド確認**
   - 28ページ生成（3パターン全含む）、エラーなし。現在はパターンA採用後の構成に整理済み（19ページ）

4. **Cloudflare Pages デプロイ**
   - 初回: `@astrojs/cloudflare` アダプターで KV namespace 衝突エラー
   - 2回目: `sessions: false` 設定追加 → 解消せず
   - 3回目: アダプターを完全削除、`output: 'static'` のみに → ビルド成功
   - 4回目: `wrangler.jsonc` に `pages_build_output_dir` 追加 → wrangler がプロジェクト名を認識
   - 5回目: deploy command に `--project-name=ikilab-org` 追加 → ログ不足で原因不明
   - **最終解決**: Cloudflare ダッシュボードで Workers ではなく Pages プロジェクトとして作成し直し → デプロイ成功

### 2026-06-07 〜 06-08

1. **プロジェクトページ追加: 壱岐市議会みえる化（iki-gikai）**
   - `IkiGikaiDetailD.astro` を新規作成、`/projects/iki-gikai` をルート登録
   - トップの Projects 先頭に配置（オープンダイアログは `/projects` 一覧に残置）
   - 設計spec・実装planを `docs/superpowers/` に記録

2. **OGP画像の整備**（PR #1 / #2）
   - `scripts/gen-ogp.mjs`（satori + @resvg/resvg-js）で 1200x630 を生成
   - 背景は壱岐島ワイヤーフレームの透かし。トップの3Dデジタルツインと同じ海岸線/島嶼/道路データ＋投影を再利用し、島形状を一致させている
   - 出力: `public/ogp.png`（paper）/ `public/ogp-dark.png`（dark）
   - `Base.astro` に og:/twitter: メタ一式を追加（`summary_large_image`）
   - 黒枠を 14px → 3px に調整

### 2026-08-11

**プロジェクト追加: 行政計画みえる化（iki-keikaku）**

- keikaku.ikilab.org（実サービス名「壱岐市 計画マップ」）を掲載。`IkiKeikakuDetailD.astro` を新規作成し `/projects/iki-keikaku` をルート登録
- トップ 02「Projects」の先頭に配置。壱岐島デジタルツインは `additionalProjects` へ移し、トップから外して `/projects` 一覧には残す（壱岐オープンダイアログと同じ扱い）
- 掲載内容は実サイト・`ikilab-org/iki-plans` の README・各マップページから取得した事実のみで構成。知見・課題の文言は、市への批判と読まれないよう評価語を観察の記述に調整
- 設計spec・実装planを `docs/superpowers/` に記録
- 既存 7 本の詳細コンポーネントには手を触れず、8 本目として同じ構造で追加（共通化リファクタは見送り、将来課題）
- ビルドは 18 → 19 ページ

### 2026-10-08

**依存関係の整理（npm audit 21件 → 3件）**

- `@astrojs/cloudflare` を依存から削除。`astro.config.mjs` はアダプタ指定のない `output: 'static'` のみで、コード上どこからも参照されていなかった（2026-03 のデプロイ試行でアダプタを撤去した際、package.json からの削除が漏れていた）
- `wrangler` も削除。`generate-types` スクリプト専用だったが、出力先の `worker-configuration.d.ts` が存在せず実質機能していなかった。Pages のデプロイは git 連携＋`npm run build` なので npm パッケージとしては不要（`wrangler.jsonc` は別物なので残置）
- この2つが wrangler/miniflare/workerd/undici/ws/vite-plugin などを引き連れ、audit の件数を水増ししていた。併せて semver 範囲内の推移的依存を `npm audit fix`（`--force` なし）で更新
- `tsconfig.json` の include から存在しない `./worker-configuration.d.ts` を削除（アダプタ撤去時の残骸）
- 依存ツリー 388 → 257 packages、audit 21件（low 2 / moderate 1 / high 17 / critical 1）→ 3件（low 1 / high 1 / critical 1）
- ビルドは 19 ルートで変化なし

**`npm audit fix --force` は使わない**（dry-run で確認済み）

astro を 7 系へメジャー更新し、wrangler を `^4.73.0` → `^4.15.2` にダウングレードしたうえで 8 high が残り、さらに `@astrojs/cloudflare` を 12 系へ降格しようとする（未使用パッケージの制約で堂々巡りになる）。加えて `node_modules` 内の satori / @resvg/resvg-js（`npm i --no-save` 運用）を削除するため `scripts/gen-ogp.mjs` が壊れる。

**残る3件を見送った理由**

astro / esbuild / sharp の3件で、修正には astro 7 へのメジャー更新が必要。本番は静的HTML配信でランタイムに node/vite/astro サーバーが存在しないため、Reflected XSS・Host header SSRF・base 剥がしの認可バイパスはいずれも経路がない。critical の「AVIF 画像最適化による RCE」(CVSS 9.8) も `astro:assets` / `<Image>` の利用が src 内に 0 件、`public/` に .avif/.webp も 0 件で、sharp/libvips が画像を処理する経路がそもそもない。実リスクは `astro dev` をローカルで起動している間に限られる。

### 2026-10-12

**Astro 7 へのメジャー更新（npm audit 3件 → 0件）**

- `astro` ^6.0.4 → ^7.3.8、`@astrojs/sitemap` ^3.7.1 → ^3.7.4。残っていた astro / esbuild / sharp の3件が解消し audit は 0 件
- v7 の破壊的変更のうち該当したのは `compressHTML` の既定値変更のみ。新既定の `'jsx'` はインライン要素間の空白を削るため（例: pop2 の「A Countdown」→「ACountdown」）、`astro.config.mjs` に `compressHTML: true` を明示して v6 と同じ HTML 方式を維持
- その他（Rust コンパイラの厳格化・`src/fetch.ts` の予約・Markdown の Sätteri 化・`astro:transitions` 内部 API 削除）は影響なし。ビルドは警告・エラーなしで 19 ページのまま
- 検証: v6 / v7 のビルド成果物を比較。全ページで表示テキスト・タグ構造・sitemap・public 資産が一致（差分はスコープ CSS の cid 名のみ）。Vite 8 で CSS ミニファイアが変わり宣言順や色表記が変わるため、ブラウザで 19 ページ × 2 幅（1280 / 390px）の全要素の computed style とレイアウト寸法を突き合わせ、一致を確認（唯一の差は `background: none` 由来の `background-position` 表記で、背景画像がないため見た目に影響なし）
- 注意: `npm install` で `--no-save` 導入の satori / @resvg/resvg-js が消えるため、OGP 再生成時は `scripts/gen-ogp.mjs` 冒頭の手順で再導入する

### 最終的なデプロイ設定

| 項目 | 値 |
|---|---|
| リポジトリ | `yet2come/ikilab-org` |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |

### wrangler.jsonc（最終版）

```json
{
  "name": "ikilab-org",
  "compatibility_date": "2026-03-12",
  "pages_build_output_dir": "dist"
}
```

## 本番URL

**https://ikilab.org/**

## 次のステップ

最終更新: 2026-10-12

- [x] 3パターンの比較・最終選定 → パターンA採用
- [x] 選定パターンをルート `/` に昇格
- [x] 下層ページの実装（concept / projects / connect / contact / cases ＋ プロジェクト詳細7本、計18ページ）
- [x] 実コンテンツの整備（7プロジェクトの詳細ページ・実説明、事例ページ。ヒーロー=3Dデジタルツイン埋め込み、拠点=Google地図に置換）
- [x] プロジェクト拡充（2026-06: 「壱岐市議会みえる化」(iki-gikai) を掲載しトップ先頭に配置。論点マップ等の最新内容も反映）
- [x] プロジェクト拡充（2026-08: 「行政計画みえる化」(iki-keikaku) を掲載しトップ先頭に配置。デジタルツインは /projects 一覧側へ。計19ページ）
- [ ] プロジェクト詳細ページ8本のアクセシビリティ改善（[#3](https://github.com/yet2come/ikilab-org/issues/3)。見出しレベル・装飾記号・セクションナビ。共通化リファクタと合わせて対応するのが効率的）
- [x] OGP 画像の作成（2026-06: `scripts/gen-ogp.mjs` で生成、`Base.astro` に og:/twitter: メタ追加。本番配信済み）
- [ ] ヒーロー／拠点の実写真の差し替え（現状は3D埋め込み・地図。home.ts に未使用の placeholder 定義が残存）
- [x] 依存関係の整理（2026-10: 未使用の @astrojs/cloudflare・wrangler を削除。npm audit 21件 → 3件）
- [ ] レスポンシブの最終調整
- [x] astro 7 へのメジャー更新（2026-10: audit 3件 → 0件。`compressHTML: true` で v6 の空白処理を維持）
