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
        // 遷移が詰まったときにテスト全体のタイムアウトではなく goto で失敗させ、原因を切り分けやすくする
        navigationTimeout: 15_000,
    },
    projects: [
        // responsive.spec.ts はモバイル専用。デスクトップの2プロジェクトからは外す
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
            testIgnore: /responsive\.spec\.ts/,
        },
        {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
            testIgnore: /responsive\.spec\.ts/,
        },
        // モバイルは responsive.spec.ts だけを走らせる。既存 spec はデスクトップ幅の
        // 期待値（6 カラムグリッド・横並びナビ）で書かれているため対象にしない
        {
            name: "mobile-chrome",
            use: { ...devices["Pixel 5"] },
            testMatch: /responsive\.spec\.ts/,
        },
        {
            name: "mobile-safari",
            use: { ...devices["iPhone 13"] },
            testMatch: /responsive\.spec\.ts/,
        },
    ],
    webServer: {
        command: "npm run build && npm run start",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
    },
});
