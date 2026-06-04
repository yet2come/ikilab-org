# 壱岐市議会みえる化（iki-gikai）プロジェクト掲載 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 本番稼働中の議事録サービス iki-gikai を、ikilab.org に既存6プロジェクトと同じ見た目の詳細ページ `/projects/iki-gikai` として掲載し、トップの代表 Projects 枠にも載せる（オープンダイアログと入替）。

**Architecture:** 既存の「DetailD コンポーネント方式」を踏襲。`IkiCalendarDetailD.astro` を雛形に新コンポーネントを作り、`projects/[slug].astro` に登録。トップ＆一覧は `home.ts` の `experiments.items` を差し替え、外したオープンダイアログは `[...slug].astro` の `additionalProjects[]` に移して一覧に残す。

**Tech Stack:** Astro v6（静的サイト生成）、既存 `global.css` の `pdd-*` スタイル共用。テスト基盤は無いため、検証は `npm run build` 成功＋生成 HTML の文字列 grep。

参照 spec: `docs/superpowers/specs/2026-06-04-iki-gikai-project-page-design.md`

---

## File Structure

| ファイル | 操作 | 責務 |
|---|---|---|
| `src/components/projects/IkiGikaiDetailD.astro` | Create | iki-gikai 詳細ページ本体（7セクション、`d` オブジェクト＋既存マークアップ） |
| `src/pages/projects/[slug].astro` | Modify | `iki-gikai` ルート登録（import / getStaticPaths / 三項分岐） |
| `src/data/home.ts` | Modify | `experiments.items` の6件目をオープンダイアログ→iki-gikai に差替 |
| `src/pages/[...slug].astro` | Modify | `additionalProjects[]` にオープンダイアログを追加（一覧に残す） |

---

## Task 1: 詳細コンポーネント `IkiGikaiDetailD.astro` を作成

**Files:**
- Create: `src/components/projects/IkiGikaiDetailD.astro`

雛形は `src/components/projects/IkiCalendarDetailD.astro`。構造（`sections`・`whoLabels`・`pdd-*` マークアップ）は同一で、`d` オブジェクトと「01 BACKGROUND」「mid CTA」「final CTA」の固定文を iki-gikai 用に差し替える。

- [ ] **Step 1: ファイルを作成（全文）**

`src/components/projects/IkiGikaiDetailD.astro` に以下を**そのまま**書き込む:

