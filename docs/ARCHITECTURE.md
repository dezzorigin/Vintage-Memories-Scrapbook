# ARCHITECTURE — Vintage Memories Scrapbook

## Gambaran

Situs **statis penuh, tanpa build**. Satu halaman HTML (produk di root),
media lokal di repo, dan tidak ada satu pun dependensi runtime yang diinstal
via npm. Deploy = unggah direktori ke Cloudflare Pages (direct upload API).

```
pengunjung ──▶ Cloudflare Pages ──▶ index.html (produk: scrapbook 5 lembar)
                                  ├─ foto/*.jpg + og-image.png
                                  └─ audio/lagu.mp3
```

Sejak PR #2 (audit-fix, 19 Nov 2026) root ADALAH produknya — dulu ada dua
halaman (landing `index.html` + produk `scrapbook.html`); landing dibongkar
dan duplikat produk dihapus, jadi tinggal satu halaman.

Diagram visual: [`diagrams/architecture.html`](diagrams/architecture.html)
(HTML + SVG, bukan Mermaid).

## Komponen

| Komponen | File | Peran |
|---|---|---|
| Scrapbook | `index.html` | Produk: 5 slide + mesin ketik + amplop + musik + partikel (root = produk) |
| Media | `foto/foto1-5.jpg`, `audio/lagu.mp3` | Isi album; ±7 MB, tetap di repo |
| Preview | `og-image.png`, `favicon.svg` | Kartu OG 1200×630 (PIL, dari foto1.jpg) + segel lilin SVG |
| Tes | `e2e/*.spec.ts`, `scripts/check-static.mjs` | Playwright + gate produk/OG |
| CI | `.github/workflows/ci.yml` | static-checks, advisory-sweep, gitleaks, e2e, smoke |

## Alur scrapbook (state machine sederhana)

```
start-overlay ──klik──▶ slide 1 (ketik) ──Lanjut──▶ slide 2 ──▶ slide 3
     │                                                              │
     └─ audio.play() (unlock autoplay)                              ▼
                                                          slide 4 (amplop)
                                                          klik → surat naik
                                                          + ketik
                                                                │
                                                                ▼
                                                          slide 5 (hati)
                                                          klik → 20 partikel
```

- `currentSlide` (1–5), `isTransitioning` mengunci navigasi selama gerbang
  bunga (±1,85 detik). `typewriterTimers` dibersihkan tiap pindah slide.
- `isEnvelopeOpened` + `resetEnvelope()` saat meninggalkan slide 4.
- `isMusicPlaying` disinkronkan dengan ikon vinyl + indikator warna.

## Dependensi

| Dependensi | Jenis | Dipakai di | Catatan |
|---|---|---|---|
| Tailwind Play CDN | runtime (CDN) | `index.html` | Sudah ada sejak commit awal; dipertahankan supaya produk tidak berubah perilaku |
| Google Fonts (Great Vibes, Courier Prime, Playfair Display) | runtime (CDN) | produk | Font asli produk: script + mesin ketik + serif display |
| `@playwright/test` ^1.55.0 | dev | e2e | CI saja |
| `html-validate` ^11.21.1 | dev | static-checks | CI saja |

**Tidak ada dependensi produksi npm** — situs statis tanpa `node_modules`
saat jalan. Karena itu `scripts/advisory-sweep.py` memverifikasi daftar
kosong (exit 0, "0 paket produksi") dan tetap gagal kalau ada HIGH/CRITICAL
seandainya daftar terisi kelak. JANGAN ganti gate ini ke `npm audit`
(melaporkan advisory dev-only sebagai temuan produksi).

## Keputusan

1. **Landing terpisah dari produk (PR #1) — DIBATALKAN di PR #2.**
   `index.html` awal ADALAH scrapbook-nya; PR #1 menulis ulang jadi landing
   dan memindahkan produk ke `scrapbook.html`. PR #2 membalikkan keputusan
   itu (arah baru koordinator 19 Nov 2026: root harus JADI produknya):
   produk kembali ke `index.html`, landing dibongkar, `scrapbook.html` /
   `styles.css` / `app.js` dihapus.
2. **Media tetap di repo.** ±7 MB masih wajar untuk git; tidak ada file media
   yang tidak terpakai (5 foto + lagu dipakai di scrapbook). Kalau album
   membesar, follow-up: pindah ke R2/Images.
3. **Tanpa build step.** Menambah bundler untuk situs 1 halaman hanya
   menambah titik gagal; CI memvalidasi file apa adanya.
4. **Tanpa lockfile di root.** Repo tidak punya `package-lock.json`; CI memakai
   `npm install` (bukan `npm ci`) dan tanpa `cache: npm` di setup-node.

## Deploy

Direct upload via `~/workspace/github-actions/cf_pages.py` (token vault).
Proyek: `vintage-memories-scrapbook` (fallback: `vintage-memories`,
`scrapbook-vintage`). Detail: [`DEPLOY.md`](DEPLOY.md).
