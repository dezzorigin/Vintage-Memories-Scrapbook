// Gate P0 anti-slop + kelengkapan tag OG/Twitter untuk landing
// vintage-memories-scrapbook. Dijalankan CI (npm run validate) — gagal =
// PR tidak merge. Aturan dari ~/workspace/github-actions/ui-anti-slop.md
// §2-3. Kontrak desain: docs/DESIGN.md (poster pos: Merah Pos #C1272D,
// Kuning Perangko #F2A900, Biru Pos #1D4ED8 di Kertas Arsip #FDFCF6;
// Fraunces + Courier Prime; radius 2px; perangko + segel lilin).
// CATATAN: gate ini hanya memindai landing (index.html, styles.css,
// app.js). scrapbook.html adalah produk asli yang dipertahankan — Tailwind
// CDN + efek vintage-nya sendiri bukan bagian dari gate landing.
import { readFileSync, existsSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const css = readFileSync("styles.css", "utf8");
const js = readFileSync("app.js", "utf8");
const failures = [];

function check(cond, msg) {
  if (!cond) failures.push(msg);
}

// ── P0: gradient ──────────────────────────────────────────────────────────
check(!/linear-gradient|radial-gradient|conic-gradient/i.test(css + html),
  "P0: gradient terlarang di hero/background");
check(!/bg-clip-text|background-clip:\s*text/i.test(css + html),
  "P0: teks headline gradient terlarang");
// ── P0: font Inter / Roboto / system font untuk semuanya ──────────────────
check(!/\bInter\b/i.test(css), "P0: font Inter terlarang");
check(!/\bRoboto\b/i.test(css), "P0: font Roboto terlarang");
check(/Fraunces/.test(css) && /Courier Prime/.test(css),
  "font harus Fraunces (display) + Courier Prime (mono)");
// ── P0: emoji mentah sebagai ikon fungsi ──────────────────────────────────
const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
check(!emojiRe.test(html), "P0: emoji mentah sebagai ikon terlarang");
// ── P0: copy generik ──────────────────────────────────────────────────────
for (const phrase of ["Elevate your workflow", "Unlock the power", "Supercharge"]) {
  check(!html.toLowerCase().includes(phrase.toLowerCase()),
    `P0: copy generik terlarang: "${phrase}"`);
}
// ── P0: rounded-2xl shadow-lg di semua permukaan ──────────────────────────
check(!/rounded-2xl/.test(html) && !/border-radius:\s*(1rem|16px)/.test(css),
  "P0: rounded-2xl di semua permukaan terlarang");
// ── P0: statistik vanity tanpa sumber ─────────────────────────────────────
for (const phrase of ["99.9% uptime", "10x faster", "50k+ users", "10x lebih cepat"]) {
  check(!html.includes(phrase), `P0: statistik vanity tanpa sumber: "${phrase}"`);
}

// ── Orde-kedua ────────────────────────────────────────────────────────────
check(!/#39d353|#4af626|lime/i.test(css), "orde-kedua: lime fosfor terlarang");
check(!/terracotta|#e2725b/i.test(css + html), "orde-kedua: terracotta terlarang");
check(!/#F4EBD8|#f4ebd8/i.test(css), "orde-kedua: krim pudar terlarang — palet harus poster pos, bukan beige");
check(!/Space Grotesk|IBM Plex Mono/i.test(css), "tipografi harus beda dari #48 (Space Grotesk/IBM Plex Mono terlarang di sini)");
check(!/#F4F5F1/i.test(css + html), "palet harus beda dari #48 (Meja #F4F5F1 terlarang di sini)");
// label mono all-caps di mana-mana: satu kicker per section, 4 section = 4
const allCapsLabels = (html.match(/class="kicker"/g) || []).length;
check(allCapsLabels <= 4, "orde-kedua: label mono all-caps di mana-mana");
// radius: kontrak 2px tajam
check(/--radius: 2px/.test(css), "radius harus 2px tajam sesuai DESIGN.md");

// ── Tag OG + Twitter wajib lengkap ────────────────────────────────────────
const ogRequired = [
  ["og:title", /<meta property="og:title" content="[^"]+"/],
  ["og:description", /<meta property="og:description" content="[^"]+"/],
  ["og:type", /<meta property="og:type" content="website"/],
  ["og:url", /<meta property="og:url" content="https:\/\/vintage-memories-scrapbook\.pages\.dev\/"/],
  ["og:image", /<meta property="og:image" content="https:\/\/vintage-memories-scrapbook\.pages\.dev\/og-image\.png"/],
  ["twitter:card", /<meta name="twitter:card" content="summary_large_image"/],
  ["twitter:title", /<meta name="twitter:title" content="[^"]+"/],
  ["twitter:description", /<meta name="twitter:description" content="[^"]+"/],
  ["twitter:image", /<meta name="twitter:image" content="https:\/\/vintage-memories-scrapbook\.pages\.dev\/og-image\.png"/],
];
for (const [name, re] of ogRequired) {
  check(re.test(html), `tag ${name} tidak ada / tidak absolut ke vintage-memories-scrapbook.pages.dev`);
}
check(existsSync("og-image.png"), "og-image.png tidak ada di root");
check(existsSync("favicon.svg"), "favicon.svg tidak ada di root");

// ── Kejujuran isi ─────────────────────────────────────────────────────────
check(/5 lembar/.test(html) && /5 foto/.test(html) && /1 lagu/.test(html),
  "angka nyata repo (5 lembar, 5 foto, 1 lagu) harus ada di landing");
check(/perangko|segel lilin/i.test(html), "detail khas perangko + segel lilin harus ada di landing");
check(/github\.com\/dezzorigin\/vintage-memories-scrapbook/.test(html),
  "logo/link GitHub kanan atas ke repo harus ada");

// ── Marker landing + struktur ─────────────────────────────────────────────
check(html.includes("Kado ulang tahun yang dibuka lembar demi lembar."),
  "marker 'Kado ulang tahun yang dibuka lembar demi lembar.' tidak ada");
check(/class="gallery"/.test(html), "galeri isi album tidak ada");
check((html.match(/class="stamp-card"/g) || []).length === 5,
  "galeri harus berisi tepat 5 kartu perangko (satu per foto)");
check(/class="index-list"/.test(html), "indeks fitur tidak ada");
check(/class="steps"/.test(html), "cara pakai 3 langkah tidak ada");
check(/href="scrapbook\.html"/.test(html), "CTA ke scrapbook.html tidak ada");
check(/prefers-reduced-motion/.test(css), "prefers-reduced-motion harus dihormati di CSS");
check(/nav-toggle/.test(js), "logika toggle menu mobile hilang di app.js");

// ── Scrapbook (produk) tetap utuh ─────────────────────────────────────────
const scrap = readFileSync("scrapbook.html", "utf8");
check(/id="start-btn"/.test(scrap), "scrapbook: tombol Buka Kado Cinta hilang");
check(/id="slide-5"/.test(scrap), "scrapbook: harus tetap 5 slide");
check(/audio\/lagu\.mp3/.test(scrap), "scrapbook: lagu latar hilang");
for (let n = 1; n <= 5; n++) {
  check(scrap.includes(`foto/foto${n}.jpg`), `scrapbook: foto/foto${n}.jpg hilang`);
  check(html.includes(`foto/foto${n}.jpg`), `landing: foto/foto${n}.jpg tidak dipakai di galeri`);
}

if (failures.length) {
  console.error(`check-static: ${failures.length} kegagalan:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("check-static: OK (P0 + orde-kedua + OG/Twitter + kejujuran isi + produk utuh)");
