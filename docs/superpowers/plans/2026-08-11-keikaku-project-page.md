# 行政計画みえる化（iki-keikaku）プロジェクトページ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** keikaku.ikilab.org を「行政計画みえる化」として ikilab.org に掲載し、トップページ 02「Projects」の先頭に置く。壱岐島デジタルツインはトップから外して `/projects` 一覧には残す。

**Architecture:** 既存の詳細ページコンポーネント 7 本と同じ構造で 8 本目（`IkiKeikakuDetailD.astro`）を新規作成する。スタイルは `src/styles/global.css` の `pdd-*` クラスを共有するため CSS の追加は不要。掲載順はデータ配列の並びがそのままトップ 02 と `/projects` に反映されるため、配列の要素移動だけで実現する。

**Tech Stack:** Astro v6（静的サイト生成）、TypeScript、素の CSS。ビルドは `npm run build`、出力は `dist/`。

## Global Constraints

- **このリポジトリにテストフレームワークは存在しない。** `package.json` の scripts は `dev` / `build` / `preview` / `astro` / `generate-types` のみ。検証は `npm run build` の成否と、生成された `dist/` 配下の HTML に対する grep で行う。テストファイルを新規に導入しないこと。
- サイト内名称は「**行政計画みえる化**」。実サービス名「壱岐市 計画マップ」は外部リンクのラベルと関連リンクでのみ使う。
- slug は `iki-keikaku`、URL は `/projects/iki-keikaku`。
- 介護保険の検証ページへの言及は「**第7〜9期**」で統一する（ページ内見出しは「第7・8期」だが、ハブと README の表記に合わせる）。
- 知見・課題の文言は spec に記載されたものを一字一句そのまま使う。市への批判と読まれない表現に調整済みのため、実装時に言い換えないこと。
- 既存 7 本の詳細コンポーネントには一切手を触れない。
- 壱岐島デジタルツインの詳細ページ、`/digital-twin`、他ページからの参照は変更しない。

**参照 spec:** `docs/superpowers/specs/2026-08-11-keikaku-project-page-design.md`

---

## File Structure

| ファイル | 責務 | 変更 |
|---|---|---|
| `src/components/projects/IkiKeikakuDetailD.astro` | 行政計画みえる化の詳細ページ本体。データ（`d`）と描画をこのファイル 1 枚に閉じる | 新規 |
| `src/pages/projects/[slug].astro` | プロジェクト詳細のルーティングと描画分岐 | 修正 |
| `src/data/home.ts` | トップ 02 と `/projects` の掲載カード。並び順の唯一の情報源 | 修正 |
| `src/pages/[...slug].astro` | `/projects` 一覧のみに出すプロジェクト（`additionalProjects`） | 修正 |

Task 1 で詳細ページを先に作り切る（URL が存在しない状態のカードを作らないため）。Task 2 で掲載枠を入れ替える。

---

### Task 1: 詳細ページのコンポーネントとルート

**Files:**
- Create: `src/components/projects/IkiKeikakuDetailD.astro`
- Modify: `src/pages/projects/[slug].astro`（import 追加、`getStaticPaths` に 1 エントリ追加、描画分岐に 1 条件追加）

**Interfaces:**
- Consumes: `src/styles/global.css` の `pdd-*` / `btn-brutal` / `btn-ghost` / `btn-fill` クラス（既存・変更不要）。`[slug].astro` が `Base` / `Header` / `Footer` を既に描画しているため、本コンポーネントは `<section>` 群のみを返す。
- Produces: ルート `/projects/iki-keikaku`。Task 2 の `home.ts` の `href` がこの URL を指す。

- [ ] **Step 1: 現状を確認する（この時点では存在しないこと）**

Run:
```bash
npm run build 2>&1 | tail -3 && ls dist/projects/
```

Expected: `18 page(s) built` と表示され、`dist/projects/` に `iki-keikaku` が **無い**こと。

- [ ] **Step 2: コンポーネントを新規作成する**

Create `src/components/projects/IkiKeikakuDetailD.astro`:

