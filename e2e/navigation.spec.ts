import { expect, type Page, test } from "@playwright/test";

/** BREW（featured）の GlassCard。`div.group` は GlassCard のルートにのみ付く */
const featuredCard = (page: Page) =>
    page.locator("div.group").filter({ hasText: "Coffee Brew Timer" });

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

    test("skill リンクでスキルページへ遷移し active になる", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "skill", exact: true }).click();
        await expect(page).toHaveURL("/skill");
        await expect(page.getByRole("heading", { level: 1, name: "スキル" })).toBeVisible();
        await expect(page.getByRole("link", { name: "skill", exact: true })).toHaveClass(
            /text-slate-900/,
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
        // 「詳細を見る ↗」は複数カードに載りうるため featured カードにスコープする
        // （div.group = GlassCard のルート。他のマークアップには付かない）
        await featuredCard(page).getByText("詳細を見る ↗").click();
        await expect(page).toHaveURL("/works/brew");
    });

    test("導線テキストはカードホバー時のみ表示される", async ({ page }) => {
        await page.goto("/");
        const card = featuredCard(page);
        const cue = card.getByText("詳細を見る ↗");
        await expect(cue).toHaveCSS("opacity", "0");
        await card.hover();
        await expect(cue).toHaveCSS("opacity", "1");
    });

    test("Home のスキルカードから /skill へ遷移する", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("heading", { level: 3, name: "Development" }).click();
        await expect(page).toHaveURL("/skill");
    });

    test("BREW から works に戻れる", async ({ page }) => {
        await page.goto("/works/brew");
        await page.getByRole("link", { name: "← works に戻る" }).click();
        await expect(page).toHaveURL("/works");
    });
});
