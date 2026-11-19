// Gate audit-fix + kelengkapan tag OG/Twitter untuk vintage-memories-
// scrapbook — ROOT ADALAH PRODUKNYA (PR #2, mode audit-fix 19 Nov 2026).
// Dijalankan CI (npm run validate) — gagal = PR tidak merge.
//
// SEJARAH: PR #1 membangun landing SaaS di index.html + produk asli di
// scrapbook.html. PR #2 membongkar landing itu: index.html SEKARANG adalah
// scrapbook interaktif 5 lembar itu sendiri (isi scrapbook.html lama,
// dipindah ke root + perbaikan audit), dan scrapbook.html / styles.css /
// app.js DIHAPUS. Gate ini menjaga kontrak baru itu.
//
// CATATAN SKOP: yang digate adalah file produk asli repo — Tailwind CDN +
// Google Fonts + efek vintage-nya sendiri (tekstur kertas radial-gradient,
// vignette, stiker emoji, washi tape). Aturan P0 anti-slop (larangan
// gradient, larangan emoji sebagai ikon fungsi, dsb) DULU hanya berlaku
// untuk landing; di produk, gradient tekstur kertas + emoji stiker/perangko
// adalah isi asli repo sejak commit awal, BUKAN slop baru — jadi gate ini
// TIDAK melarangnya. Yang dijaga: produk tetap utuh, tanpa sisa landing
// SaaS, tanpa kelas Tailwind mati (temuan audit PR #2), OG lengkap.
import { readFileSync, existsSync, statSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const failures = [];

function check(cond, msg) {
  if (!cond) failures.push(msg);
}

// ── Produk tetap utuh: 5 slide + mesin ketik + amplop + musik ────────────
for (let n = 1; n <= 5; n++) {
  check(html.includes(`id="slide-${n}"`), `produk: slide-${n} hilang`);
  check(html.includes(`foto/foto${n}.jpg`), `produk: foto/foto${n}.jpg hilang`);
}
check(html.includes('id="start-btn"'), "produk: tombol Buka Kado Cinta hilang");
check(html.includes('id="start-overlay"'), "produk: overlay pembuka hilang");
check(html.includes('id="envelope-container"'), "produk: amplop segel lilin hilang");
check(html.includes('id="envelope-seal"'), "produk: segel lilin hilang");
check(html.includes('id="heart-seal-btn"'), "produk: tombol hati penutup hilang");
check(html.includes('id="floral-gate"'), "produk: gerbang bunga antar-lembar hilang");
check(html.includes("audio/lagu.mp3"), "produk: lagu latar hilang");
check(html.includes('id="music-vinyl"'), "produk: piringan vinyl hilang");
check(html.includes("data-typewriter"), "produk: efek mesin ketik hilang");
check(/id="prev-btn"/.test(html) && /id="next-btn"/.test(html),
  "produk: navigasi Kembali/Lanjut hilang");

// ── Marker produk asli di root (bukan teks landing) ───────────────────────
check(html.includes("Buka Kado Cinta"), "marker 'Buka Kado Cinta' tidak ada di root");
check(html.includes("MY SWEETHEART"), "marker 'MY SWEETHEART' tidak ada di root");
check(html.includes("Lembar Awal Kita"), "marker 'Lembar Awal Kita' tidak ada di root");
check(html.includes("Selamanya &amp; Seterusnya"), "marker 'Selamanya & Seterusnya' tidak ada di root");
check(/<title>Selamat Ulang Tahun, Sayang \| Vintage Scrapbook<\/title>/.test(html),
  "title root harus judul produk asli, bukan judul landing");

// ── NOL frasa / artefak landing SaaS di root ─────────────────────────────
for (const phrase of [
  "Kado ulang tahun yang dibuka lembar demi lembar.",
  "Isi album",
  "Indeks arsip",
  "Cara pakai",
  "Buka scrapbook",
  "scrapbook.html",
  "styles.css",
  "app.js",
  "class=\"gallery\"",
  "class=\"stamp-card\"",
  "class=\"index-list\"",
  "class=\"steps\"",
  "class=\"navbar\"",
  "nav-toggle",
  "← Landing",
]) {
  check(!html.includes(phrase), `sisa landing SaaS di root: "${phrase}"`);
}
// file landing / duplikat produk harus SUDAH dihapus dari repo
for (const f of ["scrapbook.html", "styles.css", "app.js"]) {
  check(!existsSync(f), `file ${f} harus sudah dihapus (root = produk, tanpa duplikat)`);
}

// ── Audit-fix PR #2: kelas Tailwind mati dilarang ────────────────────────
// Temuan audit: w-68 / w-76 / h-76 / h-4.5 / z-25 / z-35 / z-45 BUKAN skala
// Tailwind v3 — CDN tidak menghasilkan CSS-nya, jadi efek yang dimaksud
// penulis diam-diam tidak jalan (paling nyata: washi tape foto 4 tingginya
// 0 karena h-4.5 mati). Perbaikannya memakai nilai arbitrer ([17rem] dst).
const deadClass = /\b(w-68|w-76|h-76|h-4\.5|z-25|z-35|z-45)\b/;
check(!deadClass.test(html), "kelas Tailwind mati (w-68/w-76/h-76/h-4.5/z-25/z-35/z-45) masih ada");
for (const fixed of ["sm:w-[17rem]", "md:w-[19rem]", "md:h-[19rem]", "h-[1.125rem]", "z-[25]", "z-[45]"]) {
  check(html.includes(fixed), `perbaikan audit-fix hilang: ${fixed}`);
}
// segel lilin (z-30) harus tetap di atas flap amplop yang tertutup
check(/id="envelope-flap"[^>]*z-\[25\]/.test(html),
  "flap amplop harus z-[25] (di bawah segel z-30) — lihat komentar di HTML");

// ── Font produk asli (bukan font landing, bukan Inter/Roboto) ────────────
check(/Great Vibes/.test(html) && /Courier Prime/.test(html) && /Playfair Display/.test(html),
  "font produk harus Great Vibes + Courier Prime + Playfair Display (asli repo)");
check(!/\bInter\b/.test(html), "P0: font Inter terlarang");
check(!/\bRoboto\b/.test(html), "P0: font Roboto terlarang");

// ── Tag OG + Twitter wajib lengkap (absolut ke root) ─────────────────────
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

// ── README proper (gate merge sejak koreksi 19 Nov 2026) ────────────────
// readme proper = penjelasan + cara jalan + screenshot asli + video demo.
// og-image BUKAN screenshot — screenshot harus dari tur Playwright (demo/).
const readme = readFileSync("README.md", "utf8");
for (const shot of ["demo/slide-1.png", "demo/slide-4-envelope.png", "demo/slide-5.png"]) {
  check(existsSync(shot), `screenshot demo hilang: ${shot}`);
  check(readme.includes(`](${shot})`), `README harus menampilkan screenshot ${shot} secara inline`);
}
check(existsSync("demo/demo.mp4"), "video demo hilang: demo/demo.mp4");
check(readme.includes("demo/demo.mp4"), "README harus link ke video demo demo.mp4");
check(readme.includes("demo/cover.png"), "README harus memakai demo/cover.png sebagai thumbnail video");
check(existsSync("demo/cover.png") && existsSync("demo/slide-2.png") && existsSync("demo/slide-3.png"),
  "demo/ harus berisi 6 screenshot tur (cover + slide 1-5)");
check(statSync("demo/demo.mp4").size > 100_000,
  "demo.mp4 terlalu kecil (<100KB) — bukan video demo beneran");

// ── Kejujuran isi ─────────────────────────────────────────────────────────
check(/5 lembar/.test(html) || /Halaman <span id="current-slide-num">1<\/span> dari 5/.test(html),
  "angka nyata repo (5 lembar) harus ada di produk");
check(/github\.com\/dezzorigin\/vintage-memories-scrapbook/i.test(html),
  "tautan GitHub repo (higiene) harus ada di produk");

if (failures.length) {
  console.error(`check-static: ${failures.length} kegagalan:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("check-static: OK (produk utuh di root + 0 sisa landing SaaS + audit-fix + OG/Twitter)");