```astro
---
const d = {
  title: '行政計画みえる化',
  status: 'Operating',
  en: 'Making municipal plans visible.',
  lead: '壱岐市の行政計画どうしの関係を図で整理し、個別の計画を深掘りできるようにする非公式の資料集。国・県・市の階層、計画期間、根拠法、所管課を1枚にまとめ、計画値と実績を突き合わせて「策定して終わり」になりがちな計画を検証する。',
  externalLabel: 'keikaku.ikilab.org を見る',
  externalHref: 'https://keikaku.ikilab.org',

  experiment: {
    what: '壱岐市・長崎県・国が公表している行政計画を読み解き、計画の名称・期間・根拠法・所管課・出典URLを構造化データ（data/plans.yml）に集約。国・県・市の階層と計画期間のタイムラインを1枚に整理する。現在は福祉分野の体系整理（社会福祉法第107条の地域福祉計画を軸に、市の分野別個別計画・上位計画、社会福祉協議会・長崎県の計画まで）と、介護保険事業計画 第7〜9期の検証（前提→計画→実施→成果の4段で、認定者数の推計精度・給付費の計画差・施設整備の実現状況・事業目標の達成率・財政の動きを突き合わせ）を公開している。出典URLの死活は週次で自動確認し、行政サイト側で資料が削除された場合に検知できるようにしている。',
    howDifferent: '行政計画は分野ごとにPDFで個別公開されており、計画どうしの関係や上位計画とのつながりは、読み手が複数のPDFを突き合わせないと見えない。本サービスは関係を構造化データとして持ち、階層とタイムラインの図として提示する。さらに「策定して終わり」になりがちな計画に対し、前の期の見込値と決算・国統計の実績を並べる検証の視点を加えている。文章・図表・データはCC BY 4.0、コードはMITで公開し、他自治体がフォークして自分の市版を作れることを想定している。',
  },

  phases: [
    { key: 'taikei', label: '体系の図解' },
    { key: 'kensho', label: '計画の検証' },
    { key: 'expand', label: '分野の拡充' },
    { key: 'generate', label: 'YAMLからの図表生成' },
  ],
  currentPhaseKey: 'expand',
  currentFocus: [
    '改定期が近い計画から追加（第10期介護保険事業計画、第4次地域福祉計画、第4次障がい者計画、第8期障がい福祉計画、第3次男女共同参画基本計画）',
    '上位計画とのつながりが強い計画の整備（総合計画、過疎地域持続的発展計画、公共施設等総合管理計画）',
    '出典URLの死活チェックと、満了・パブリックコメントが近い計画の検出をGitHub Actionsで定期実行し、Issueとして起票',
  ],

  findings: {
    learnings: [
      '小規模自治体では法定計画を一体で策定することが多い。壱岐市では地域福祉計画が3法、こども計画が5法を兼ねている。計画名だけを手がかりにすると法令との対応関係がつかみにくいため、どの計画がどの法を受けているかを体系図として示す意味が大きい。',
      '認定者数の推計は、第7期と第8期で実績との差が反対向きに出た。第7期は減少を見込んで実績が対計画103〜106%、第8期は増加を見込んで97〜99%。人口推計は実績に近く、差は認定率の想定に集中している。認定率は母数が小さいほどわずかな変動が比率に表れやすく、小規模自治体では見通しの難しい指標であることがうかがえる。',
      '給付費は総額では計画比±5%に収まる一方、サービス別に見ると幅がある（地域密着型通所介護297.8%・訪問リハ259.0%に対し、認知症対応型通所介護は0%）。総額とサービス別では計画の見え方が変わるため、両方を並べて示す必要がある。',
      '目標の達成状況は、施策の性格によって傾向が分かれた。認知症カフェの設置や介護予防教室の開催など市が直接実施する施策は目標を上回り、認知症サポーター養成（目標400人・実績150人）や医療予防連携の連絡票（目標15件・実績1件）など住民や関係機関の参加を前提とする施策は目標との差が大きい。担い手が市の外側に広がるほど、目標値の置き方と達成手段の設計が難しくなることがうかがえる。',
      '計画に位置づけても事業化に至らないサービスがある。認知症対応型通所介護は第7期に定員12名での開始を掲げたが、給付実績は6年間ゼロのままだった。小規模多機能型居宅介護なども同様で、事業者の参入が成り立ちにくい離島の条件が背景にあるとみられる。計画の実現可能性が市の意思だけでは決まらない領域があることを示している。',
      '令和8年度末に4計画が同時に期間満了し、令和8年12月から令和9年2月にかけて5計画がパブリックコメントにかかる。改定作業が一時期に集中するため、前の期の計画を事前に整理しておく価値が大きい。',
    ],
    challenges: [
      '過去の計画書が市サイトから消えている。第7期・第8期の介護保険事業計画の本体は削除済みで、第8期は令和3年3月市議会の議案第16号添付資料、第7期は国立国会図書館WARPの保存版でしか確認できない。計画のPDCAを外部から検証しづらい状態にある。',
      '出典URLは行政サイト側の改廃で切れるため、死活チェックとスナップショットの方針で維持し続ける必要がある。',
      '現在は1ページ＝単一HTMLを手で書いており、扱う計画の本数が増えると手作業では破綻する。',
      '一部は公表資料からの推定にとどまる。短期入所生活介護の増床は給付費実績からの推定であり、市立老人ホームの一般型特定施設への移行は実現の有無を公表資料から確認できていない。',
    ],
    openQuestions: [
      'data/plans.yml から図表を生成する方式へどう移行するか。移行できれば他自治体がフォークして自分の市版を作れる。',
      '令和8年度に集中する改定作業に、どこまで間に合わせるか。',
      '「公式資料ではない」整理を、誤読を防ぎながらどう使ってもらうか。',
      '過去計画のアーカイブ公開を誰が担うか。',
    ],
  },

  next: {
    plans: [
      'data/plans.yml にすべての計画を入れ、todo: を消していく',
      'YAMLから階層体系図・タイムライン・一覧表を生成する tools/build.mjs を実装',
      '各ページを「生成された共通パーツ＋そのページ固有の分析」の構成に移行',
      '共通スタイルを assets/base.css に切り出す',
    ],
    scalability: '計画の名称・期間・根拠法・所管課・出典URLを構造化データとして持つ設計は、行政計画をPDFで公開している他の自治体にもそのまま適用できる。フェーズ2で図表をYAMLから生成できるようになれば、計画1本の追加はYAMLを数行足すだけになり、他自治体がフォークして自分の市版を作れる。コードをMITライセンスにしているのはこの想定による。',
  },

  involvement: [
    {
      who: 'company',
      label: '行政計画のオープンデータ化での連携',
      body: '自治体の計画体系を構造化・公開したい企業や自治体の方へ。',
      examples: ['他自治体への横展開', 'plans.yml スキーマの共同設計', '出典アーカイブの仕組みづくり'],
    },
    {
      who: 'supporter',
      label: '記載内容の確認・誤りの指摘',
      body: '壱岐市の計画に詳しい方、実務で関わっている方へ。',
      examples: ['計画の記載内容の確認', '所管課・根拠法の裏取り', '抜けている計画の指摘'],
    },
    {
      who: 'researcher',
      label: '計画行政・EBPMの分析',
      body: '自治体の計画策定と実績評価に関心のある研究者の方へ。',
      examples: ['推計精度の分析', '計画と実績の乖離要因の研究', '小規模自治体の一体策定の比較'],
    },
    {
      who: 'individual',
      label: '使い方のフィードバック',
      body: '資料を使って、わかりにくい点や見たい分野がある方へ。',
      examples: ['読みにくい箇所の指摘', '次に見たい分野のリクエスト', '誤りの報告'],
    },
  ],

  projectInfo: {
    milestones: [
      { date: '2026.08', body: '初版公開。福祉分野の計画体系マップ、介護保険事業計画 第7〜9期の検証、ライセンス解説を同時公開（調査基準日 2026年8月10日）。' },
    ],
    team: [
      { name: '（Members Only）', role: '企画・開発' },
    ],
    relatedProjects: [
      { label: '壱岐市議会みえる化', href: '/projects/iki-gikai' },
    ],
    links: [
      { label: '壱岐市 計画マップ（実サービス）', href: 'https://keikaku.ikilab.org' },
      { label: '福祉分野の計画体系マップ', href: 'https://keikaku.ikilab.org/plans/fukushi/' },
      { label: '介護保険事業計画 第7〜9期の検証', href: 'https://keikaku.ikilab.org/plans/kaigo-7-9/' },
      { label: 'GitHub リポジトリ（plans.yml・ツール）', href: 'https://github.com/ikilab-org/iki-plans' },
      { label: 'ライセンスと、その選択理由', href: 'https://keikaku.ikilab.org/about/license/' },
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
    <p>壱岐市の行政計画は分野ごとにPDFで個別に公開されており、計画どうしの関係や上位計画とのつながりは、読み手が複数のPDFを突き合わせないと見えません。さらに期間が終わった計画は市サイトから削除されることがあり、策定時の見込みが実際どうなったかを後から検証することも難しい状態にあります。</p>
  </div>
  <div class="pdd-col">
    <h3>なぜ壱岐でやるのか</h3>
    <p>人口約2.3万人の小規模自治体では法定計画を一体で策定することが多く、壱岐市では地域福祉計画が3法、こども計画が5法を兼ねています。単独の計画名で探しても見つからないため体系図の必要性が大きい一方、現行の福祉・保健関連計画は10本程度と、全量を扱える規模でもあります。</p>
  </div>
  <div class="pdd-col">
    <h3>なぜ今やるのか</h3>
    <p>令和8年度末に4計画が同時に期間満了し、令和8年12月から令和9年2月にかけて5計画がパブリックコメントにかかります。改定作業が集中するこの時期に、前の期の計画がどうなったかを整理しておく意味があります。</p>
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
    <p>行政計画みえる化に関わりたい方はお気軽にご連絡ください。</p>
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
    <p>行政計画のオープンデータ化、計画体系の整理、計画と実績の検証に一緒に取り組みたい方はご連絡ください。</p>
    <a href="/contact" class="btn-brutal btn-fill" style="background:var(--red);border-color:var(--red);">お問い合わせ →</a>
  </div>
</section>
```

