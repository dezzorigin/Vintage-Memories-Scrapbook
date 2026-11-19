# DEPLOY — Vintage Memories Scrapbook

## Target

Cloudflare Pages, proyek **`vintage-memories-scrapbook`** →
`https://vintage-memories-scrapbook.pages.dev/`.

Fallback nama (dipakai berurutan kalau nama sudah dipakai akun lain):
`vintage-memories` → `scrapbook-vintage`. Nama bersufiks di hasil create =
dipakai akun lain, pindah ke fallback berikutnya.

## Cara deploy

Direct upload via skrip bersama (token dari vault, jangan minta kredensial):

```bash
python3 ~/workspace/github-actions/cf_pages.py create-project vintage-memories-scrapbook
python3 ~/workspace/github-actions/cf_pages.py deploy vintage-memories-scrapbook ~/workspace/vintage-memories-scrapbook
```

Deploy mengunggah seluruh isi direktori (kecuali `.git`, `node_modules`,
`dist`, dsb — lihat `collect()` di `cf_pages.py`). Tidak ada build step,
tidak ada `_worker.js`.

## Verifikasi live (wajib sebelum merge)

```bash
python3 scripts/verify-live.py https://vintage-memories-scrapbook.pages.dev
```

Cek: root 200 + marker "Kado ulang tahun yang dibuka lembar demi lembar." +
9 tag `og:`/`twitter:` + `og-image.png` 200 dengan `content-type: image/*`
(bukan `text/html` — fallback Pages menipu) + `foto/foto1.jpg`–`foto5.jpg`
200 + `scrapbook.html` 200 + `audio/lagu.mp3` 200.

Pakai User-Agent browser (UA default Python kena 403 Cloudflare — pelajaran
repo #40). Jangan pakai `curl -o` untuk verifikasi (menulis file 0 byte walau
lapor size N).

## Homepage repo

Setelah merge, set About homepage repo ke URL Pages:

```bash
python3 ~/workspace/github-actions/gh_set_homepage.py \
  dezzorigin/vintage-memories-scrapbook \
  https://vintage-memories-scrapbook.pages.dev/
```

## Catatan

- Deploy pertama dilakukan dari branch `feat/proper` SEBELUM merge, untuk
  verifikasi live. Setelah merge, deploy ulang dari `main` supaya yang live
  = isi main.
- Preview screenshot + video demo adalah follow-up (browser live), bukan
  gate merge.
