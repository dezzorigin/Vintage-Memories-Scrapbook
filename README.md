# Vintage Memories Scrapbook

**Kado ulang tahun digital: scrapbook interaktif 5 lembar dengan 5 foto, surat
amplop segel lilin, efek mesin ketik, dan lagu latar.**

Live: **https://vintage-memories-scrapbook.pages.dev/** · Repo:
[dezzorigin/Vintage-Memories-Scrapbook](https://github.com/dezzorigin/Vintage-Memories-Scrapbook)

> Foto dan lagu contoh di repo ini adalah isi asli repo (bukan stok). Kalau
> mau dipakai sebagai kado sungguhan, ganti dulu dengan foto dan lagu kamu —
> caranya ada di [Cara pakai](#cara-pakai).

## Apa isinya

Root situs (`index.html`) **adalah scrapbook-nya sendiri** — satu halaman
interaktif yang dibuka lembar demi lembar:

| Lembar | Isi |
|---|---|
| 1 — Cover | Polaroid "Lembar Awal Kita" + ucapan "Happy Birthday, My Sweetheart" |
| 2 — Harapan I | Kertas notebook bergaris, "Sebuah Rencana Indah" + foto "Senyum Favoritku" |
| 3 — Harapan II | Kartu pos "Melangkah Bersamamu" + kolase 2 foto |
| 4 — Surat | Amplop segel lilin — klik untuk membuka, suratnya naik lalu mengetik sendiri |
| 5 — Penutup | Polaroid "Selamanya & Seterusnya" + tombol hati (partikel hati berhamburan) |

Setiap pindah lembar, gerbang bunga menutup lalu membuka. Lagu latar
(`audio/lagu.mp3`) mulai berbunyi begitu kado dibuka; klik foto atau piringan
vinyl di pojok kanan untuk jeda. Teks di tiap lembar mengetik huruf demi huruf
seperti mesin ketik.

> Sejarah: PR #1 (pola lama) sempat membangun landing SaaS di root dan
> memindahkan produk ke `scrapbook.html`. PR #2 (audit-fix, 19 Nov 2026)
> membongkar landing itu: root kembali jadi produknya, `scrapbook.html` /
> `styles.css` / `app.js` dihapus (live Pages mengembalikan fallback root
> untuk path-path itu — identik byte dengan root, bukan file basi).
> Tidak ada lagi halaman etalase — yang dibuka di `/` adalah kadonya langsung.

## Struktur repo

```
.
├── index.html            # produk: scrapbook interaktif 5 lembar (root = produk)
├── favicon.svg           # segel lilin
├── og-image.png          # kartu preview 1200×630 (foto asli foto1.jpg)
├── foto/                 # 5 foto album (foto1.jpg–foto5.jpg)
├── audio/                # 1 lagu latar (lagu.mp3, 6,4 MB)
├── docs/                 # PRD, arsitektur, desain, testing, deploy + diagram
├── scripts/              # advisory-sweep, check-static (gate produk + OG), verify-live
├── e2e/                  # tes Playwright (produk di root, desktop + Pixel 7)
└── .github/workflows/    # CI
```

Angka nyata repo: 7 file di commit awal (1 HTML + 5 foto + 1 lagu), media
±7 MB — semuanya tetap di repo atas keputusan koordinator (ukuran masih
wajar untuk git; tidak ada file media yang tidak terpakai — kelima foto
dipakai di scrapbook, lagu dipakai di scrapbook).

## Cara jalan

Tidak ada build, tidak ada dependensi runtime. Cukup sajikan folder repo
sebagai situs statis:

```bash
# dari root repo
python3 -m http.server 8520 --bind 127.0.0.1
# lalu buka http://127.0.0.1:8520/  (langsung scrapbook-nya)
```

## Cara pakai (jadikan kado)

1. **Ganti isinya** — taruh 5 foto kamu di `foto/foto1.jpg` sampai
   `foto5.jpg`, lagu favorit di `audio/lagu.mp3`, dan ubah teks ucapan
   di `index.html` (cari atribut `data-typewriter`).
2. **Buka dan cek** — buka `/`, klik "Buka Kado Cinta", balik
   kelima lembarnya, buka amplopnya, pastikan lagunya berbunyi.
3. **Kirim linknya** — deploy ke Cloudflare Pages (lihat
   [`docs/DEPLOY.md`](docs/DEPLOY.md)) dan kirim linknya ke orang yang
   berulang tahun. Tidak perlu dia install apa-apa.

## Desain

Arah desain dikunci di [`docs/DESIGN.md`](docs/DESIGN.md): produk asli repo
— kertas arsip `#f4ebd8`, marun `#5c0d12`, emas `#bca15a`, Great Vibes +
Courier Prime + Playfair Display, detail khas perangko bergigi + segel lilin
+ gerbang bunga. Palet poster pos landing PR #1 (Merah Pos `#C1272D` dst)
pensiun bersama landingnya.

## Dokumen

- [`docs/PRD.md`](docs/PRD.md) — kebutuhan produk
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arsitektur + diagram
  ([`docs/diagrams/architecture.html`](docs/diagrams/architecture.html))
- [`docs/DESIGN.md`](docs/DESIGN.md) — kontrak arah desain
- [`docs/TESTING.md`](docs/TESTING.md) — strategi tes
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — cara deploy ke Cloudflare Pages

## Tes

```bash
npm install            # dev-only: @playwright/test + html-validate
npm run validate       # gate produk + tag OG/Twitter
npm run e2e            # Playwright: produk di root (desktop + Pixel 7)
python3 scripts/advisory-sweep.py   # OSV atas dependensi produksi
python3 scripts/verify-live.py https://vintage-memories-scrapbook.pages.dev
```

CI (`.github/workflows/ci.yml`) menjalankan semuanya di setiap PR ke `main`,
plus gitleaks (riwayat penuh) dan smoke check file deploy.

## Follow-up (bukan gate merge)

- **Screenshot asli + video demo** — belum bisa diambil dari VM (Chrome
  lokal tidak bisa start); diambil dari browser live saat VM pulih.
- **Keputusan hosting media** — media ±7 MB tetap di repo untuk repo ini;
  kalau albumnya membesar, pertimbangkan pindah foto ke R2/Cloudflare Images.
- **Layar pendek** — di viewport pendek (mis. tinggi <700px) konten lembar 2
  (notebook + polaroid bertumpuk) bisa meluber melewati area main dan
  tertutup sebagian oleh header/footer (body `overflow-hidden`, tanpa scroll).
  Perilaku bawaan produk asli; perbaikan butuh ubah layout lembar — ditunda,
  bukan gate.
- **Segel vs flap amplop** — sesudah satu siklus buka + tinggalkan lembar 4,
  `resetEnvelope()` mengembalikan flap ke z-index inline 35 (di atas segel
  z-30); tumpang tindihnya hanya ujung segitiga flap ±2px, nyaris tak
  terlihat. Perilaku bawaan JS produk; dicatat, bukan gate.

## Lisensi

MIT — lihat [LICENSE](LICENSE).