- [ ] **Step 3: ルートに登録する（import）**

Modify `src/pages/projects/[slug].astro`。11 行目の `IkiGikaiDetailD` の import 直後に 1 行足す:

```astro
import IkiGikaiDetailD from '../../components/projects/IkiGikaiDetailD.astro';
import IkiKeikakuDetailD from '../../components/projects/IkiKeikakuDetailD.astro';
```

- [ ] **Step 4: ルートに登録する（getStaticPaths）**

同ファイルの `getStaticPaths` 内、`iki-gikai` のエントリ（`},` で閉じる箇所）の直後、配列を閉じる `];` の直前に足す:

```astro
    {
      params: { slug: 'iki-keikaku' },
      props: {
        entry: {
          slug: 'iki-keikaku',
          title: '行政計画みえる化',
          description: '壱岐市の行政計画の関係を図にし、計画期間・根拠法・所管課を整理。計画値と実績を突き合わせて検証する非公式の資料集。',
        },
      },
    },
```

- [ ] **Step 5: ルートに登録する（描画分岐）**

同ファイルの描画分岐で、`iki-gikai` の条件の直後に 1 条件足す。変更前:

```astro
  ) : entry.slug === 'iki-gikai' ? (
    <IkiGikaiDetailD />
  ) : (
```

