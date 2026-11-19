import { test, expect } from "@playwright/test";

// Tur demo untuk README (gate merge sejak koreksi 19 Nov 2026): scrapbook
// beneran jalan — cover → 5 lembar + mesin ketik + amplop + hati + vinyl.
// Dijalankan di proyek "demo" (video: on) — screenshot PNG masuk demo/,
// video webm-nya dirakit CI jadi demo/demo.mp4 lalu diunggah sebagai
// artifact "readme-demo". Tur ini JUGA tes fungsional: tiap langkah
// mengasert keadaan produk, bukan sekadar rekam layar.
//
// Jeda gerbang: tiap pindah lembar, gerbang bunga menutup (750 ms) lalu
// membuka (1150 ms + transisi 700 ms). Penomoran berubah saat lembar
// bertukar (750 ms) — TAPI gerbang masih tertutup; screenshot langsung
// sesudah itu hanya memotret gerbang (run 10: slide-3.png = gerbang
// burgundi). Jadi tiap screenshot lembar menunggu gerbang selesai membuka.
async function waitGateOpen(page) {
  await page.waitForFunction(
    () => document.getElementById("floral-gate-left").style.transform.includes("-100%"),
  );
  await page.waitForTimeout(800); // transisi buka 700 ms
}

test("demo tour: scrapbook jalan — cover, 5 lembar, amplop, hati, vinyl", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#start-overlay")).toBeVisible();
  await expect(page.locator("#start-btn")).toContainText("Buka Kado Cinta");
  await page.screenshot({ path: "demo/cover.png" });

  await page.locator("#start-btn").click();
  await expect(page.locator("#start-overlay")).toHaveCount(0, { timeout: 10_000 });
  // mesin ketik lembar 1 sudah mulai (tunggu sebagian teks terketik)
  await expect(page.locator("#typewriter-slide1")).toContainText("Ini adalah lembaran cerita kecil kita", { timeout: 15_000 });
  await page.screenshot({ path: "demo/slide-1.png" });

  // vinyl: klik piringan = play/pause (interaksi direkam video; audio
  // headless tidak diasert — yang diasert tombolnya merespons klik)
  await page.locator("#music-btn").click();
  await page.waitForTimeout(500);

  await page.locator("#next-btn").click();
  await expect(page.locator("#current-slide-num")).toHaveText("2", { timeout: 10_000 });
  await expect(page.locator("#slide-2")).toHaveClass(/active-slide/);
  await waitGateOpen(page);
  await expect(page.locator("#typewriter-slide2")).toContainText("Selamat ulang tahun", { timeout: 15_000 });
  await page.screenshot({ path: "demo/slide-2.png" });

  await page.locator("#next-btn").click();
  await expect(page.locator("#current-slide-num")).toHaveText("3", { timeout: 10_000 });
  await expect(page.locator("#slide-3")).toHaveClass(/active-slide/);
  await waitGateOpen(page);
  await page.screenshot({ path: "demo/slide-3.png" });

  await page.locator("#next-btn").click();
  await expect(page.locator("#current-slide-num")).toHaveText("4", { timeout: 10_000 });
  await expect(page.locator("#slide-4")).toHaveClass(/active-slide/);
  await waitGateOpen(page);
  await page.locator("#envelope-container").click();
  await expect(page.locator("#typewriter-slide4")).toContainText("Mungkin kata-kata", { timeout: 15_000 });
  await page.screenshot({ path: "demo/slide-4-envelope.png" });

  await page.locator("#next-btn").click();
  await expect(page.locator("#current-slide-num")).toHaveText("5", { timeout: 10_000 });
  await expect(page.locator("#slide-5")).toHaveClass(/active-slide/);
  await waitGateOpen(page);
  await expect(page.locator("#next-btn")).toContainText("Ulangi");
  await page.locator("#heart-seal-btn").click();
  // partikel hidup ±1,1 detik — potret di tengah hamburan
  await page.waitForTimeout(400);
  await page.screenshot({ path: "demo/slide-5.png" });
});
