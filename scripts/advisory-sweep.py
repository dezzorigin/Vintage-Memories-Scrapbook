#!/usr/bin/env python3
"""Sweep dependensi produksi vintage-memories-scrapbook terhadap OSV.

Pola repo #24-#51: 1 POST ke api.osv.dev/v1/querybatch untuk semua paket
produksi. JANGAN ganti ke `npm audit` (melaporkan advisory dev-only
sebagai temuan produksi) atau ke GitHub Advisory DB API + GITHUB_TOKEN
(401 deterministik di CI).

Repo ini (situs statis, tanpa build) punya NOL dependensi produksi npm:
landing memakai CSS + JS vanilla; scrapbook memakai Tailwind Play CDN +
Google Fonts (bukan paket npm, jadi tidak masuk OSV npm). Daftar PROD
sengaja kosong — skrip tetap memverifikasi itu dan tetap gagal kalau
suatu hari ada HIGH/CRITICAL pada paket yang ditambahkan ke daftar.

Usage:
    python3 scripts/advisory-sweep.py
No token needed. Exit code 0 = production tree clean, 1 = findings,
2 = API error.
"""
import json
import sys
import urllib.request
import urllib.error

SEVERITIES = ("HIGH", "CRITICAL")
OSV_BATCH_URL = "https://api.osv.dev/v1/querybatch"

# Nol dependensi produksi npm (situs statis — lihat docs/ARCHITECTURE.md).
PROD = []


def severity_of(vuln):
    ds = vuln.get("database_specific") or {}
    sev = (ds.get("severity") or "").upper()
    if sev in ("CRITICAL", "HIGH", "MODERATE", "LOW"):
        return sev
    for entry in vuln.get("severity", []) or []:
        try:
            score = float(entry.get("score", ""))
        except (TypeError, ValueError):
            continue
        if score >= 9.0:
            return "CRITICAL"
        if score >= 7.0:
            return "HIGH"
        if score >= 4.0:
            return "MODERATE"
        return "LOW"
    return None


def query_osv(queries):
    body = json.dumps({"queries": queries}).encode()
    req = urllib.request.Request(
        OSV_BATCH_URL,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.build_opener().open(req, timeout=120) as r:
            return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        detail = e.read()[:500].decode("utf-8", "replace")
        print(f"ERROR: OSV API {e.code}: {detail}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"ERROR: OSV request gagal: {e}", file=sys.stderr)
        return None


def main():
    if not PROD:
        print("OK: 0 paket produksi npm — situs statis tanpa dependensi produksi")
        return 0
    queries = [
        {"package": {"name": name, "ecosystem": eco}, "version": ver}
        for name, ver, eco in PROD
    ]
    print(f"sweep {len(queries)} paket: {', '.join(f'{n}=={v}' for n, v, _ in PROD)}")
    data = query_osv(queries)
    if data is None:
        return 2
    results = data.get("results", [])
    findings = []
    for q, res in zip(queries, results):
        for vuln in res.get("vulns", []) or []:
            sev = severity_of(vuln)
            if sev in SEVERITIES:
                findings.append((q["package"]["name"], q["version"], vuln.get("id"), sev))
    if findings:
        print(f"FAIL: {len(findings)} temuan HIGH/CRITICAL:")
        for name, ver, vid, sev in findings:
            print(f"  {sev} {name}=={ver} {vid}")
        return 1
    print("OK: production tree bersih (tanpa HIGH/CRITICAL di OSV)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
