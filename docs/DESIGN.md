# DESIGN.md — Kontrak arah desain vintage-memories-scrapbook

Ditulis SEBELUM coding (PR #1), DIPERBARUI di PR #2 (audit-fix, 19 Nov 2026)
sesuai `~/workspace/github-actions/ui-anti-slop.md` §4.
Produknya: **template kado ulang tahun digital** — scrapbook interaktif 5 lembar
(cover polaroid → 2 lembar harapan → kartu pos → amplop segel lilin → penutup),
5 foto asli + 1 lagu latar.

## Kontrak PR #2 — root = produk (YANG BERLAKU)

**`index.html` di root ADALAH scrapbook-nya.** Tidak ada landing, tidak ada
etalase, tidak ada halaman perantara: yang dibuka di `/` adalah kadonya
langsung (overlay "Teruntuk Sayangku" → tombol "Buka Kado Cinta" → 5 lembar).
Yang boleh dipertahankan dari landing PR #1 hanya yang setia sama produk:
tautan GitHub repo (higiene, di footer) + judul/deskripsi jujur. `scrapbook.html`
(dulu duplikat produk), `styles.css`, dan `app.js` (dulu landing) DIHAPUS.

## Desain produk (asli repo, dipertahankan — bukan dibuat di PR #1/#2)

Desain ini berasal dari commit awal repo ("Template jualan cuy", 9 Jul 2026)
dan dipertahankan apa adanya; PR #1/#2 tidak menulis ulang tampilannya,
hanya memindahkan file-nya ke root + memperbaiki kelas Tailwind yang mati
(lihat "Temuan audit PR #2").

### Palet produk (5 warna bernama, tiap warna punya tugas)

| Nama | Hex | Peran |
|---|---|---|
| Kertas Arsip | `#f4ebd8` | Latar halaman + tekstur kertas |
| Kertas Surat | `#faf6eb` | Kertas notebook / surat di amplop |
| Marun | `#5c0d12` | Segel lilin, tombol hati, aksen utama |
| Burgundi | `#3d0c11` | Gerbang bunga, judul cover |
| Emas | `#bca15a` | Garis, perangko, bingkai segel |
| Coklat Vintage | `#1b0e06` | Teks utama |

Bukan gradient sebagai latar hero (P0) — yang ada hanya tekstur kertas
(radial-gradient titik-titik halus + vignette) sebagai material produk asli,
bukan dekorasi SaaS. Bukan satu hue doang, bukan krim + terracotta, bukan
near-black + lime.

### Tipografi produk (3 keluarga — asli repo)

- **Great Vibes** — script/kaligrafi: judul ucapan ("Teruntuk Sayangku",
  "Happy Birthday,", caption polaroid).
- **Playfair Display** — serif display: "MY SWEETHEART", judul lembar.
- **Courier Prime** — mesin ketik: semua teks ucapan + label + tombol.
  Mesin ketik = dunia arsip + kesinambungan dengan efek mengetik produk.

### Layout produk (satu kalimat + satu detail khas)

Satu layar penuh (`100dvh`, tanpa scroll): header arsip tipis — kanvas 5
lembar bertumpuk (satu aktif) — footer navigasi Kembali/Lanjut + penomoran
"Halaman N dari 5". Tiap pindah lembar, gerbang bunga dua panel menutup lalu
membuka.

Detail khas: **perangko bergigi + segel lilin + gerbang bunga** — stiker
perangko di cover dan kartu pos, segel lilin merah berbingkai emas di amplop
dan tombol hati, gerbang bunga burgundi-emas antar-lembar; polaroid miring
dengan washi tape.

## Temuan audit PR #2 (diperbaiki, bukan diinvent)

1. **Kelas Tailwind mati** — `sm:w-68` (×2), `md:w-76`, `md:h-76`,
   `h-4.5`, `z-25` (×3), `z-35`, `z-45` bukan skala Tailwind v3: CDN tidak
   menghasilkan CSS-nya. Dampak nyata: washi tape diagonal foto 4
   (lembar 3) tingginya 0 → TIDAK TERLIHAT; polaroid lembar 1/5 lebih sempit
   dari maksud penulis di breakpoint `sm`; polaroid lembar 2 lebih sempit
   di `md`; kolase lembar 3 lebih pendek di `md`. Perbaikan: nilai arbitrer
   (`sm:w-[17rem]`, `md:w-[19rem]`, `md:h-[19rem]`, `h-[1.125rem]`,
   `z-[25]`, `z-[45]`) — ukuran maksud penulis, bukan ukuran baru.
2. **Flap amplop vs segel** — nilai lama flap di atas segel adalah kelas
   mati; perilaku terverifikasi selama ini: segel (z-30) di atas flap
   (menang lewat urutan DOM). Perbaikan mengunci itu dengan `z-[25]` —
   segel tetap di atas flap yang tertutup (segel menahan flap, logis).
3. **Tautan "← Landing"** — menunjuk ke `index.html`, yang sekarang adalah
   produk itu sendiri: dihapus (tautan ke diri sendiri). Diganti tautan
   GitHub repo di footer (higiene).
4. **Duplikat produk dihapus** — `scrapbook.html` adalah salinan produk yang
   sama dengan root baru; menyimpan dua salinan = dua sumber yang akan
   melenceng. Dihapus; `/scrapbook.html` kini 404 (dicek e2e + verify-live).

## Yang pensiun bersama landing PR #1 (riwayat, bukan kontrak)

Referensi pemenang PR #1 — **OldView — Vintage Photography & Living History
Platform** (Dribbble, Majidur Rahman) — dipakai untuk hero editorial 2 kolom
+ galeri + indeks arsip landing. Landingnya sudah dibongkar di PR #2, jadi
referensi itu tidak lagi mengikat apa pun. Palet poster pos PR #1 (Merah Pos
`#C1272D` / Kuning Perangko `#F2A900` / Biru Pos `#1D4ED8` di Kertas Arsip
`#FDFCF6`, Fraunces + Courier Prime, radius 2px) juga pensiun bersamanya.
Gate P0/gradient/emoji/font Inter-Roboto yang dulu memindai landing TIDAK
lagi berlaku untuk root — root adalah produk asli, yang gradient-nya hanya
tekstur kertas dan emoji-nya stiker/perangko produk. Gate baru
(`scripts/check-static.mjs`) menjaga: produk utuh, 0 sisa landing SaaS,
0 kelas Tailwind mati, OG lengkap.

## Catatan kejujuran

- Angka di produk hanya angka nyata repo: 5 foto, 1 lagu, 5 lembar,
  ±7 MB media di dalam repo.
- Foto + og-image adalah foto asli repo (`foto/foto1.jpg` dst), bukan stok.
  Screenshot asli + video demo adalah follow-up (browser live), bukan gate
  merge.
- Dikenal batas (bukan gate): konten lembar 2 bisa meluber di viewport
  pendek (<700px); segel vs flap sesudah satu siklus buka amplop (lihat
  README → Follow-up).
