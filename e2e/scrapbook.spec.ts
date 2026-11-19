import { test, expect } from "@playwright/test";

// Root ADALAH produknya (PR #2 audit-fix): scrapbook interaktif 5 lembar
// di "/" — overlay pembuka, navigasi 5 lembar + gerbang bunga, amplop
// segel lilin, tombol hati. Landing SaaS PR #1 sudah dibongkar; file
// scrapbook.html / styles.css / app.js sudah dihapus (harus 404).

test("root tampil produk: overlay pembuka + 5 slide + navigasi + OG", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Selamat Ulang Tahun, Sayang/);
  await expect(page.locator("#start-overlay")).toBeVisible();
  await expect(page.locator("#start-btn")).toContainText("Buka Kado Cinta");
  await expect(page.locator("#current-slide-num")).toHaveText("1");
  for (let n = 1; n <= 5; n++) {
    await expect(page.locator(`#slide-${n}`)).toHaveCount(1);
  }
  await expect(page.locator("#prev-btn")).toBeDisabled();
  // marker produk asli, bukan teks landing
  await expect(page.locator("#slide-1")).toContainText("MY SWEETHEART");
  await expect(page.locator("#slide-1")).toContainText("Lembar Awal Kita");
  // kartu OG menunjuk ke root + og-image
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://vintage-memories-scrapbook.pages.dev/",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://vintage-memories-scrapbook.pages.dev/og-image.png",
  );
  // tautan GitHub repo (higiene) ada di footer — hidden di mobile
  // (hidden sm:block), jadi asert ada, bukan terlihat
  await expect(
    page.locator('a[href="https://github.com/dezzorigin/Vintage-Memories-Scrapbook"]'),
  ).toHaveCount(1);
  // NOL teks landing SaaS di root
  await expect(page.locator("text=Kado ulang tahun yang dibuka lembar demi lembar.")).toHaveCount(0);
  await expect(page.locator("text=Isi album")).toHaveCount(0);
  await expect(page.locator("text=Cara pakai")).toHaveCount(0);
});

test("scrapbook: buka kado lalu lanjut ke lembar 2", async ({ page }) => {
  await page.goto("/");
  await page.locator("#start-btn").click();
  // overlay bergeser lalu dihapus dari DOM (±1,1 detik)
  await expect(page.locator("#start-overlay")).toHaveCount(0, { timeout: 10_000 });
  await page.locator("#next-btn").click();
  // gerbang bunga: tutup 750 ms + buka 1150 ms + blokir 1850 ms
  await expect(page.locator("#current-slide-num")).toHaveText("2", { timeout: 10_000 });
  await expect(page.locator("#slide-2")).toHaveClass(/active-slide/);
  await expect(page.locator("#prev-btn")).toBeEnabled();
});

test("scrapbook: amplop lembar 4 dibuka, surat mengetik", async ({ page }) => {
  await page.goto("/");
  await page.locator("#start-btn").click();
  await expect(page.locator("#start-overlay")).toHaveCount(0, { timeout: 10_000 });
  // maju 3 lembar (tiap pindah ≈1,9 detik gerbang)
  for (let i = 0; i < 3; i++) {
    await page.locator("#next-btn").click();
    await expect(page.locator("#current-slide-num")).toHaveText(String(i + 2), { timeout: 10_000 });
  }
  await expect(page.locator("#slide-4")).toHaveClass(/active-slide/);
  await expect(page.locator("#envelope-tip")).toBeVisible();
  await page.locator("#envelope-container").click();
  // surat naik lalu mengetik sendiri (±0,5 + 0,45 detik sebelum ketik mulai)
  await expect(page.locator("#typewriter-slide4")).not.toBeEmpty({ timeout: 15_000 });
  await expect(page.locator("#typewriter-slide4")).toContainText("Mungkin kata-kata", { timeout: 15_000 });
});

test("scrapbook: tombol hati lembar 5 memunculkan partikel", async ({ page }) => {
  await page.goto("/");
  await page.locator("#start-btn").click();
  await expect(page.locator("#start-overlay")).toHaveCount(0, { timeout: 10_000 });
  for (let i = 0; i < 4; i++) {
    await page.locator("#next-btn").click();
    await expect(page.locator("#current-slide-num")).toHaveText(String(i + 2), { timeout: 10_000 });
  }
  await expect(page.locator("#slide-5")).toHaveClass(/active-slide/);
  await expect(page.locator("#next-btn")).toContainText("Ulangi");
  const before = await page.evaluate(() => document.body.children.length);
  await page.locator("#heart-seal-btn").click();
  // 20 partikel ditempel ke body, hidup ±1,1 detik — cek di dalam jendela itu
  await page.waitForTimeout(300);
  const during = await page.evaluate(() => document.body.children.length);
  expect(during).toBeGreaterThan(before);
});

test("entry lama sudah tiada: /scrapbook.html 404", async ({ page }) => {
  const res = await page.request.get("/scrapbook.html");
  expect(res.status()).toBe(404);
});

test("mobile 390px: tanpa scroll horizontal", async ({ page }) => {
  await page.goto("/");
  await page.setViewportSize({ width: 390, height: 844 });
  // Tunggu webfont selesai supaya pengukuran lebar deterministik — tanpa
  // ini, overflow bergantung pada balapan load font (flaky).
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.locator("#start-overlay")).toBeVisible();
  await expect(page.locator("#start-btn")).toBeVisible();
});
