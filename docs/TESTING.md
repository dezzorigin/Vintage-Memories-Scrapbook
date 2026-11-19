# TESTING — Vintage Memories Scrapbook

## Strategi

Situs statis 2 halaman; yang diuji: konten + interaksi + gerbang kualitas.
Tidak ada unit test (tidak ada logika bisnis yang bisa diuji tanpa DOM) —
semuanya end-to-end lewat Playwright di CI + pemeriksaan statis + verifikasi
live. Chrome lokal di VM tidak bisa start (EPERM mmap), jadi **tidak ada**
e2e/play-test lokal: semua tes browser hanya di CI.

## Lapisan tes

| Lapisan | Alat | Yang dicek |
|---|---|---|
| Validasi HTML | `html-validate` 11 (Node 24) | `index.html` valid |
| Gate P0 + OG | `npm run validate` → `scripts/check-static.mjs` | Nol gradient/Inter/Roboto/emoji/copy generik; palet & font sesuai DESIGN.md; 9 tag OG/Twitter absolut ke `vintage-memories-scrapbook.pages.dev`; `og-image.png` + `favicon.svg` ada; marker landing; angka nyata (5 lembar/foto, 1 lagu); `prefers-reduced-motion` |
| Advisory sweep | `scripts/advisory-sweep.py` | OSV atas dependensi produksi (saat ini 0 paket npm — situs statis); HIGH/CRITICAL = gagal |
| Secret scan | gitleaks 8.28.0, riwayat penuh, config repo | Tanpa temuan |
| E2E Playwright | `npm run e2e` (Chromium, desktop 1280×800 + Pixel 7 390×844) | Lihat bawah |
| Smoke | job CI `smoke` | Semua file deploy ada & tidak kosong |
| Verifikasi live | `scripts/verify-live.py <url>` | Root 200 + marker + 9 tag OG + og-image.png 200 `image/*` ≥10 KB + 5 foto 200 |

## Tes E2E (`e2e/landing.spec.ts`)

1. **Landing tampil** — title mengandung "Vintage Memories Scrapbook";
   headline "Kado ulang tahun yang dibuka lembar demi lembar." terlihat;
   galeri berisi tepat 5 kartu perangko; fakta "5" lembar/foto terlihat;
   link GitHub ke repo terlihat; CTA "Buka scrapbook" mengarah ke
   `scrapbook.html`.
2. **Menu mobile** — di viewport 390px, toggle membuka menu; klik link
   menutup menu.
3. **Scrapbook tampil** — buka `/scrapbook.html`: title mengandung "Selamat
   Ulang Tahun"; overlay pembuka + tombol "Buka Kado Cinta" terlihat; 5 slide
   ada di DOM; tombol Lanjut/Kembali ada; link "← Landing" kembali ke `/`.
4. **Scrapbook: buka kado + pindah lembar** — klik "Buka Kado Cinta": overlay
   hilang; klik "Lanjut": penomoran berubah jadi "2 dari 5" (menunggu gerbang
   selesai, timeout 10 detik). Catatan: audio mungkin gagal main di headless
   tanpa interaksi nyata — tes tidak mengasert musik berbunyi, hanya navigasi.
5. **Mobile 390px: tanpa scroll horizontal** — `scrollWidth -
   clientWidth <= 0` setelah `document.fonts.ready`; hero + galeri terlihat.

Catatan e2e (pelajaran rantai): mobile memakai **Pixel 7**, BUKAN iPhone
(WebKit tidak ter-install di CI — hanya Chromium). CI memakai `npm install`
(bukan `npm ci`) karena repo tanpa lockfile. Step CI tanpa `| tee` tanpa
pipefail.

## Yang TIDAK diuji di CI (follow-up)

- **Screenshot asli + video demo** — butuh browser live di luar VM;
  diambil saat VM pulih / dari browser beneran. Bukan gate merge.
- **Kualitas audio** — `lagu.mp3` hanya dicek ada + 200 saat live; isinya
  tidak didengarkan otomatis.

## Menjalankan lokal

```bash
npm install
npm run validate
npm run e2e          # butuh Chrome/Chromium — TIDAK BISA di VM ini (EPERM)
python3 scripts/advisory-sweep.py
python3 scripts/verify-live.py https://vintage-memories-scrapbook.pages.dev
```
