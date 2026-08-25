import { expect, type Page, test } from "@playwright/test";

/** BREW（featured）の GlassCard。`div.group` は GlassCard のルートにのみ付く */
const featuredCard = (page: Page) =>
    page.locator("div.group").filter({ hasText: "Coffee Brew Timer" });

const scrollTo = (page: Page, y: number) => page.evaluate((to) => window.scrollTo(0, to), y);

/**
 * モーション:
 * - SiteNav のスクロール方向による出し入れ（-translate-y-full のトグル）
 * - Home のカードの scroll reveal（一度表示したら戻さない）
 * - ヒーローのタイピング演出が完成テキストに到達すること
 * - タイピングの後にボタン列が浮き上がること
 */

test.describe("SiteNav の出し入れ", () => {
    test("下スクロールで引っ込み、上スクロールで戻る", async ({ page }) => {
        await page.goto("/");
        const nav = page.locator("nav");
        await expect(nav).not.toHaveClass(/-translate-y-full/);

        await scrollTo(page, 1200);
        await expect(nav).toHaveClass(/-translate-y-full/);

        await scrollTo(page, 600);
        await expect(nav).not.toHaveClass(/-translate-y-full/);
    });

    test("最上部付近では引っ込まない", async ({ page }) => {
        await page.goto("/");
        await scrollTo(page, 40);
        await expect(page.locator("nav")).not.toHaveClass(/-translate-y-full/);
    });
});

test.describe("Home のカード", () => {
    test("スクロールで浮き上がり、戻しても表示されたまま", async ({ page }) => {
        await page.goto("/");
        const card = featuredCard(page);
        await expect(card).toHaveCSS("opacity", "0");

        await card.scrollIntoViewIfNeeded();
        await expect(card).toHaveCSS("opacity", "1");

        await scrollTo(page, 0);
        await expect(card).toHaveCSS("opacity", "1");
    });
});

test.describe("ヒーローのボタン列", () => {
    test("タイピングの後に浮き上がって表示される", async ({ page }) => {
        await page.goto("/");
        // data-rise-in はカードにも付くので、ヒーロー（header 内）に絞る
        const actions = page.locator("header [data-rise-in]");
        // 打ち終わるまでは伏せてある
        await expect(actions).toHaveCSS("opacity", "0");
        // 浮き上がり終わるとトランジションのクラスも外れる
        await expect(actions).toHaveCSS("opacity", "1", { timeout: 15_000 });
        await expect(actions).toHaveCSS("transition-duration", "0s");
        await expect(page.getByRole("link", { name: "Works を見る" })).toBeVisible();
    });
});

test.describe("ヒーローのタイピング", () => {
    test("打ち終わると h1 の完成テキストが可視になる", async ({ page }) => {
        await page.goto("/");
        const heading = page.getByRole("heading", { level: 1 });
        await expect(heading).toContainText("意図を汲みとって、かたちにする");
        // 打ち込み中は完成テキストを opacity-0 で重ねている。打ち終わると素の1枚に戻る
        await expect(page.locator("[data-typewriter-target]")).toHaveCount(0, {
            timeout: 15_000,
        });
        await expect(heading).toHaveCSS("opacity", "1");
    });
});