```astro
---
const d = {
  title: '壱岐市議会みえる化',
  status: 'Operating',
  en: 'Making the local council visible.',
  lead: '壱岐市議会の本会議録をAIで構造化し、市民が検索・閲覧・俯瞰できるようにする非公式サービス。全文検索・AI要約・議論テーマ抽出・可視化を提供する。',
  externalLabel: 'gikai.ikilab.org を見る',
  externalHref: 'https://gikai.ikilab.org',

  experiment: {
    what: '公開されている本会議録PDFを取り込み、発言単位に構造化。キーワード×意味のハイブリッド検索、AIによる会議概要・議員別Q&A・論点の要約、複数AIモデル統合による議論テーマ抽出までを一貫して提供する。2023〜2026年1月の79会議・約6,000発言・57テーマを実データで運用中。',
    howDifferent: '壱岐市議会には独自の会議録検索システムがなく、公式にはPDF閲覧のみ。本サービスは横断検索・議員ごとの追跡・テーマの年表化を可能にする。さらに4つのAIモデルを統合（ensemble）することで、単一モデルの網羅率35%前後を、テーマ網羅率70%まで引き上げている。',
  },

  phases: [
    { key: 'ingest', label: '取り込み・構造化' },
    { key: 'search', label: '検索・AI要約' },
    { key: 'themes', label: 'テーマ抽出・可視化' },
    { key: 'speedy', label: '速報版議事録' },
  ],
  currentPhaseKey: 'speedy',
  currentFocus: [
    '公式音声mp3からAI文字起こしで速報版議事録を生成（whisper-1採用、CER 11.5%）',
    '速報版を検索結果・議員ページへ統合表示する設計',
    'PDF公開検知後に速報版を取り下げ、正本へ自動誘導する仕組み',
  ],

  findings: {
    learnings: [
      '4つのAIモデルを統合することで、単一モデルでは取りこぼす論点まで拾え、テーマ網羅率が35%前後から70%へ向上した。',
      '一般質問は本文中の議長の進行フレーズ（登壇促し・終了宣言）から、議員ごとのセッションに自動分割できた。',
      'trigram全文検索とベクトル検索をRRFで統合し、「キーワード一致」と「意味的な論点抽出」を1クエリで両立できた。',
    ],
    challenges: [
      '本会議録PDFの公開は会議終了から1〜3か月後で、最新の議論を追うにはタイムラグがある。',
      '委員会記録は非公開のため、対象は本会議に限られる。',
      '情報収集・要約はAI APIのレート制限とコストの制約を受ける。',
    ],
    openQuestions: [
      '速報版（音声由来の派生物）と正本PDFの関係をどう設計し、誤読を防ぐか。',
      '市民有志による運営をどう持続させ、費用を負担するか。',
      '議会の関心テーマと市民の関心の乖離を、どう可視化して対話につなげるか。',
    ],
  },

  next: {
    plans: [
      '速報版議事録を既存UI（検索結果カード・議員ページ）へ統合表示',
      'PDF公開時に速報版を取り下げ、正本ページへ自動誘導',
      '文字起こし精度をPDF公開後に再計算し、月次推移を可視化',
      'アンケート機能と公開デモグラフィクスで、市民の関心テーマを集計・公開',
    ],
    scalability: 'PDF取り込み→構造化→検索→テーマ抽出のパイプラインは、議事録をPDF公開している他の地方議会にも汎用的に展開できる。技術より、誰が運営を担い継続するかという体制設計が再現の鍵となる。壱岐での実装知見を、地方議会の透明化テンプレートとして共有できる状態を目指している。',
  },

  involvement: [
    {
      who: 'company',
      label: '議事録オープンデータ化での連携',
      body: '自治体・議会の会議録を構造化・公開したい企業や自治体の方へ。',
      examples: ['他自治体への横展開', 'データ連携・API設計', 'AI要約・検索基盤の共同開発'],
    },
    {
      who: 'supporter',
      label: 'データ補正・妥当性チェック',
      body: '壱岐に関わる方で、議事録データの校正やテーマ抽出の妥当性確認にご協力いただける方。',
      examples: ['PDF文字化けの補正', 'テーマ分類のレビュー', '議員情報の確認'],
    },
    {
      who: 'researcher',
      label: '政治・行政テキストの分析',
      body: '地方議会の言説分析や、市民参加・行政の透明性に関心のある研究者の方へ。',
      examples: ['議論テーマの経年分析', '議会と市民の関心の乖離研究', 'マルチモデル抽出の評価'],
    },
    {
      who: 'individual',
      label: 'フィードバック・改善提案',
      body: 'サービスを使って、改善点や見たい機能のアイデアがある方へ。',
      examples: ['使い勝手のフィードバック', '欲しい機能の提案', '気づいた誤りの報告'],
    },
  ],

  projectInfo: {
    milestones: [
      { date: '2026.05', body: 'プレビュー版（v0.1.1）を公開。議事録PDFの取り込み・全文検索・AI要約・議員プロフィールを実装。' },
      { date: '2026.05', body: 'プライバシー方針・運営者情報を整備（v0.1.3）。' },
      { date: '2026.05', body: '複数AIモデル統合による議論テーマ抽出とヒートマップUIを公開（v0.2.0）。' },
      { date: '2026.05', body: '収録範囲を2023〜2026年の4年分（79会議・約6,000発言）に拡張（v0.2.1）。' },
      { date: '2026.05', body: '一般質問の詳細ダイアログURL共有に対応（v0.2.2）。' },
    ],
    team: [
      { name: '（Members Only）', role: '企画・開発' },
    ],
    relatedProjects: [
      { label: 'いきこども選挙', href: '/cases/iki-kodomo-senkyo' },
    ],
    links: [
      { label: '壱岐市議会みえる化（実サービス）', href: 'https://gikai.ikilab.org' },
      { label: '開発ロードマップ', href: 'https://gikai.ikilab.org/roadmap' },
      { label: 'このサービスについて', href: 'https://gikai.ikilab.org/about.html' },
    ],
  },
};

const sections = [
  { id: 'background', label: '背景' },
  { id: 'experiment', label: '実験内容' },
  { id: 'findings', label: '知見' },
  { id: 'involvement', label: '関わり方' },
  { id: 'info', label: 'プロジェクト情報' },
];

const whoLabels: Record<string, string> = {
  company: '企業',
  individual: '個人',
  researcher: '研究者',
  supporter: 'サポーター',
};
---
<section class="pdd-hero">
  <div class="pdd-hero-inner">
    <span class="pdd-badge">{d.status}</span>
    <h1>{d.title}</h1>
    <div class="pdd-en">{d.en}</div>
    <p>{d.lead}</p>
    <div class="pdd-hero-actions">
      <a href="/projects" class="btn-brutal btn-ghost">一覧に戻る</a>
      {d.externalHref && <a href={d.externalHref} target="_blank" rel="noreferrer" class="btn-brutal btn-fill">{d.externalLabel}</a>}
    </div>
  </div>
</section>

<nav class="pdd-nav">
  {sections.map(s => <a href={`#${s.id}`} class="pdd-nav-link">{s.label}</a>)}