変更後:

```astro
  ) : entry.slug === 'iki-gikai' ? (
    <IkiGikaiDetailD />
  ) : entry.slug === 'iki-keikaku' ? (
    <IkiKeikakuDetailD />
  ) : (
```

- [ ] **Step 6: ビルドしてページが生成されることを確認する**

Run:
```bash
npm run build 2>&1 | tail -3
```

Expected: エラーなしで `19 page(s) built` と表示されること。

- [ ] **Step 7: 生成された HTML の中身を確認する**

Run:
```bash
grep -o '<h1>[^<]*</h1>' dist/projects/iki-keikaku/index.html
grep -c 'pdd-finding-row' dist/projects/iki-keikaku/index.html
grep -o 'href="https://keikaku.ikilab.org[^"]*"' dist/projects/iki-keikaku/index.html | sort -u
grep -o '<title>[^<]*</title>' dist/projects/iki-keikaku/index.html
```

Expected:
- 1 つ目: `<h1>行政計画みえる化</h1>`
- 2 つ目: `14`（learnings 6 + challenges 4 + openQuestions 4）
- 3 つ目: 4 行。`https://keikaku.ikilab.org`、`https://keikaku.ikilab.org/about/license/`、`https://keikaku.ikilab.org/plans/fukushi/`、`https://keikaku.ikilab.org/plans/kaigo-7-9/`
- 4 つ目: `<title>行政計画みえる化 — IKILAB</title>`

