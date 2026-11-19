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
| Gate produk + OG | `npm run validate` → `scripts/check-static.mjs` | Produk utuh (5 slide, amplop, musik, hati, gerbang); 0 sisa landing SaaS; 0 kelas Tailwind mati; font produk asli; 9 tag OG/Twitter absolut ke `vintage-memories-scrapbook.pages.dev`; `og-image.png` + `favicon.svg` ada; `scrapbook.html`/`styles.css`/`app.js` sudah dihapus |
| Advisory sweep | `scripts/advisory-sweep.py` | OSV atas dependensi produksi (saat ini 0 paket npm — situs statis); HIGH/CRITICAL = gagal |
| Secret scan | gitleaks 8.28.0, riwayat penuh, config repo | Tanpa temuan |
| E2E Playwright | `npm run e2e` (Chromium, desktop 1280×800 + Pixel 7 390×844) | Lihat bawah |
| Smoke | job CI `smoke` | Semua file deploy ada & tidak kosong |
| Verifikasi live | `scripts/verify-live.py <url>` | Root 200 + marker produk + 9 tag OG + og-image.png 200 `image/*` ≥10 KB + 5 foto 200 + lagu 200 `audio/mpeg` + `/scrapbook.html` identik byte dengan root (fallback Pages — 404 live tidak bisa diuji) + 0 frasa SaaS |

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

## Yang TIDAK diuji di CI (follow-up)

- **Screenshot asli + video demo** — butuh browser live di luar VM;
  diambil saat VM pulih / dari browser beneran. Bukan gate merge.
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