</nav>

<div class="pdd-bar"><span>01</span> BACKGROUND</div>
<section id="background" class="pdd-section">
  <div class="pdd-col">
    <h3>どんな問題か</h3>
    <p>壱岐市議会には独自の会議録検索システムがなく、本会議録はPDFとして公開されるだけです。関心のある議題がどの会議で議論されたかを自力で当たる必要があり、横断的な検索や議員ごとの追跡が難しい状態にありました。</p>
  </div>
  <div class="pdd-col">
    <h3>なぜ壱岐でやるのか</h3>
    <p>規模の小さい議会だからこそ、「全会議録の全量構造化」という範囲設定が現実的に成り立ちます。市民と議会の距離が近い離島の規模を活かし、議論の全体像を見渡せる情報基盤をつくれます。</p>
  </div>
  <div class="pdd-col">
    <h3>なぜ今やるのか</h3>
    <p>埋め込みや要約といったAIが実用段階に入り、市民有志でも議事録を構造化し検索可能な形に整えられるようになりました。公式サービスを待たずに、まず動くものをつくれる時期です。</p>
  </div>
</section>

<div class="pdd-bar"><span>02</span> EXPERIMENT</div>
<section id="experiment" class="pdd-section">
  <div class="pdd-col">
    <h3>何をどう試しているか</h3>
    <p>{d.experiment.what}</p>
  </div>
  <div class="pdd-col">
    <h3>従来と何が違うか</h3>
    <p>{d.experiment.howDifferent}</p>
  </div>
</section>

<div class="pdd-bar pdd-bar--alt"><span>03</span> STATUS</div>
<section class="pdd-section pdd-section--alt">
  <div class="pdd-stepper">
    {d.phases.map((phase, i) => (
      <div class={`pdd-step ${phase.key === d.currentPhaseKey ? 'pdd-step--active' : ''}`}>
        <div class="pdd-step-indicator">
          <div class="pdd-step-dot"></div>
          {i < d.phases.length - 1 && <div class="pdd-step-line"></div>}
        </div>
        <div class="pdd-step-label">{phase.label}</div>
      </div>
    ))}
  </div>
  <h3>現在の取り組み</h3>
  <ul class="pdd-focus-list">
    {d.currentFocus.map(item => <li>{item}</li>)}
  </ul>
</section>

<div class="pdd-bar"><span>04</span> FINDINGS</div>
<section id="findings" class="pdd-section">
  <div class="pdd-findings-group">
    <h3>見えてきたこと</h3>
    {d.findings.learnings.map(item => (
      <div class="pdd-finding-row pdd-finding--learning"><span>○</span><p>{item}</p></div>
    ))}
  </div>
  <div class="pdd-findings-group">
    <h3>課題として残っていること</h3>
    {d.findings.challenges.map(item => (
      <div class="pdd-finding-row pdd-finding--challenge"><span>△</span><p>{item}</p></div>
    ))}
  </div>
  <div class="pdd-findings-group">
    <h3>まだ答えの出ていない問い</h3>
    {d.findings.openQuestions.map(item => (
      <div class="pdd-finding-row pdd-finding--question"><span>?</span><p>{item}</p></div>
    ))}
  </div>
