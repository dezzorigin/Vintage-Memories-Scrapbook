#!/usr/bin/env python3
"""Generate og-image.png 1200x630 untuk vintage-memories-scrapbook (PIL, lokal).

Desain mengikuti palet situs (docs/DESIGN.md): Kertas Arsip #FDFCF6,
Tinta #1B1712, Merah Pos #C1272D, Kuning Perangko #F2A900, Biru Pos #1D4ED8.
Foto kanan = foto/foto1.jpg ASLI dari repo (bukan stok, bukan render AI),
dipotong persegi dan dibingkai seperti polaroid. Tanpa gradient, tanpa emoji.
"""
from PIL import Image, ImageDraw, ImageFont, ImageOps

W, H = 1200, 630
KERTAS = (253, 252, 246)
TINTA = (27, 23, 18)
MERAH = (193, 39, 45)
KUNING = (242, 169, 0)
BIRU = (29, 78, 216)
ABU = (107, 100, 90)
PUTIH = (255, 253, 248)

SERIF_B = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
MONO_B = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"

img = Image.new("RGB", (W, H), KERTAS)
d = ImageDraw.Draw(img)

# bingkai tinta + garis kuning bawah judul
d.rectangle([0, 0, W - 1, H - 1], outline=TINTA, width=6)
d.rectangle([0, H - 14, W, H], fill=KUNING)

# foto asli kanan, dibingkai polaroid miring (rotasi kecil via paste)
photo = Image.open("foto/foto1.jpg").convert("RGB")
photo = ImageOps.fit(photo, (430, 430))
frame = Image.new("RGB", (470, 540), PUTIH)
frame.paste(photo, (20, 20))
fd = ImageDraw.Draw(frame)
fd.rectangle([0, 0, 469, 539], outline=TINTA, width=4)
f_cap = ImageFont.truetype(SERIF_B, 34)
fd.text((235, 462), "Lembar Awal Kita", font=f_cap, fill=MERAH, anchor="mt")
frame = frame.rotate(-3, expand=True, resample=Image.BICUBIC, fillcolor=KERTAS)
img.paste(frame, (690, 55))
# washi tape kuning di atas polaroid
d.rectangle([830, 38, 950, 66], fill=KUNING)

# kicker
f_kick = ImageFont.truetype(MONO_B, 26)
d.text((64, 64), "ARSIP NO. 01  ·  KADO ULANG TAHUN DIGITAL", font=f_kick, fill=MERAH)

# judul
f_title = ImageFont.truetype(SERIF_B, 92)
d.text((60, 118), "Vintage", font=f_title, fill=TINTA)
d.text((60, 214), "Memories", font=f_title, fill=TINTA)
d.text((60, 310), "Scrapbook", font=f_title, fill=MERAH)
d.rectangle([64, 418, 184, 428], fill=KUNING)

# subjudul
f_sub = ImageFont.truetype(MONO, 30)
d.text((64, 452), "5 lembar  ·  5 foto  ·  1 lagu", font=f_sub, fill=TINTA)
d.text((64, 494), "amplop segel lilin + mesin ketik", font=f_sub, fill=ABU)

# cap pos biru
f_stamp = ImageFont.truetype(MONO_B, 24)
d.rectangle([64, 548, 330, 592], outline=BIRU, width=3)
d.text((76, 558), "CAP POS · 19 NOV 2026", font=f_stamp, fill=BIRU)

img.save("og-image.png")
print("og-image.png:", img.size)
