import { expect, test } from "@playwright/test";

/**
 * スモークテスト: 3ルートが正常に表示され、想定の主要見出し / <title> を持つこと。
 * SSG のため、レスポンス 200 と主要コンテンツの存在を最小限で確認する。
 */

test("Home（/）が表示される", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);

  await expect(page).toHaveTitle("A.Y / frontend — ポートフォリオ");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("デザインと実装");
  // 主要 CTA
  await expect(page.getByRole("link", { name: "Work を見る" })).toBeVisible();
});

test("Works 一覧（/works）が表示される", async ({ page }) => {
  const res = await page.goto("/works");
  expect(res?.status()).toBe(200);

  await expect(page).toHaveTitle("実績一覧 — A.Y / frontend");
  await expect(page.getByRole("heading", { level: 1, name: "実績一覧" })).toBeVisible();
});

test("BREW ケーススタディ（/works/brew）が表示される", async ({ page }) => {
  const res = await page.goto("/works/brew");
  expect(res?.status()).toBe(200);

  await expect(page).toHaveTitle("BREW — コーヒー抽出タイマー | A.Y / frontend");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("BREW（仮）");
});
