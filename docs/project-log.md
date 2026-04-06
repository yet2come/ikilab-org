# IKILAB.ORG プロジェクトログ

## 概要

`docs/crossport-top-mockup-C.html`（CROSSPORT名義のデザインモック）をベースに、**IKILAB.ORG** として新規ウェブサイトを構築。3段階のバリエーション（パターンA/B/C）を作成・比較した結果、**パターンAを採用**し、サイトルート（`/`）で運用中。

## 技術スタック

| 項目 | 選定 |
|---|---|
| Framework | Astro v6（静的サイト生成） |
| スタイリング | CSS（モックのCSSをベースに整理、CSS変数活用） |
| ホスティング | Cloudflare Pages |
| フォント | Google Fonts（Instrument Serif, JetBrains Mono, Zen Kaku Gothic New, Noto Sans JP） |
| サイトマップ | @astrojs/sitemap |
| 3D描画 | Three.js r149（CDN、グローバルTHREE最終版） |

## ディレクトリ構成

```
src/
  layouts/
    Base.astro              # 共通レイアウト（head, fonts, OGP, IntersectionObserver）
  components/
    Header.astro            # 固定ヘッダー
    Footer.astro            # フッター
    SectionBar.astro        # セクション区切りバー
    HeroSection.astro       # ヒーロー（左テキスト + 右3Dデモ iframe）
    WhySection.astro        # Why セクション（3カラム）
    ExperimentsGrid.astro   # プロジェクトカードグリッド
    ProofSection.astro      # 実績統計＋事例リスト
    ConnectSection.astro    # 接続カード（暗背景）
    InfraSection.astro      # 施設情報
  styles/
    global.css              # CSS変数、リセット、全コンポーネントスタイル
  data/
    home.ts                 # トップページデータ（旧 pattern-a.ts からリネーム）
    site.ts                 # サイト共通データ（brand, nav, footer, subpages）
    cases.ts                # Caseマークダウン読み込み
    projects.ts             # Projectマークダウン読み込み
  content/
    cases/
      iki-digital-twin.md   # 壱岐島デジタルツイン
      iki-kodomo-senkyo.md  # いきこども選挙
    projects/
      iki-calendar.md       # 壱岐カレンダー
  pages/
    index.astro             # トップページ
    [...slug].astro         # サブページ（concept, projects, connect, contact, cases）
    404.astro               # 404ページ
    digital-twin.astro      # デジタルツイン専用ページ
    cases/[slug].astro      # Case詳細ページ
    projects/[slug].astro   # Project詳細ページ
    population/             # 人口推計ページ
    pop2/                   # 人口カウンター比較
public/
  digital-twin-app/
    index.html              # 3Dワイヤーフレーム（Three.js 単一HTML）
  *.svg, *.png              # ファビコン、ロゴ
docs/
  crossport-top-mockup-C.html  # 元モック（参照用）
```

## 壱岐島デジタルツイン

### 概要

OSM（OpenStreetMap）と国土地理院の標高APIから壱岐島の地形・道路網・交通拠点を3Dワイヤーフレームで再現するプロジェクト。`public/digital-twin-app/index.html` に単一HTMLファイルとして自己完結。

### データソース

| データ | ソース | 規模 |
|---|---|---|
| 海岸線 | OSM coastline ways, DP簡素化 | 441点 |
| 二次離島 | OSM Overpass API | 10島 |
| 標高 | 国土地理院 標高API | 31x31グリッド |
| 離島標高 | GSI API | 島ごと3x3〜5x5 |
| 幹線道路 | OSM Overpass API | 42セグメント・645点（国道/主要/二次/三次） |
| 交通拠点 | 静的定義 | 6箇所（港4・空港1・コワーキング1） |

### 3段階埋め込み構成

