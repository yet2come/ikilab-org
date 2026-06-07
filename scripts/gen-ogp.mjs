// OGP画像生成 (1200x630) — satori + @resvg/resvg-js
//
// 背景に「壱岐島ワイヤーフレーム」を透かしで配置。トップページの 3D デジタルツイン
// (public/digital-twin-app/index.html) が使うのと同じ海岸線/島嶼/道路データ＋投影 geo() を
// 読み出して2D化しているため、トップの島形状とぴったり一致する。
//
// 再生成:
//   npm i --no-save satori @resvg/resvg-js
//   node scripts/gen-ogp.mjs   # public/ogp.png(paper) と public/ogp-dark.png(dark)
//
// フォントは初回に GitHub から TTF を取得し scripts/.ogp-cache/ にキャッシュ(gitignore済)。
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const CACHE = join(__dir, ".ogp-cache");
mkdirSync(CACHE, { recursive: true });

// ---------- フォント ----------
const FONTS = [
  { file: "JetBrainsMono-Bold.ttf",    url: "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Bold.ttf" },
  { file: "JetBrainsMono-Regular.ttf", url: "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf" },
  { file: "ZenKakuGothicNew-Bold.ttf", url: "https://github.com/google/fonts/raw/main/ofl/zenkakugothicnew/ZenKakuGothicNew-Bold.ttf" },
];
async function ensureFont(f) {
  const p = join(CACHE, f.file);
  if (!existsSync(p)) {
    const r = await fetch(f.url, { redirect: "follow" });
    if (!r.ok) throw new Error(`font fetch ${f.file}: ${r.status}`);
    writeFileSync(p, Buffer.from(await r.arrayBuffer()));
  }
  return readFileSync(p);
}
console.log("フォント準備...");
const [jbBold, jbReg, zenBold] = await Promise.all(FONTS.map(ensureFont));
const fonts = [
  { name: "JetBrains Mono", data: jbBold, weight: 700, style: "normal" },
  { name: "JetBrains Mono", data: jbReg, weight: 400, style: "normal" },
  { name: "Zen Kaku Gothic New", data: zenBold, weight: 700, style: "normal" },
];

// ---------- 壱岐島ワイヤーフレーム透かし ----------
const twin = readFileSync(join(ROOT, "public/digital-twin-app/index.html"), "utf8");
const COAST_RAW = twin.match(/const COAST_RAW = "([^"]+)"/)[1];
const ISLANDS_BLOCK = twin.match(/const ISLANDS_RAW = (\[[\s\S]*?\]);/)[1];
const ROAD_RAW = twin.match(/const ROAD_RAW = "([^"]+)"/)[1];
const islandStrs = [...ISLANDS_BLOCK.matchAll(/coords:'([^']+)'/g)].map((m) => m[1]);

const CL = 33.79, CN = 129.71, SC = 600; // digital-twin-app と同じ投影パラメータ
const geo = (lat, lng) => [(lng - CN) * Math.cos((CL * Math.PI) / 180) * SC, -(lat - CL) * SC];
const poly = (raw) => raw.split(";").map((s) => { const [a, b] = s.split(","); return geo(+a, +b); });
const coast = poly(COAST_RAW);
const islands = islandStrs.map(poly);
const roads = ROAD_RAW.split("|").map((seg) => poly(seg.substring(2))); // 先頭 "X:" を除去

const land = [coast, ...islands].flat();
const minX = Math.min(...land.map((p) => p[0])), maxX = Math.max(...land.map((p) => p[0]));
const minY = Math.min(...land.map((p) => p[1])), maxY = Math.max(...land.map((p) => p[1]));
const TARGET_H = 560, CX = 900, CY = 315; // 右寄り中央に大きく、テキストは左
const s = TARGET_H / (maxY - minY);
const ox = CX - ((minX + maxX) / 2) * s, oy = CY - ((minY + maxY) / 2) * s;
const mp = ([x, y]) => `${(x * s + ox).toFixed(1)} ${(y * s + oy).toFixed(1)}`;
const toPath = (pts, close) => pts.map((p, i) => (i ? "L" : "M") + mp(p)).join(" ") + (close ? " Z" : "");

function watermarkDataUri({ stroke, coastOp, roadOp }) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><g fill="none" stroke="${stroke}" stroke-linejoin="round" stroke-linecap="round">` +
    roads.map((r) => `<path d="${toPath(r, false)}" stroke-width="1" stroke-opacity="${roadOp}"/>`).join("") +
    `<path d="${toPath(coast, true)}" stroke-width="2" stroke-opacity="${coastOp}"/>` +
    islands.map((i) => `<path d="${toPath(i, true)}" stroke-width="1.4" stroke-opacity="${coastOp}"/>`).join("") +
    `</g></svg>`;
  return `data:image/png;base64,${Buffer.from(new Resvg(svg).render().asPng()).toString("base64")}`;
}

// ---------- レイアウト ----------
const LOGO_SRC = `data:image/png;base64,${readFileSync(join(ROOT, "public", "ikilab_logo_1500x500.png")).toString("base64")}`;
const div = (style, children) => ({ type: "div", props: { style: { display: "flex", ...style }, children } });

function tree({ bg, fg, sub, accent, border, wm }) {
  return div(
    { width: "100%", height: "100%", boxSizing: "border-box", flexDirection: "column",
      justifyContent: "space-between", backgroundColor: bg,
      backgroundImage: `url(${wm})`, backgroundSize: "1200px 630px", backgroundRepeat: "no-repeat",
      padding: "72px 80px", border },
    [
      div({ alignItems: "flex-start" }, [
        { type: "img", props: { src: LOGO_SRC, style: { width: 222, height: 74 } } },
      ]),
      div({ flexDirection: "column" }, [
        div({ fontFamily: "Zen Kaku Gothic New", fontWeight: 700, fontSize: 84, lineHeight: 1.28, color: fg }, "離島という制約環境を、"),
        div({ fontFamily: "Zen Kaku Gothic New", fontWeight: 700, fontSize: 84, lineHeight: 1.28, color: fg }, "可能性に変える。"),
        div({ marginTop: 26, fontFamily: "JetBrains Mono", fontWeight: 400, fontSize: 27, color: sub }, "From island constraints to new possibilities."),
      ]),
      div({ flexDirection: "column" }, [
        div({ width: 92, height: 8, backgroundColor: accent, marginBottom: 18 }, []),
        div({ fontFamily: "JetBrains Mono", fontWeight: 400, fontSize: 22, letterSpacing: 1, color: sub },
          "IKI ISLAND, NAGASAKI  /  33.7451°N 129.6911°E"),
      ]),
    ]
  );
}

const VARIANTS = {
  "ogp.png":      { bg: "#f2f0ec", fg: "#111111", sub: "#555555", accent: "#d42b1e", border: "14px solid #111111",
                    wm: { stroke: "#111111", coastOp: 0.20, roadOp: 0.10 } },
  "ogp-dark.png": { bg: "#111111", fg: "#fafafa", sub: "#bbbbbb", accent: "#d42b1e", border: "none",
                    wm: { stroke: "#fafafa", coastOp: 0.27, roadOp: 0.13 } },
};

for (const [outName, v] of Object.entries(VARIANTS)) {
  const wm = watermarkDataUri(v.wm);
  const svg = await satori(tree({ ...v, wm }), { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { background: v.bg }).render().asPng();
  writeFileSync(join(ROOT, "public", outName), png);
  console.log(`生成: public/${outName} (${png.length} bytes)`);
}
console.log("完了");
