# PRD — Vintage Memories Scrapbook

## Ringkasan

Template kado ulang tahun digital berbentuk scrapbook interaktif. Penerima
membuka satu link, menekan "Buka Kado Cinta", lalu membalik 5 lembar berisi
foto dan ucapan — diakhiri surat di dalam amplop segel lilin dan tombol hati.
Repo ini adalah hasil "proper" P1 #52 dari satu commit awal ("Template jualan
cuy", 9 Jul 2026) yang hanya berisi `index.html` + 5 foto + 1 lagu, tanpa
README, LICENSE, .gitignore, CI, atau deploy.

## Pengguna

- **Pemberi kado** — mengganti foto, lagu, dan teks ucapan, lalu mengirim
  link. Teknis: cukup ganti file di `foto/` dan `audio/`, edit atribut
  `data-typewriter` di `index.html`.
- **Penerima kado** — membuka link di browser (desktop/mobile), tanpa install
  dan tanpa akun.

## Kebutuhan fungsional

### Scrapbook (`index.html`) — produk inti, root = produk (PR #2)

Sejak PR #2 (audit-fix, 19 Nov 2026) root situs ADALAH scrapbook-nya:
`index.html` berisi produk asli repo (dulu `scrapbook.html`, dipindah ke
root + perbaikan audit). Tidak ada landing, tidak ada halaman perantara.

1. **Layar pembuka** — kartu polaroid "Teruntuk Sayangku" + tombol
   "Buka Kado Cinta". Klik tombol = pemutar musik diizinkan browser
   (autoplay policy) + lembar 1 mulai mengetik.
2. **Navigasi 5 lembar** — tombol Kembali / Lanjut, penomoran "Halaman N dari
   5", tombol terakhir berubah jadi "Ulangi". Pindah lembar = gerbang bunga
   menutup (750 ms) lalu membuka (1150 ms); selama transisi navigasi dikunci.
3. **Efek mesin ketik** — tiap lembar (kecuali lembar 4 sebelum amplop dibuka)
   mengetik teksnya huruf demi huruf dengan jeda acak 30–65 ms + kursor
   berkedip.
4. **Amplop interaktif (lembar 4)** — klik amplop: segel lilin mengecil
   menghilang, flap atas berputar 180°, surat naik keluar, teks mulai mengetik.
   Meninggalkan lembar 4 mereset amplop ke tertutup.
5. **Musik latar** — `audio/lagu.mp3` (loop). Piringan vinyl di pojok kanan
   berputar saat main, indikator merah/hijau. Klik piringan atau klik foto
   polaroid mana pun = play/pause.
6. **Tombol hati (lembar 5)** — klik memunculkan 20 partikel hati/kilau yang
   berhamburan lalu menghilang (±1,1 detik).
7. **Fallback foto** — kalau sebuah foto gagal dimuat, bingkai fallback
   menampilkan label "FOTO N" + nama file, bukan kotak kosong.
8. **Ornamen melayang** — simbol (kue, balon, hati, bunga, dsb) naik dari
   bawah layar secara berkala; dekoratif, tidak menghalangi konten.

### Landing (`index.html` PR #1) — DIBONGKAR di PR #2

PR #1 sempat membangun landing SaaS di root (navbar, hero 2 kolom, galeri
"Isi album", indeks fitur, cara pakai, footer marketing) dengan produk di
`scrapbook.html`. PR #2 membongkar landing itu seluruhnya — arah baru
koordinator 19 Nov 2026: root harus JADI produknya, bukan etalase tentang
produk. Yang dipertahankan dari landing hanya tautan GitHub repo (higiene,
di footer produk) + judul/deskripsi jujur. `scrapbook.html`, `styles.css`,
dan `app.js` dihapus; `/scrapbook.html` kini 404.

### Non-fungsional

- **Statis penuh** — tanpa build, tanpa backend, tanpa dependensi runtime
  (produk: Tailwind CDN + Google Fonts, seperti aslinya).
- **OG preview lengkap** — `og:title/description/type/url/image` +
  `twitter:card summary_large_image` di root; `og:image` absolut ke
  `og-image.png` 1200×630 (dibuat dari foto asli `foto/foto1.jpg` via PIL).
- **Aksesibilitas** — label aria pada tombol ikon, focus-visible, skip link,
  `prefers-reduced-motion` dihormati, kontras AA, tanpa scroll horizontal di
  390px.
- **Tanpa secret** — tidak ada kredensial di repo; gitleaks riwayat penuh
  harus bersih.

## Bukan tujuan (out of scope)

- Editor foto/teks di dalam browser (pengeditan dilakukan di file).
- Backend, database, atau akun pengguna.
- Musik/lagu baru — lagu contoh tetap `audio/lagu.mp3` apa adanya.
- Menghapus atau memindahkan media (±7 MB tetap di repo, keputusan
  koordinator 19 Nov 2026).

## Kriteria terima

- Semua 8 poin fungsional scrapbook bekerja di play-test
  (CI Playwright + verifikasi live).
- CI hijau penuh (static-checks, advisory-sweep, gitleaks, e2e, smoke).
- Live di Cloudflare Pages: root 200 + marker produk + tag OG lengkap +
  og-image.png 200 `image/*` + kelima foto 200 + `audio/lagu.mp3` 200
  `audio/mpeg` + `/scrapbook.html` 404 + 0 frasa landing SaaS di root.
