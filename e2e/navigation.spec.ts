import { expect, test } from "@playwright/test";

/**
 * ナビゲーション挙動:
 * - SiteNav のリンク遷移と active 判定（usePathname 由来の text-slate-900 / text-slate-600 切り替え）
 * - GlassCard の href によるカード全体クリック遷移（useRouter().push）
 */

test.describe("SiteNav", () => {
  test("works リンクで一覧へ遷移する", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "works", exact: true }).click();
    await expect(page).toHaveURL("/works");
    await expect(page.getByRole("heading", { level: 1, name: "実績一覧" })).toBeVisible();
  });

  test("Home では home が active（text-slate-900）", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "home", exact: true })).toHaveClass(
      /text-slate-900/,
    );
    await expect(page.getByRole("link", { name: "works", exact: true })).toHaveClass(
      /text-slate-600/,
    );
  });

  test("Works では works が active（text-slate-900）", async ({ page }) => {
    await page.goto("/works");
    await expect(page.getByRole("link", { name: "works", exact: true })).toHaveClass(
      /text-slate-900/,
    );
    await expect(page.getByRole("link", { name: "home", exact: true })).toHaveClass(
      /text-slate-600/,
    );
  });
});

test.describe("GlassCard カード全体クリック遷移", () => {
  test("Home の featured カードから BREW へ遷移する", async ({ page }) => {
    await page.goto("/");
    await page.getByText("コーヒー抽出タイマー").click();
    await expect(page).toHaveURL("/works/brew");
  });

  test("Works の featured カードから BREW へ遷移する", async ({ page }) => {
    await page.goto("/works");
    await page.getByText("ケーススタディを読む").click();
    await expect(page).toHaveURL("/works/brew");
  });

  test("BREW から works に戻れる", async ({ page }) => {
    await page.goto("/works/brew");
    await page.getByRole("link", { name: "← works に戻る" }).click();
    await expect(page).toHaveURL("/works");
  });
});
