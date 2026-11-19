# DESIGN.md — Kontrak arah desain vintage-memories-scrapbook

Ditulis SEBELUM coding, sesuai `~/workspace/github-actions/ui-anti-slop.md` §4.
Produknya: **template kado ulang tahun digital** — scrapbook interaktif 5 lembar
(cover polaroid → 2 lembar harapan → kartu pos → amplop segel lilin → penutup),
5 foto asli + 1 lagu latar. Landing di root (`index.html` + `styles.css` +
`app.js`) adalah **etalase + pintu masuk**: memperkenalkan scrapbook-nya,
menampilkan isi album (5 foto asli), lalu mengantar ke `scrapbook.html` —
pengalaman interaktif aslinya, yang dipertahankan utuh (mesin ketik, amplop,
musik, partikel hati).

## Referensi (tour dulu, baru bangun)

Kandidat yang ditinjau (19 Nov 2026):
1. **OldView — Vintage Photography & Living History Platform** (Dribbble,
   Majidur Rahman) — PEMENANG. Platform arsip foto vintage: hero editorial
   besar, galeri sebagai isi utama, tipografi serif berani, warna arsip kuat
   (bukan beige pudar). Rasa "lemari arsip foto" yang hidup.
2. **Vintage Travel Scrapbook Collage** (Dribbble) — kolase scrapbook dengan
   perangko + washi tape; dipakai sebagai pembanding detail hiasan, bukan
   struktur (terlalu padat untuk landing).
3. **Pixora — Photo Gallery Website Design** (Dribbble) — galeri foto sebagai
   pusat halaman; dipakai sebagai pembanding susunan galeri.

Yang di-clone dari pemenang: hero editorial 2 kolom (teks besar kiri, kolase
foto kanan), galeri sebagai bagian utama halaman, indeks arsip sebagai daftar
fitur (bukan kartu-kartu simetris), satu detail arsip yang diulang (perangko).
Yang diubah: bukan platform arsip umum — ini satu album kado ulang tahun
(5 lembar, 5 foto, 1 lagu); paletnya poster pos (merah pos + kuning perangko
+ biru pos), bukan monokrom arsip; detail khasnya perangko bergigi + segel
lilin, bukan bingkai foto polos.

## Palet (6 warna bernama, tiap warna punya tugas)

| Nama | Hex | Peran |
|---|---|---|
| Kertas Arsip | `#FDFCF6` | Latar halaman — putih arsip, hampir putih (bukan krim) |
| Tinta | `#1B1712` | Teks utama, garis, bingkai polaroid |
| Merah Pos | `#C1272D` | Satu-satunya aksen aksi: CTA, segel lilin, penanda aktif |
| Kuning Perangko | `#F2A900` | Aksen kedua: perangko, sorotan, garis bawah judul |
| Biru Pos | `#1D4ED8` | Aksen ketiga, dipakai hemat: cap pos, link, label galeri |
| Abu Arsip | `#6B645A` | Teks sekunder, keterangan, nomor indeks |

Bukan gradient (P0), bukan satu hue doang, bukan krim + terracotta, bukan
near-black + lime, bukan dark blue/slate (biru hanya satu aksen dari enam
warna, bukan tema). Kuning + merah + biru = palet poster pos / risograph,
bukan beige pudar.

## Tipografi (≤2 keluarga)

- **Fraunces** — display/headline. Serif poster dengan sumbu optik, terasa
  seperti sampul arsip cetak, bukan seperti template SaaS.
- **Courier Prime** — data, label, keterangan foto, tombol. Mesin ketik =
  dunia arsip + kesinambungan dengan scrapbook aslinya (yang memang memakai
  Courier Prime). Angka memakai tabular-nums.

Beda dari repo sebelumnya (#48 dotfiles: Space Grotesk + IBM Plex Mono).

## Layout (satu kalimat + satu detail khas)

Hero 2 kolom (teks kiri, kolase 3 polaroid miring kanan), lalu galeri "Isi
album" 5 foto asli sebagai strip arsip, lalu fitur sebagai baris-baris indeks
arsip bernomor (bukan grid kartu), lalu cara pakai 3 langkah, lalu footer
satu baris.

Detail khas: **perangko bergigi + segel lilin** — setiap foto galeri memakai
bingkai perangko (border putus-putus + label cap pos), dan CTA memakai segel
lilin merah bundar; polaroid di hero miring dengan washi tape kuning.

## Beda dari #48 (minimal 3 dari 5 sumbu — ini 5/5)

- Palet: poster pos merah/kuning/biru vs meja kerja abu-hijau + teal.
- Tipografi: Fraunces + Courier Prime vs Space Grotesk + IBM Plex Mono.
- Layout: hero 2 kolom + galeri strip vs satu kolom editorial + mockup penuh lebar.
- Radius/spacing: radius 2px tajam + kartu miring vs radius 4px datar.
- Detail khas: perangko + segel lilin vs keycap keyboard + mockup desktop.

## Catatan kejujuran

- Angka di landing hanya angka nyata repo: 5 foto, 1 lagu, 5 lembar, 7 file,
  ±7 MB media di dalam repo.
- `scrapbook.html` adalah produk asli yang dipertahankan (Tailwind CDN +
  Google Fonts + efek vintage-nya sendiri, termasuk vignette radial di produk
  itu). Gate P0 landing (check-static) hanya memindai `index.html`,
  `styles.css`, `app.js` — produk interaktifnya tidak ditulis ulang supaya
  perilakunya tetap seperti yang sudah teruji.
- Foto di galeri + og-image adalah foto asli repo (`foto/foto1.jpg` dst),
  bukan stok. Screenshot asli + video demo adalah follow-up (browser live),
  bukan gate merge.
