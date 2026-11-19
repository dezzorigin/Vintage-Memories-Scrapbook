import { test, expect } from "@playwright/test";

// Landing adalah etalase: hero, galeri 5 foto asli, indeks fitur, cara
// pakai — semuanya mengantar ke scrapbook.html (produk: 5 lembar interaktif).

test("landing tampil: judul, galeri 5 foto, fakta repo, link GitHub", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Vintage Memories Scrapbook/i);
  await expect(page.locator("text=Kado ulang tahun yang dibuka lembar demi lembar.").first()).toBeVisible();
  await expect(page.locator(".gallery .stamp-card")).toHaveCount(5);
  await expect(page.locator("text=Isi album").first()).toBeVisible();
  await expect(page.locator(".hero-facts")).toContainText("lembar");
  await expect(page.locator(".hero-facts dd").first()).toHaveText("5");
  await expect(page.locator(".hero-facts")).toContainText("lagu latar");
  // logo GitHub kanan atas mengarah ke repo
  await expect(page.locator('.github-link[href="https://github.com/dezzorigin/vintage-memories-scrapbook"]').first()).toBeVisible();
  // CTA hero mengarah ke scrapbook (bukan CTA navbar — yang itu memang
  // disembunyikan di mobile lewat .nav-right .btn-sm)
  await expect(page.locator('.hero-actions a.btn[href="scrapbook.html"]').first()).toBeVisible();
  // indeks fitur + cara pakai
  await expect(page.locator(".index-list li")).toHaveCount(6);
  await expect(page.locator(".steps li")).toHaveCount(3);
});

test("menu mobile: toggle membuka, klik link menutup", async ({ page }) => {
  await page.goto("/");
  await page.setViewportSize({ width: 390, height: 844 });
  const toggle = page.locator("#nav-toggle");
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.locator("#nav-mobile")).toHaveClass(/open/);
  await page.locator("#nav-mobile a[href='#isi-album']").click();
  await expect(page.locator("#nav-mobile")).not.toHaveClass(/open/);
});

test("scrapbook tampil: overlay pembuka + 5 slide + navigasi", async ({ page }) => {
  await page.goto("/scrapbook.html");
  await expect(page).toHaveTitle(/Selamat Ulang Tahun/);
  await expect(page.locator("#start-overlay")).toBeVisible();
  await expect(page.locator("#start-btn")).toContainText("Buka Kado Cinta");
  await expect(page.locator("#current-slide-num")).toHaveText("1");
  for (let n = 1; n <= 5; n++) {
    await expect(page.locator(`#slide-${n}`)).toHaveCount(1);
  }
  await expect(page.locator("#prev-btn")).toBeDisabled();
  // link kembali ke landing
  await expect(page.locator('a[href="index.html"]')).toContainText("Landing");
});

test("scrapbook: buka kado lalu lanjut ke lembar 2", async ({ page }) => {
  await page.goto("/scrapbook.html");
  await page.locator("#start-btn").click();
  // overlay bergeser lalu dihapus dari DOM (±1,1 detik)
  await expect(page.locator("#start-overlay")).toHaveCount(0, { timeout: 10_000 });
  await page.locator("#next-btn").click();
  // gerbang bunga: tutup 750 ms + buka 1150 ms + blokir 1850 ms
  await expect(page.locator("#current-slide-num")).toHaveText("2", { timeout: 10_000 });
  await expect(page.locator("#slide-2")).toHaveClass(/active-slide/);
  await expect(page.locator("#prev-btn")).toBeEnabled();
});

test("mobile 390px: tanpa scroll horizontal", async ({ page }) => {
  await page.goto("/");
  // Tunggu webfont selesai supaya pengukuran lebar deterministik — tanpa
  // ini, overflow bergantung pada balapan load font (flaky).
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator(".gallery .stamp-card").first()).toBeVisible();
});
