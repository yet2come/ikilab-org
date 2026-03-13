# IKILAB.ORG プロジェクトログ

## 概要

`docs/crossport-top-mockup-C.html`（CROSSPORT名義のデザインモック）をベースに、**IKILAB.ORG** として新規ウェブサイトを構築。3段階のバリエーション（パターンA/B/C）を作成し、比較検討できるようにした。

## 技術スタック

| 項目 | 選定 |
|---|---|
| Framework | Astro v6（静的サイト生成） |
| スタイリング | CSS（モックのCSSをベースに整理、CSS変数活用） |
| ホスティング | Cloudflare Pages |
| フォント | Google Fonts（Instrument Serif, JetBrains Mono, Zen Kaku Gothic New, Noto Sans JP） |
| サイトマップ | @astrojs/sitemap |

## 3パターンの定義

| パターン | 変更内容 | パス |
|---|---|---|
| **A: 名称のみ** | CROSSPORT → IKILAB に名称差し替え。デザイン・構成・コンテンツはモックのまま | `/pattern-a/` |
| **B: 名称＋コンテンツ** | 名称変更に加え、説明文・セクション内容をIKILABの文脈に合わせて書き換え | `/pattern-b/` |
| **C: 名称＋コンテンツ＋ナビ構成** | 名称・コンテンツに加え、ナビゲーション・ページ構成もIKILABとして再設計 | `/pattern-c/` |

### パターン別ナビ構成

- **A / B**: Concept / Experiments / Connect / Facility / Column / EN / Contact
- **C**: About / Lab / Projects / Space / Journal / Contact

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
  styles/
    global.css              # CSS変数、リセット、全コンポーネントスタイル
  data/
    pattern-a.ts            # パターンAのコンテンツデータ
    pattern-b.ts            # パターンBのコンテンツデータ
    pattern-c.ts            # パターンCのコンテンツデータ
  pages/
    index.astro             # パターン選択ハブ
    404.astro               # 404ページ
    pattern-a/
      index.astro           # パターンA トップ
      [...slug].astro       # パターンA 下層ページ
    pattern-b/
      index.astro           # パターンB トップ
      [...slug].astro       # パターンB 下層ページ
    pattern-c/
      index.astro           # パターンC トップ
      [...slug].astro       # パターンC 下層ページ
docs/
  crossport-top-mockup-C.html  # 元モック（参照用）
```

## 設計方針

- **コンポーネント駆動**: 全セクションを props ベースのコンポーネントに分離し、3パターンで再利用
- **データ分離**: 各パターンのコンテンツは `src/data/` の TypeScript ファイルに集約。コンポーネントはデータに依存しない
- **動的ルーティング**: `[...slug].astro` で各パターンの下層ページを自動生成

## デプロイ経緯

### 2026-03-14

1. **Astro プロジェクト初期化**
   - `npm create astro@latest` でプロジェクト作成
   - TypeScript strict モード

2. **共通基盤・コンポーネント・3パターン作成**
   - モックのCSS（867行）を `global.css` に抽出
   - 9個の再利用コンポーネント作成
   - 3パターン分のデータファイルとページ作成
   - ハブページ、404ページ、favicon、sitemap

3. **ビルド確認**
   - 28ページ生成、エラーなし

4. **Cloudflare Pages デプロイ**
   - 初回: `@astrojs/cloudflare` アダプターで KV namespace 衝突エラー
   - 2回目: `sessions: false` 設定追加 → 解消せず
   - 3回目: アダプターを完全削除、`output: 'static'` のみに → ビルド成功
   - 4回目: `wrangler.jsonc` に `pages_build_output_dir` 追加 → wrangler がプロジェクト名を認識
   - 5回目: deploy command に `--project-name=ikilab-org` 追加 → ログ不足で原因不明
   - **最終解決**: Cloudflare ダッシュボードで Workers ではなく Pages プロジェクトとして作成し直し → デプロイ成功

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

- [ ] 3パターンの比較・最終選定
- [ ] 選定パターンをルート `/` に昇格
- [ ] 実写真・実コンテンツの差し替え
- [ ] 下層ページの実装
- [ ] OGP 画像の作成
- [ ] レスポンシブの最終調整
