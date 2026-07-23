import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E 設定。
 *
 * 実行はホスト（macOS）。開発コンテナ（node:24-alpine）は Playwright のブラウザ
 * バイナリ非対応のため、ブラウザはホスト側に導入する（`npx playwright install`）。
 *
 * webServer は `reuseExistingServer: true`。ローカルで `make up`（Docker）が :3000 を
 * 占有していればそれを再利用し、ホストで next を起動しない。CI（Linux）や Docker 未起動時は
 * build + start でフォールバック起動する。
 */
const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: [["html", { open: "never" }], ["list"]],
    use: {
        baseURL,
        trace: "on-first-retry",
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "webkit", use: { ...devices["Desktop Safari"] } },
    ],
    webServer: {
        command: "npm run build && npm run start",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
    },
});
