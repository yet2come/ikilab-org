export const patternA = {
  brand: "IKILAB",
  brandFull: "IKILAB",
  brandDesc: "An island lab for experimentation,\nvalidation, and implementation.",
  copyright: "© 2025 IKILAB. All rights reserved.",
  navItems: [
    { label: "Concept", href: "/concept" },
    { label: "Projects", href: "/projects" },
    { label: "Connect", href: "/connect" },
  ],
  contactHref: "/contact",
  hero: {
    tag: "IKI ISLAND — 33.7487°N, 129.6918°E",
    titleHtml: "離島という制約環境から、<br><span style=\"white-space: nowrap;\">実験・実証・実装を進める。</span>",
    en: "From island constraints to real implementation.",
    bodyHtml:
      'IKILABは、壱岐島を舞台に、地域課題に対する仮説を<strong>小さく試し、確かめ、現場で回る仕組みへつなげる</strong>実践拠点です。島内外の人と知恵を接続しながら、実験で終わらないプロジェクトを進めています。',
    actions: [
      { label: "進行中のテーマを見る →", href: "/projects", style: "fill" },
      { label: "相談する", href: "/contact", style: "ghost" },
    ],
    date: "EST. 2022",
    coord: "NAGASAKI, JAPAN",
    imagePlaceholder: "HERO IMAGE\n壱岐島の風景写真\nor 施設の記録写真",
  },
  why: {
    num: "02",
    title: "Why Iki Island — なぜ壱岐島なのか",
    link: { label: "Read Full →", href: "/concept" },
    items: [
      {
        idx: "1",
        titleHtml: "制約が多いからこそ、<br>課題の構造が見える",
        body: "人口規模、地理条件、移動、担い手不足。離島では複数の課題が凝縮されるからこそ、表面的ではない構造が見えやすくなります。",
      },
      {
        idx: "2",
        titleHtml: "小さく試し、<br>早く確かめられる",
        body: "関係者同士の距離が近く、仮説から試行、改善までのサイクルを短く回せます。実験の速度が、そのまま学習速度になります。",
      },
      {
        idx: "3",
        titleHtml: "実装後の手触りまで<br>追うことができる",
        body: "試した施策が実際に使われるのか、続くのか、誰に負荷がかかるのか。実装後の現実まで見届けられるのが、壱岐というフィールドの強みです。",
      },
    ],
  },
  experiments: {
    num: "03",
    title: "Projects — 進行中のテーマ",
    link: { label: "View All →", href: "/projects" },
    items: [
      { status: "active", title: "壱岐カレンダー", body: "島内イベント情報の分散を解消し、地域内外の人が必要な情報にたどり着ける状態をつくるための情報基盤づくり。", href: "/projects/iki-calendar" },
      { status: "active", title: "離島型モビリティ実証", body: "電動トゥクトゥクやレンタカーを通じて、島内移動の選択肢を増やし、観光と暮らしの両面で回遊性を高める実証。" },
      { status: "completed", title: "いきこども選挙", body: "こどもが候補者に質問し、聞き、選び、届けるプロセスを通じて、主権者教育を地域の実践として形にした取り組み。", href: "/cases/iki-kodomo-senkyo" },
      { status: "planned", title: "離島型ジョブマッチング", body: "島内事業者の課題と島外人材のスキルを接続し、単発支援ではなく継続的な関わりを生む仕組みづくり。" },
      { status: "planned", title: "観光DX支援", body: "観光体験の見直しと情報導線の再設計を通じて、持続可能な観光の運用モデルをつくる取り組み。" },
      { status: "active", title: "壱岐オープンダイアログ", body: "多様な立場の人が、事実と主観を持ち寄って対話できる場をつくり、地域で合意形成や相互理解を進める実践。" },
    ],
  },
  proof: {
    num: "04",
    title: "Cases — 実証と実装の事例",
    link: { label: "View All →", href: "/cases" },
    stats: [
      { num: "1,200", unit: "+", label: "Annual Visitors" },
      { num: "15", unit: "", label: "Partners" },
      { num: "24", unit: "", label: "Projects" },
      { num: "8", unit: "", label: "Migrations" },
    ],
    cases: [
      { tag: "Education / Community", title: "壱岐こども選挙", body: "条例に明記された子どものまちづくり参加の権利を、壱岐市長選と接続した模擬選挙として具体化。教育と地域参加をつなぐ実践を、半年近い準備期間をかけて実装しました。", href: "/cases/iki-kodomo-senkyo" },
      { tag: "Dialogue / Community", title: "サクセンカイギ", body: "新しいアイデアを持ち寄り、対話を通じて磨き、島での実践につなげる場として運営。構想段階のアイデアを前に進める土壌を育てています。" },
      { tag: "Education / Community", title: "しまチャレ2024 協賛", body: "長崎県主催の島しょ地域ビジネスチャレンジにIKILAB特別賞を提供。次の担い手が地域で挑戦しやすい環境づくりを後押ししました。" },
    ],
  },
  connect: {
    num: "05",
    title: "Connect — 一緒に取り組む",
    cards: [
      { sym: "A", title: "離島で実証・実装を進めたい", body: "壱岐島をフィールドに、新しい仕組みやサービスの実証・実装を進めたい企業や研究者の方へ。", cta: "For Company" },
      { sym: "B", title: "地域で仕組みを育てたい", body: "自分のスキルや経験を活かし、地域で継続する取り組みを形にしたい個人の方へ。", cta: "For Individual" },
      { sym: "C", title: "壱岐で働き、関わりたい", body: "ワーケーションや短期滞在を通じて、壱岐での実践に関わってみたい方へ。", cta: "For Workation" },
      { sym: "D", title: "拠点を活用して企画を動かしたい", body: "コワーキング、会議、イベントなど、プロジェクトを前に進める場を探している方へ。", cta: "For Visitor" },
    ],
  },
  infra: {
    num: "06",
    title: "CROSSPORT MSZ — 実装を支える拠点",
    link: { label: "Contact →", href: "/contact" },
    name: "IKILAB",
    nameEn: "IKILAB",
    photoPlaceholder: "施設外観写真\nFACILITY EXTERIOR",
    table: [
      { label: "Address", value: '〒811-5135\n長崎県壱岐市郷ノ浦町郷ノ浦 122-8\n<a href="https://crossport.cc" target="_blank" rel="noopener">クロスポート武生水</a>' },
      { label: "Hours", value: "毎日 9:00〜18:00（年中無休）" },
      { label: "Access", value: "郷ノ浦港から徒歩約13分\n博多港から高速船で約1時間" },
      { label: "Tel", value: "050-5211-5434" },
      { label: "Mail", value: "info@ikilab.org" },
    ],
    detailHref: "/contact",
  },
  footerColumns: [
    {
      title: "Thinking",
      links: [
        { label: "Concept", href: "/concept" },
        { label: "Projects", href: "/projects" },
        { label: "Cases", href: "/cases" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "企業の方", href: "/connect" },
        { label: "個人の方", href: "/connect" },
        { label: "ワーケーション", href: "/connect" },
        { label: "施設利用", href: "/connect" },
      ],
    },
  ],
  subpages: [
    { slug: "concept", title: "Concept", titleJa: "コンセプト", description: "なぜ壱岐島で、実験・実証・実装を進めるのか。IKILABの考え方を紹介します。" },
    { slug: "projects", title: "Projects", titleJa: "進行中のテーマ", description: "IKILABが現在取り組んでいるプロジェクトと、その背景にある課題意識を紹介します。" },
    { slug: "connect", title: "Connect", titleJa: "一緒に取り組む", description: "企業、個人、地域内外のプレイヤーがIKILABとどう関われるかを案内します。" },
    { slug: "contact", title: "Contact", titleJa: "お問い合わせ", description: "相談、視察、連携、施設利用など、IKILABへの問い合わせはこちらから。" },
    { slug: "cases", title: "Cases", titleJa: "事例", description: "実験から実証、実装につながったIKILABの取り組み事例を紹介します。" },
  ],
};