- [ ] **Step 8: 既存ページが壊れていないことを確認する**

Run:
```bash
grep -o '<h1>[^<]*</h1>' dist/projects/iki-gikai/index.html dist/projects/iki-digital-twin/index.html
```

Expected:
```
dist/projects/iki-gikai/index.html:<h1>壱岐市議会みえる化</h1>
dist/projects/iki-digital-twin/index.html:<h1>壱岐島デジタルツイン</h1>
```

- [ ] **Step 9: コミット**

```bash
git add src/components/projects/IkiKeikakuDetailD.astro src/pages/projects/[slug].astro
git commit -m "feat: 行政計画みえる化（iki-keikaku）の詳細ページを追加"
```

---

### Task 2: 掲載枠の入れ替え

**Files:**
- Modify: `src/data/home.ts:42-49`（`experiments.items`）
- Modify: `src/pages/[...slug].astro:20-25`（`additionalProjects`）

**Interfaces:**
- Consumes: Task 1 が作った `/projects/iki-keikaku`。
- Produces: なし（表示順の変更のみ）。

- [ ] **Step 1: 変更前の並びを記録する**

Run:
```bash
grep -o 'exp-card exp-card-link" href="[^"]*"' dist/index.html
```

Expected（変更前）:
```
exp-card exp-card-link" href="/projects/iki-gikai"
exp-card exp-card-link" href="/projects/iki-calendar"
exp-card exp-card-link" href="/projects/iki-pop-sim"
exp-card exp-card-link" href="/projects/iki-digital-twin"
exp-card exp-card-link" href="/projects/rito-job-matching"
exp-card exp-card-link" href="/projects/iki-loc"
```

- [ ] **Step 2: `home.ts` の先頭に行政計画みえる化を追加する**

`src/data/home.ts` の `experiments.items` 配列で、`壱岐市議会みえる化` の行の**直前**に次の 1 行を挿入する:

```typescript
      { status: "active", title: "行政計画みえる化", body: "壱岐市の行政計画どうしの関係を図で整理し、計画期間・根拠法・所管課を一覧化。計画値と実績を突き合わせ、「策定して終わり」になりがちな計画を検証する資料集。", href: "/projects/iki-keikaku" },
```

- [ ] **Step 3: `home.ts` から壱岐島デジタルツインを削除する**

同じ配列から次の 1 行をまるごと削除する:

```typescript
      { status: "active", title: "壱岐島デジタルツイン", body: "OSM・国土地理院の実データをもとに島の地形・道路・拠点を3Dで再現。地域の空間情報を可視化し、計画や対話の土台をつくる試み。", href: "/projects/iki-digital-twin" },
```

削除後の `experiments.items` は 6 要素で、順に 行政計画みえる化 / 壱岐市議会みえる化 / 壱岐カレンダー / 人口シミュレーション / 壱岐島ワークデザイン構想 / 壱岐ロケ となる。

- [ ] **Step 4: `additionalProjects` に壱岐島デジタルツインを移す**

`src/pages/[...slug].astro` の `additionalProjects` 配列の**先頭**（`壱岐オープンダイアログ` の行の直前）に、Step 3 で削除した行と同じ内容を挿入する:

```typescript
  { status: "active", title: "壱岐島デジタルツイン", body: "OSM・国土地理院の実データをもとに島の地形・道路・拠点を3Dで再現。地域の空間情報を可視化し、計画や対話の土台をつくる試み。", href: "/projects/iki-digital-twin" },
```

- [ ] **Step 5: ビルドする**

Run:
```bash
npm run build 2>&1 | tail -3
```

Expected: エラーなしで `19 page(s) built`。

- [ ] **Step 6: トップ 02 の並びを確認する**

