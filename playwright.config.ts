import { defineConfig, devices } from "@playwright/test";

// Root vintage-memories-scrapbook ADALAH produknya: scrapbook interaktif
// 5 lembar di "/" (overlay pembuka, navigasi + gerbang bunga, amplop
// segel lilin, tombol hati). Situs statis: yang diuji adalah konten +
// interaksi halamannya.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  // Di CI, reporter github menulis anotasi kegagalan ke check-run — bisa
  // dibaca via API tanpa mengunduh log (log CI tidak bisa diunduh dari VM).
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:8520" },
  webServer: {
    command: "python3 -m http.server 8520 --bind 127.0.0.1",
    url: "http://127.0.0.1:8520/",
    reuseExistingServer: true,
    timeout: 15_000,
  },
  projects: [
    { name: "desktop", testIgnore: /demo\.spec\.ts/, use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile", testIgnore: /demo\.spec\.ts/, use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
    // Tur demo README (gate merge): satu tes, video direkam. Screenshot
    // PNG-nya ditulis spek ke demo/, video webm dirakit CI jadi mp4.
    // size eksplisit 1280×800: tanpa ini Playwright merekam 800×500
    // (run 14) — video demo harus HD.
    { name: "demo", testMatch: /demo\.spec\.ts/, use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 }, video: { mode: "on", size: { width: 1280, height: 800 } } } },
  ],
});