</section>

<div class="pdd-bar pdd-bar--alt"><span>05</span> NEXT</div>
<section class="pdd-section pdd-section--alt">
  <h3>次にやること</h3>
  <ul class="pdd-focus-list">
    {d.next.plans.map(item => <li>{item}</li>)}
  </ul>
  <h3>再現性の見立て</h3>
  <p class="pdd-scalability">{d.next.scalability}</p>
</section>

<div class="pdd-bar"><span>06</span> INVOLVEMENT</div>
<section id="involvement" class="pdd-section">
  <div class="pdd-involve-grid">
    {d.involvement.map(inv => (
      <div class="pdd-involve-card">
        <div class="pdd-involve-who">{whoLabels[inv.who] || inv.who}</div>
        <h3>{inv.label}</h3>
        <p>{inv.body}</p>
        {inv.examples && inv.examples.length > 0 && (
          <ul class="pdd-involve-examples">
            {inv.examples.map(ex => <li>{ex}</li>)}
          </ul>
        )}
      </div>
    ))}
  </div>
  <div class="pdd-mid-cta">
    <p>壱岐市議会みえる化に関わりたい方はお気軽にご連絡ください。</p>
    <a href="/contact" class="btn-brutal btn-fill">お問い合わせ →</a>
  </div>
</section>

<div class="pdd-bar pdd-bar--alt"><span>07</span> PROJECT INFO</div>
<section id="info" class="pdd-section pdd-section--alt">
  <h3>タイムライン</h3>
  <div class="pdd-milestones">
    {d.projectInfo.milestones.map(ms => (
      <div class="pdd-milestone">
        <span class="pdd-milestone-date">{ms.date}</span>
        <div>
          <p>{ms.body}</p>
          {ms.href && <a href={ms.href} target="_blank" rel="noreferrer" class="pdd-milestone-link">動画を見る →</a>}
        </div>
      </div>
    ))}
  </div>

  <div class="pdd-info-grid">
    <div>
      <h4>体制</h4>
      {d.projectInfo.team.map(member => (
        <div class="pdd-team-row">
          <span class="pdd-team-role">{member.role}</span>
          <span>{member.name}</span>
        </div>
      ))}
    </div>
    <div>
      <h4>関連プロジェクト</h4>
      {d.projectInfo.relatedProjects.map(rp => (
        <a href={rp.href} class="pdd-info-link">{rp.label} →</a>
      ))}
    </div>
    <div>
      <h4>関連リンク</h4>
      {d.projectInfo.links.map(link => (
        <a href={link.href} target="_blank" rel="noreferrer" class="pdd-info-link">{link.label} →</a>
      ))}
    </div>
  </div>
</section>

<section class="pdd-final-cta">
  <div class="pdd-final-cta-inner">
    <div class="pdd-cta-kicker">Connect</div>
    <h2>このプロジェクトに関心がある方へ</h2>
    <p>地方議会のオープンデータ化、議事録の構造化・検索、市民参加の仕組みづくりに一緒に取り組みたい方はご連絡ください。</p>
    <a href="/contact" class="btn-brutal btn-fill" style="background:var(--red);border-color:var(--red);">お問い合わせ →</a>
  </div>
</section>
```

- [ ] **Step 2: コミット**

```bash
git add src/components/projects/IkiGikaiDetailD.astro
git commit -m "Add IkiGikaiDetailD component (壱岐市議会みえる化 detail page)"
```

注: この時点ではまだルート未登録なのでページは生成されない（次タスクで登録）。コンポーネント単体はビルド対象外。

---

## Task 2: `projects/[slug].astro` に iki-gikai ルートを登録

**Files:**
- Modify: `src/pages/projects/[slug].astro`（import 群 / `getStaticPaths()` / 三項分岐）

- [ ] **Step 1: import を追加**

`src/pages/projects/[slug].astro` の import 群、`import RitoJobMatchingDetailD ...` の行の直後に追記:

```astro
import RitoJobMatchingDetailD from '../../components/projects/RitoJobMatchingDetailD.astro';
import IkiGikaiDetailD from '../../components/projects/IkiGikaiDetailD.astro';
```

- [ ] **Step 2: getStaticPaths にエントリを追加**

`getStaticPaths()` の `return [ ... ]` 内、`iki-loc` のオブジェクト（`params: { slug: 'iki-loc' }, ...` のブロック）の閉じ `},` の直後に追記:

```astro
    {
      params: { slug: 'iki-gikai' },
      props: {
        entry: {
          slug: 'iki-gikai',
          title: '壱岐市議会みえる化',
          description: '壱岐市議会の本会議録をAIで構造化し、全文検索・AI要約・議論テーマ抽出で市民が俯瞰できるようにする非公式サービス。',
        },
      },
    },
