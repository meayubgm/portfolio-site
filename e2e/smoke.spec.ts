import { expect, test } from "@playwright/test";

/**
 * スモークテスト: 3ルートが正常に表示され、想定の主要見出し / <title> を持つこと。
 * SSG のため、レスポンス 200 と主要コンテンツの存在を最小限で確認する。
 */

test("Home（/）が表示される", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);

    await expect(page).toHaveTitle("Megumi Ayuha — ポートフォリオ");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
        "意図を汲みとって、かたちにする",
    );
    // 主要 CTA
    await expect(page.getByRole("link", { name: "Works を見る" })).toBeVisible();
});

test("Works 一覧（/works）が表示される", async ({ page }) => {
    const res = await page.goto("/works");
    expect(res?.status()).toBe(200);

    await expect(page).toHaveTitle("実績一覧 — Megumi Ayuha");
    await expect(page.getByRole("heading", { level: 1, name: "実績一覧" })).toBeVisible();
});

test("スキル（/skill）が表示される", async ({ page }) => {
    const res = await page.goto("/skill");
    expect(res?.status()).toBe(200);

    await expect(page).toHaveTitle("スキル — Megumi Ayuha");
    await expect(page.getByRole("heading", { level: 1, name: "スキル" })).toBeVisible();
    // Development / Design の2グループが並ぶ
    await expect(page.getByRole("heading", { level: 2, name: "Development" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Design" })).toBeVisible();
});

test("BREW ケーススタディ（/works/brew）が表示される", async ({ page }) => {
    const res = await page.goto("/works/brew");
    expect(res?.status()).toBe(200);

    await expect(page).toHaveTitle("Coffee Brew Timer — コーヒー抽出タイマー | Megumi Ayuha");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Coffee Brew Timer");
});