Run:
```bash
grep -o 'exp-card exp-card-link" href="[^"]*"' dist/index.html
```

Expected:
```
exp-card exp-card-link" href="/projects/iki-keikaku"
exp-card exp-card-link" href="/projects/iki-gikai"
exp-card exp-card-link" href="/projects/iki-calendar"
exp-card exp-card-link" href="/projects/iki-pop-sim"
exp-card exp-card-link" href="/projects/rito-job-matching"
exp-card exp-card-link" href="/projects/iki-loc"
```

`/projects/iki-digital-twin` が含まれないこと、`/projects/iki-keikaku` が 1 行目であることを確認する。

- [ ] **Step 7: `/projects` 一覧の並びを確認する**

Run:
```bash
grep -o 'href="[^"]*" class="case-index-card"' dist/projects/index.html
```

Expected:
```
href="/projects/iki-keikaku" class="case-index-card"
href="/projects/iki-gikai" class="case-index-card"
href="/projects/iki-calendar" class="case-index-card"
href="/projects/iki-pop-sim" class="case-index-card"
href="/projects/iki-digital-twin" class="case-index-card"
href="/projects/iki-now" class="case-index-card"
href="/projects/rito-job-matching" class="case-index-card"
href="/projects/iki-loc" class="case-index-card"
```

行政計画みえる化が先頭にあり、かつ壱岐島デジタルツインが一覧に残っていることを確認する。

- [ ] **Step 8: デジタルツイン関連の導線が無傷であることを確認する**

Run:
```bash
test -f dist/projects/iki-digital-twin/index.html && echo "detail OK"
test -f dist/digital-twin/index.html && echo "3D demo OK"
grep -c 'href="/projects/iki-digital-twin"' dist/projects/iki-loc/index.html
```

Expected: `detail OK`、`3D demo OK`、そして 3 つ目が `1`（壱岐ロケ詳細ページからの参照が残っている）。

- [ ] **Step 9: コミット**

```bash
git add src/data/home.ts "src/pages/[...slug].astro"
git commit -m "feat: トップ02の先頭を行政計画みえる化に、デジタルツインを一覧側へ移動"
```

---

## Self-Review

**1. Spec coverage**

| spec の項目 | 対応タスク |
|---|---|
| 名称・slug・URL | Task 1 Step 2/4 |
| 詳細ページ（ヘッダー/背景/実験/状況/知見/次/関わり方/情報） | Task 1 Step 2 |
| 一覧カードの文言（home.ts） | Task 2 Step 2 |
| `getStaticPaths` の description | Task 1 Step 4 |
| トップ 02 の先頭配置 | Task 2 Step 2/6 |
| `/projects` Active 先頭配置 | Task 2 Step 7 |
| デジタルツインを `additionalProjects` へ | Task 2 Step 4/7 |
| 「第7〜9期」表記の統一 | Global Constraints、Task 1 Step 2（`experiment.what`・links） |
| スコープ外（既存 7 本・3Dデモ・keikaku 側・OGP） | 変更対象ファイルに含めていない。Task 1 Step 8 と Task 2 Step 8 で無傷を確認 |
| 検証 5 項目 | Task 1 Step 6-8、Task 2 Step 5-8 |

漏れなし。

**2. Placeholder scan**

TBD / TODO / 「適切に処理する」の類なし。コードを変更する全ステップに実コードを記載済み。

**3. Type consistency**

- `d` のキー（`experiment.what` / `experiment.howDifferent` / `phases[].key` / `currentPhaseKey` / `currentFocus` / `findings.learnings|challenges|openQuestions` / `next.plans|scalability` / `involvement[].who|label|body|examples` / `projectInfo.milestones|team|relatedProjects|links`）は `IkiGikaiDetailD.astro` の同名キーと一致。
- `currentPhaseKey: 'expand'` は `phases` の `key` に存在する。
- `involvement[].who` の 4 値はすべて `whoLabels` に定義済み。
- `milestones` に `href` を持たせていないため、テンプレートから `{ms.href && ...}`（「動画を見る →」）の分岐を削除してある。これは意図的な差分。
- `home.ts` の `href` と `getStaticPaths` の `slug` はいずれも `iki-keikaku` で一致。