```

- [ ] **Step 3: レンダリングの三項分岐に追加**

`{entry.slug === 'iki-calendar' ? (...) : ...}` の連鎖のうち、`rito-job-matching` の分岐の直後に `iki-gikai` を追加する。具体的には:

変更前:
```astro
  ) : entry.slug === 'rito-job-matching' ? (
    <RitoJobMatchingDetailD />
  ) : (
```

変更後:
```astro
  ) : entry.slug === 'rito-job-matching' ? (
    <RitoJobMatchingDetailD />
  ) : entry.slug === 'iki-gikai' ? (
    <IkiGikaiDetailD />
  ) : (
```

- [ ] **Step 4: ビルドして詳細ページ生成を確認**

Run:
```bash
npm run build && test -f dist/projects/iki-gikai/index.html && grep -q "壱岐市議会みえる化" dist/projects/iki-gikai/index.html && grep -q "Making the local council visible." dist/projects/iki-gikai/index.html && echo "DETAIL_OK"
```
Expected: ビルド成功 + 末尾に `DETAIL_OK`

- [ ] **Step 5: コミット**

```bash
git add src/pages/projects/[slug].astro
git commit -m "Register /projects/iki-gikai route"
```

---

## Task 3: トップ＆一覧カードを差し替え（`home.ts`）

**Files:**
- Modify: `src/data/home.ts`（`experiments.items` の6件目）

- [ ] **Step 1: オープンダイアログのカードを iki-gikai に差し替え**

`src/data/home.ts` の `experiments.items` 内、以下の行（壱岐オープンダイアログ）を:

```ts
      { status: "active", title: "壱岐オープンダイアログ", body: "事実に基づきながら、それぞれの主観に耳を傾ける「開かれた対話会」。対話の平等性、多様性の尊重、未来志向を大切にしています。" },
```

次の1行に置き換える:

```ts
      { status: "active", title: "壱岐市議会みえる化", body: "壱岐市議会の本会議録をAIで構造化し、全文検索・AI要約・議論テーマ抽出で「議会で何が議論されているか」を市民が俯瞰できるようにする情報基盤。", href: "/projects/iki-gikai" },
```

- [ ] **Step 2: ビルドして、トップに iki-gikai／オープンダイアログ消滅を確認**

Run:
```bash
npm run build && grep -q "壱岐市議会みえる化" dist/index.html && ! grep -q "壱岐オープンダイアログ" dist/index.html && echo "TOP_OK"
```
Expected: ビルド成功 + `TOP_OK`（トップに iki-gikai があり、オープンダイアログが無い）

- [ ] **Step 3: コミット**

```bash
git add src/data/home.ts
git commit -m "Swap top Projects slot: オープンダイアログ → 壱岐市議会みえる化"
```

---

## Task 4: オープンダイアログを一覧に残す（`[...slug].astro`）

**Files:**
- Modify: `src/pages/[...slug].astro`（`additionalProjects[]`）

Task 3 で `home.ts` からオープンダイアログを外したため、このままだと `/projects` 一覧からも消える（一覧は `home.ts` の items を流用しているため）。`additionalProjects[]` に追加して一覧に残す。

- [ ] **Step 1: `additionalProjects` 配列にオープンダイアログを追加**

`src/pages/[...slug].astro` の `additionalProjects` 配列の先頭要素（`壱岐なう` の行）の直前に1行追加する。

変更前:
```ts
const additionalProjects = [
  { status: "active", title: "壱岐なう", body: "船舶・航空の運航状況、気象、潮汐など、離島生活に不可欠なリアルタイム情報を一画面に集約するダッシュボード。壱岐カレンダーの姉妹プロジェクト。", href: "/projects/iki-now" },
```

変更後:
```ts
const additionalProjects = [
  { status: "active", title: "壱岐オープンダイアログ", body: "事実に基づきながら、それぞれの主観に耳を傾ける「開かれた対話会」。対話の平等性、多様性の尊重、未来志向を大切にしています。" },
  { status: "active", title: "壱岐なう", body: "船舶・航空の運航状況、気象、潮汐など、離島生活に不可欠なリアルタイム情報を一画面に集約するダッシュボード。壱岐カレンダーの姉妹プロジェクト。", href: "/projects/iki-now" },
```

- [ ] **Step 2: ビルドして、一覧に両方出ることを確認**

Run:
```bash
npm run build && grep -q "壱岐市議会みえる化" dist/projects/index.html && grep -q "壱岐オープンダイアログ" dist/projects/index.html && echo "LIST_OK"
```
Expected: ビルド成功 + `LIST_OK`（一覧に iki-gikai とオープンダイアログの両方がある）

- [ ] **Step 3: コミット**

```bash
git add "src/pages/[...slug].astro"
git commit -m "Keep 壱岐オープンダイアログ on /projects list"
```

---

## Task 5: 最終検証

**Files:** なし（検証のみ）

- [ ] **Step 1: クリーンビルド + 全検証を一括実行**

Run:
```bash
npm run build \
  && test -f dist/projects/iki-gikai/index.html \
  && grep -q "壱岐市議会みえる化" dist/projects/iki-gikai/index.html \
  && grep -q "速報版議事録" dist/projects/iki-gikai/index.html \
  && ! grep -qi "サブスク\|会員\|月額\|¥500" dist/projects/iki-gikai/index.html \
  && grep -q "壱岐市議会みえる化" dist/index.html \
  && ! grep -q "壱岐オープンダイアログ" dist/index.html \
  && grep -q "壱岐市議会みえる化" dist/projects/index.html \
  && grep -q "壱岐オープンダイアログ" dist/projects/index.html \
  && echo "ALL_OK"
```
Expected: ビルド成功 + `ALL_OK`
- 検証内容: 詳細ページ生成 / 速報版は残置 / **サブスク文言が無い** / トップに iki-gikai・オープンダイアログ無し / 一覧に両方あり

- [ ] **Step 2: 目視確認（任意・推奨）**

```bash
npm run dev
```
ブラウザで確認:
- `http://localhost:4321/projects/iki-gikai` … 既存詳細ページと同じレイアウト、7セクション、外部リンクが新規タブで開く
- `http://localhost:4321/` … Projects 枠に「壱岐市議会みえる化」、オープンダイアログが無い
- `http://localhost:4321/projects` … Active に iki-gikai、オープンダイアログが「詳細準備中」カードで残る

（ポート番号は `npm run dev` の出力に従う）

- [ ] **Step 3: 完了**

全タスクのコミットが揃っていることを確認:
```bash
git log --oneline feat/iki-gikai-project-page -6
```

---

## Self-Review（プラン作成者によるチェック結果）

- **Spec coverage:** 4ファイル変更すべてに対応タスクあり（Task1=新規コンポーネント / Task2=ルート登録 / Task3=home.ts差替 / Task4=一覧残置）。spec の7セクションコピーは Task1 の全文に反映。サブスク削除・速報版残置は本文・検証(Task5 Step1の grep)でカバー。
- **Placeholder scan:** TBD/TODO 無し。`（Members Only）` は既存コンポーネント踏襲の意図的表記。
- **Type/命名整合:** `d` の各キー（experiment.what/howDifferent, phases.key/label, currentPhaseKey, findings.{learnings,challenges,openQuestions}, next.{plans,scalability}, involvement[].{who,label,body,examples}, projectInfo.{milestones,team,relatedProjects,links}）はマークアップ側の参照と一致。`whoLabels` のキー（company/individual/researcher/supporter）は involvement の who と一致。slug `iki-gikai` は getStaticPaths・三項分岐・home.ts href・検証 grep で一貫。
- **検証手段:** テスト基盤が無いため `npm run build` ＋生成 HTML の grep を採用（ブラウザ不要で自動判定可能）。
