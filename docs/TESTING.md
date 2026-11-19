# TESTING — Vintage Memories Scrapbook

## Strategi

Situs statis 1 halaman (root = produk); yang diuji: konten + interaksi +
gerbang kualitas. Tidak ada unit test (tidak ada logika bisnis yang bisa
diuji tanpa DOM) — semuanya end-to-end lewat Playwright di CI + pemeriksaan
statis + verifikasi live. Chrome lokal di VM tidak bisa start (EPERM mmap),
jadi **tidak ada** e2e/play-test lokal: semua tes browser hanya di CI.

## Lapisan tes

| Lapisan | Alat | Yang dicek |
|---|---|---|
| Validasi HTML | `html-validate` 11 (Node 24) | `index.html` valid |
| Gate produk + OG | `npm run validate` → `scripts/check-static.mjs` | Produk utuh (5 slide, amplop, musik, hati, gerbang); 0 sisa landing SaaS; 0 kelas Tailwind mati; font produk asli; 9 tag OG/Twitter absolut ke `vintage-memories-scrapbook.pages.dev`; `og-image.png` + `favicon.svg` ada; `scrapbook.html`/`styles.css`/`app.js` sudah dihapus; **gate README**: 3 screenshot demo inline di README + `demo/demo.mp4` link + thumbnail `demo/cover.png` + 6 screenshot di `demo/` + mp4 >100 KB |
| Advisory sweep | `scripts/advisory-sweep.py` | OSV atas dependensi produksi (saat ini 0 paket npm — situs statis); HIGH/CRITICAL = gagal |
| Secret scan | gitleaks 8.28.0, riwayat penuh, config repo | Tanpa temuan |
| E2E Playwright | `npm run e2e` (Chromium, desktop 1280×800 + Pixel 7 390×844) | Lihat bawah |
| Tur demo README | `e2e/demo.spec.ts` (proyek "demo", video 1280×800) | Tur + screenshot + video demo — lihat bawah |
| Smoke | job CI `smoke` | Semua file deploy ada & tidak kosong (termasuk `demo/demo.mp4` + 6 screenshot) |
| Verifikasi live | `scripts/verify-live.py <url>` | Root 200 + marker produk + 9 tag OG + og-image.png 200 `image/*` ≥10 KB + 5 foto 200 + lagu 200 `audio/mpeg` + `demo/demo.mp4` 200 `video/mp4` ≥100 KB + `demo/slide-1.png` 200 `image/*` + `/scrapbook.html` identik byte dengan root (fallback Pages — 404 live tidak bisa diuji) + 0 frasa SaaS |

## Tes E2E (`e2e/scrapbook.spec.ts`)

1. **Root tampil produk** — title mengandung "Selamat Ulang Tahun, Sayang";
   overlay pembuka + tombol "Buka Kado Cinta" terlihat; 5 slide ada di DOM;
   tombol Kembali disabled; penomoran "1"; marker "MY SWEETHEART" +
   "Lembar Awal Kita"; `og:url` = root + `og:image` = og-image.png;
   tautan GitHub repo di footer; NOL teks landing SaaS
   ("Kado ulang tahun yang dibuka lembar demi lembar.", "Isi album",
   "Cara pakai").
2. **Buka kado + pindah lembar** — klik "Buka Kado Cinta": overlay hilang;
   klik "Lanjut": penomoran berubah jadi "2 dari 5" (menunggu gerbang
   selesai, timeout 10 detik). Catatan: audio mungkin gagal main di headless
   tanpa interaksi nyata — tes tidak mengasert musik berbunyi, hanya navigasi.
3. **Amplop lembar 4** — maju 3 lembar, klik amplop: surat mulai mengetik
   (teks "Mungkin kata-kata…" muncul, timeout 15 detik).
4. **Tombol hati lembar 5** — maju 4 lembar, tombol "Lanjut" berubah jadi
   "Ulangi"; klik tombol hati: jumlah anak `body` bertambah (20 partikel
   ditempel, hidup ±1,1 detik — dicek 300 ms sesudah klik).