| 場所 | URL | 内容 |
|---|---|---|
| ヒーロー右カラム | `/`（トップページ） | 自動回転・操作無効の軽量表示。ホバーで「3Dデモを見る →」オーバーレイ。クリックで `/digital-twin` へ |
| Case詳細ページ | `/cases/iki-digital-twin` | Interactive Demoセクション。スクロールガード付き（クリックで操作開始、外クリックで解除）。全画面ボタン。レイヤープリセット `?layers=` 対応 |
| 専用ページ | `/digital-twin` | パンくずナビ、全UIパネル表示、キーボードショートカット（1-5レイヤー切替/Rリセット/Fフルスクリーン）、URL共有ボタン |

### Three.js 実装の技術詳細

- **バージョン**: Three.js r149（CDN）— グローバル `THREE` オブジェクトが使える最終版
- **5レイヤー**: 地形（デフォルトOFF）、幹線道路、交通拠点、等高線、海岸線
- **レイヤー間隔**: デフォルト0（スライダーで分離表示可能）
- **パフォーマンス最適化**:
  - 等高線: レベルごとに1つの `THREE.LineSegments` にバッチ描画
  - 道路: 種別ごとに1つの `THREE.LineSegments` にバッチ描画
  - `disposeGroup()` による Geometry/Material/Texture の適切な解放（メモリリーク防止）
  - ワイヤーフレーム描画では `computeVertexNormals()` を省略
- **等高線生成**: `marchGrid()` ヘルパーによるマーチングスクエア法（本島80x80グリッド + 離島グリッドを統一処理）
- **海面**: sin/cos波形アニメーション付きワイヤーフレームプレーン
- **カメラ**: 慣性付きオービット（摩擦0.95）、ダブルクリックで拠点にスムーズズーム
- **クエリパラメータ**: `?embed`（UI非表示）、`?autorotate`（自動回転）、`?layers=road,coastline,...`（レイヤープリセット）
- **キーボード/postMessage**: `1`-`5` レイヤー切替、`R` リセット。親ウィンドウからの postMessage にも対応

### 実装経緯（2026-04-06）

1. ユーザーが作成した3Dワイヤーフレーム HTML を分析
2. IKILAB サイトの Projects/Cases に「壱岐島デジタルツイン」として追加（「いきこども選挙」を Cases に移動し差し替え）
3. Case詳細ページ `iki-digital-twin.md` を新規作成
4. 3段階埋め込み戦略（ヒーロー / Case詳細 / 専用ページ）を設計・実装
5. Three.js 本体の改良:
   - 等高線・道路のバッチ描画（LineSegments）
   - 海面アニメーション、カメラ慣性、ダブルクリックズーム
   - disposeGroup() によるメモリリーク防止
   - marchGrid() ヘルパーで等高線ロジック統一（本島+離島）
   - Three.js r128 → r149 へ更新
6. 各埋め込みコンテキストの改良:
   - ヒーロー: ホバーオーバーレイ
   - Case詳細: スクロールガード、全画面ボタン、レイヤープリセット
   - 専用ページ: パンくず、キーボードショートカット、URL共有
7. デフォルト設定調整: 地形レイヤーOFF、レイヤー間隔0

### 今後の改善候補

| 改善案 | 優先度 | 備考 |
|---|---|---|
| 建物フットプリント追加 | 高 | OSMのbuilding waysを新レイヤーとして追加。デジタルツインとしての説得力向上 |
| 拠点クリック情報パネル | 高 | ツールチップ → サイドパネル化。モバイルでの拠点情報表示改善 |
| 日照シミュレーション | 中 | DirectionalLight時刻回転。ソリッド描画モードとセット |
| データJSON分離 | 低 | 現時点でファイルサイズに問題なし。データ追加で肥大化したら検討 |
| ヒーロー軽量専用ビルド | 低 | 海岸線+等高線のみの軽量HTML。初期化速度改善 |
| ヒーローフォールバック画像 | 低 | JS無効環境向けスクリーンショット背景 |

## デプロイ設定

| 項目 | 値 |
|---|---|
| リポジトリ | `yet2come/ikilab-org` |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |

### wrangler.jsonc

```json
{
  "name": "ikilab-org",
  "compatibility_date": "2026-03-12",
  "pages_build_output_dir": "dist"
}
```

## 本番URL

**https://ikilab.org/**
