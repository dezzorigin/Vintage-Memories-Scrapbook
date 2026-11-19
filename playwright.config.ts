import { defineConfig, devices } from "@playwright/test";

// Landing + scrapbook vintage-memories-scrapbook adalah situs statis:
// yang diuji adalah konten + interaksi halamannya (galeri, menu mobile,
// overlay pembuka scrapbook, navigasi 5 lembar).
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: { baseURL: "http://127.0.0.1:8520" },
  webServer: {
    command: "python3 -m http.server 8520 --bind 127.0.0.1",
    url: "http://127.0.0.1:8520/",
    reuseExistingServer: true,
    timeout: 15_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
});