5. **Entry lama sudah tiada** — `GET /scrapbook.html` = 404.
6. **Mobile 390px: tanpa scroll horizontal** — `scrollWidth -
   clientWidth <= 0` setelah `document.fonts.ready`; overlay + tombol
   "Buka Kado Cinta" terlihat.

Catatan e2e (pelajaran rantai): mobile memakai **Pixel 7**, BUKAN iPhone
(WebKit tidak ter-install di CI — hanya Chromium). CI memakai `npm install`
(bukan `npm ci`) karena repo tanpa lockfile. Step CI tanpa `| tee` tanpa
pipefail.

## Tur demo README (`e2e/demo.spec.ts`, gate merge sejak 19 Nov 2026)

Satu tes proyek "demo" (viewport 1280×800, video direkam 1280×800):
cover → Buka Kado Cinta → mesin ketik lembar 1 → klik vinyl (play/pause) →
lembar 2 → kartu pos lembar 3 → amplop lembar 4 dibuka + surat mengetik →
tombol hati lembar 5 + partikel. Screenshot PNG ditulis spek ke `demo/`
(`cover`, `slide-1`, `slide-2`, `slide-3`, `slide-4-envelope`, `slide-5`);
video webm dirakit CI jadi `demo/demo.mp4` (H.264, 1280×800, ±15 detik)
lalu diunggah sebagai artifact **readme-demo**.

Pelajaran CI dari pembuatan tur ini (jangan diulang):

- **Gerbang bunga menutup layar ±1,9 detik tiap pindah lembar** — screenshot
  yang diambil tepat setelah penomoran berubah masih menunjukkan gerbang
  tertutup. Spek menunggu gerbang benar-benar terbuka (`waitGateOpen()`:
  transform panel kiri mengandung `-100%`, lalu +800 ms) sebelum
  screenshot lembar 2–5.
- **ffmpeg TIDAK terpasang di runner** (exit 127) dan **ffmpeg bawaan
  Playwright build minimal**: tak kenal `-movflags` (run 12) maupun muxer
  mp4 (run 13, "Unable to choose an output format"). Konversi memakai
  ffmpeg statik penuh dari npm (`ffmpeg-static`, `npm install --no-save`).
- **Video Playwright tanpa `size` eksplisit direkam 800×500** (run 14) —
  proyek demo set `video: { mode: "on", size: { width: 1280, height: 800 } }`.
- **"Install Playwright browsers" gagal intermiten** di apt runner — step
  di-retry sampai 3× (jeda 30 detik).

### Regenerasi `demo/` (saat produk berubah)

1. Push perubahan produk → tunggu CI hijau.
2. Unduh artifact **readme-demo** dari run CI itu (pola rantai: ambil URL
   redirect 302 ke Azure Blob, fetch URL SAS itu dengan request polos
   TANPA header auth surrogate — header itu ditolak 401).
3. Salin isinya ke `demo/` (6 PNG + `demo.mp4`), commit bersama perubahan
   README bila perlu. Gate `check-static.mjs` gagal bila README tidak
   menampilkan 3 screenshot inline + link mp4, atau bila ada file demo
   hilang.

## Yang TIDAK diuji di CI (follow-up)

- **Kualitas audio** — `lagu.mp3` hanya dicek ada + 200 saat live; isinya
  tidak didengarkan otomatis.
- **Luber di viewport pendek** — konten lembar 2 di layar <700px (lihat
  README) belum ada tes otomatisnya; butuh play-test visual.

## Menjalankan lokal

```bash
npm install
npm run validate
npm run e2e          # butuh Chrome/Chromium — TIDAK BISA di VM ini (EPERM)
python3 scripts/advisory-sweep.py
python3 scripts/verify-live.py https://vintage-memories-scrapbook.pages.dev
```
