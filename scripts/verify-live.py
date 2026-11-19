#!/usr/bin/env python3
"""Verifikasi live vintage-memories-scrapbook di Cloudflare Pages.

Usage: python3 scripts/verify-live.py https://vintage-memories-scrapbook.pages.dev

PR #2 (audit-fix): root ADALAH produknya — scrapbook interaktif 5 lembar.
Cek: root 200 + marker produk + semua tag og:/twitter: ada +
og-image.png 200 dengan content-type image/* (bukan text/html — fallback
Pages menipu) + 5 foto 200 + audio/lagu.mp3 200 audio/mpeg +
/scrapbook.html identik byte dengan root + 0 frasa landing SaaS di root.
Memakai User-Agent browser: UA default Python kena 403
Cloudflare (pelajaran repo #40).

CATATAN FALLBACK PAGES (temuan verifikasi PR #2): proyek Pages ini
mengembalikan HTTP 200 + isi root untuk SEMUA path yang tidak dikenal
(`/scrapbook.html`, `/styles.css`, `/tidak-ada.html`, …) — SPA fallback
di level proyek, bukan file. Karena itu HTTP 404 live TIDAK BISA diuji:
yang dicek adalah `/scrapbook.html` byte-identik dengan root — kalau file
basi masih ada di deployment, isinya pasti beda (dulu 49.592 byte,
sekarang root 49.828 byte). Bukti file terhapus dari repo tetap dicek
e2e di server lokal (di sana `/scrapbook.html` = 404 asli).
"""
import sys
import urllib.request
import urllib.error

UA = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    )
}

MARKERS = ["Buka Kado Cinta", "MY SWEETHEART", "Lembar Awal Kita"]
SAAS_PHRASES = [
    "Kado ulang tahun yang dibuka lembar demi lembar.",
    "Isi album",
    "Indeks arsip",
    "Cara pakai",
    "Buka scrapbook",
]
OG_TAGS = [
    "og:title", "og:description", "og:type", "og:url", "og:image",
    "twitter:card", "twitter:title", "twitter:description", "twitter:image",
]
MEDIA = [f"foto/foto{n}.jpg" for n in range(1, 6)] + ["audio/lagu.mp3"]


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.build_opener().open(req, timeout=30) as r:
        return r.status, r.headers.get("Content-Type", ""), r.read()


def main():
    base = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "https://vintage-memories-scrapbook.pages.dev"
    failures = []

    try:
        status, ctype, body = fetch(base + "/")
    except urllib.error.HTTPError as e:
        print(f"FAIL: root {base}/ -> HTTP {e.code}")
        return 1
    html = body.decode("utf-8", "replace")
    root_body = body  # simpan: body tertimpa fetch-fetch berikutnya
    print(f"root: HTTP {status}, content-type {ctype}, {len(body)} byte")
    if status != 200:
        failures.append(f"root HTTP {status}")
    for marker in MARKERS:
        if marker not in html:
            failures.append(f"marker produk '{marker}' tidak ada")
    for phrase in SAAS_PHRASES:
        if phrase in html:
            failures.append(f"frasa landing SaaS masih ada di root: '{phrase}'")
    for tag in OG_TAGS:
        if tag not in html:
            failures.append(f"tag {tag} tidak ada")
    if "og-image.png" not in html:
        failures.append("og-image.png tidak dirujuk di HTML")

    try:
        status, ctype, body = fetch(base + "/og-image.png")
    except urllib.error.HTTPError as e:
        print(f"FAIL: og-image.png -> HTTP {e.code}")
        return 1
    print(f"og-image.png: HTTP {status}, content-type {ctype}, {len(body)} byte")
    if status != 200:
        failures.append(f"og-image.png HTTP {status}")
    if not ctype.startswith("image/"):
        failures.append(f"og-image.png content-type bukan image/*: {ctype}")
    if len(body) < 10_000:
        failures.append(f"og-image.png terlalu kecil: {len(body)} byte (<10KB)")

    for path in MEDIA:
        try:
            status, ctype, body = fetch(f"{base}/{path}")
        except urllib.error.HTTPError as e:
            print(f"FAIL: {path} -> HTTP {e.code}")
            failures.append(f"{path} HTTP {e.code}")
            continue
        print(f"{path}: HTTP {status}, content-type {ctype}, {len(body)} byte")
        if status != 200:
            failures.append(f"{path} HTTP {status}")
        if len(body) == 0:
            failures.append(f"{path} kosong (0 byte)")
        if path == "audio/lagu.mp3" and not ctype.startswith("audio/mpeg"):
            failures.append(f"audio/lagu.mp3 content-type bukan audio/mpeg: {ctype}")

    gone_status, _, gone_body = fetch(base + "/scrapbook.html")
    print(f"scrapbook.html (entry lama): HTTP {gone_status}, {len(gone_body)} byte "
          f"(harus identik byte dengan root — fallback Pages, lihat catatan di atas)")
    if gone_body != root_body:
        failures.append("scrapbook.html tidak identik dengan root — file basi masih hidup di deployment")

    if failures:
        print(f"verify-live: {len(failures)} kegagalan:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("verify-live: OK (live 200, marker produk, og tags, og-image image/*, media 200, scrapbook.html = fallback root, 0 frasa SaaS)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
