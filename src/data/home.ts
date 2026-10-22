import { catalog } from './catalog';

export const homeData = {
  hero: {
    tag: "IKI ISLAND — 33.7487°N, 129.6918°E",
    titleHtml: "<span class=\"hero-line\">離島という</span><span class=\"hero-line\">制約環境を、</span><span class=\"hero-line\">可能性に変える。</span>",
    en: "From island constraints to new possibilities.",
    bodyHtml:
      'IKILABは、壱岐島を舞台に、地域課題に対する仮説を<strong>小さく試し、確かめ、現場で回る仕組みへつなげる</strong>実践拠点です。島内外の人と知恵を接続しながら、実験で終わらないプロジェクトを進めています。',
    actions: [
      { label: "進行中のテーマ →", href: "/projects", style: "fill" },
      { label: "相談する", href: "/contact", style: "ghost" },
    ],
    date: "IKI ISLAND, NAGASAKI, JAPAN",
    coord: "IKI LAB EST. 2024  /  33.7451°N, 129.6911°E",
    imagePlaceholder: "HERO IMAGE\n壱岐島の風景写真\nor 施設の記録写真",
  },
  why: {
    num: "01",
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
    num: "02",
    title: "Projects — 進行中のテーマ",
    link: { label: "View All →", href: "/projects" },
    items: catalog
      .filter((item) => item.kind === 'project' && item.placement === 'top')
      .map(({ status, title, body, href }) => ({ status, title, body, href })),
  },
  proof: {
    num: "03",
    title: "Cases — 実証と実装の事例",
    link: { label: "View All →", href: "/cases" },
    stats: [
      { num: "1,200", unit: "+", label: "Annual Visitors" },
      { num: "15", unit: "", label: "Partners" },
      { num: "24", unit: "", label: "Projects" },
      { num: "8", unit: "", label: "Migrations" },
    ],
    cases: catalog
      .filter((item) => item.kind === 'case')
      .map(({ key, category, title, body, href }) => ({ tag: category ?? '', title, body, href, id: key })),
  },
  connect: {
    num: "04",
    title: "Connect — 一緒に取り組む",
    cards: [
      { sym: "A", title: "離島で実証・実装を進めたい", body: "壱岐島をフィールドに、新しい仕組みやサービスの実証・実装を進めたい企業や研究者の方へ。", cta: "For Company" },
      { sym: "B", title: "地域で仕組みを育てたい", body: "自分のスキルや経験を活かし、地域で継続する取り組みを形にしたい個人の方へ。", cta: "For Individual" },
      { sym: "C", title: "壱岐で働き、関わりたい", body: "ワーケーションや短期滞在を通じて、壱岐での実践に関わってみたい方へ。", cta: "For Workation" },
      { sym: "D", title: "拠点を活用して企画を動かしたい", body: "コワーキング、会議、イベントなど、プロジェクトを前に進める場を探している方へ。", cta: "For Visitor" },
    ],
  },
  infra: {
    num: "05",
    title: "BASE - 研究拠点",
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
};
