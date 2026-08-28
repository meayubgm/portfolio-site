import { expect, type Page, test } from "@playwright/test";

/** BREW（featured）の GlassCard。`div.group` は GlassCard のルートにのみ付く */
const featuredCard = (page: Page) =>
    page.locator("div.group").filter({ hasText: "Coffee Brew Timer" });

const scrollTo = (page: Page, y: number) => page.evaluate((to) => window.scrollTo(0, to), y);

/**
 * ナビを隠すまで下スクロールをやり直す。
 *
 * 出し入れは hydration 後に付くスクロールリスナーが行うため、goto 直後に1回スクロールする
 * だけだと、リスナーが付く前にスクロールが終わってしまうことがある（その後は scroll が
 * 飛ばないので、あとから補正もされない）。反応するまで上下を繰り返して待つ。
 */
const scrollUntilHidden = async (page: Page) => {
    await expect(async () => {
        await scrollTo(page, 0);
        await scrollTo(page, 1200);
        await expect(page.locator("nav")).toHaveClass(/-translate-y-full/, { timeout: 500 });
    }).toPass({ timeout: 10_000 });
};

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

        await scrollUntilHidden(page);

        await scrollTo(page, 600);
        await expect(nav).not.toHaveClass(/-translate-y-full/);
    });

    test("最上部付近では引っ込まない", async ({ page }) => {
        await page.goto("/");
        await scrollTo(page, 40);
        await expect(page.locator("nav")).not.toHaveClass(/-translate-y-full/);
    });
});

test.describe("SiteNav のホバー", () => {
    test("リンクのホバーで先頭に「+」が現れる", async ({ page }) => {
        await page.goto("/");
        const link = page.getByRole("link", { name: "works", exact: true });
        const cue = link.locator("span[aria-hidden='true']");
        await expect(cue).toHaveCSS("opacity", "0");
        await link.hover();
        await expect(cue).toHaveCSS("opacity", "1");
    });

    test("「+」はアクセシブルネームに混ざらない", async ({ page }) => {
        await page.goto("/");
        // ロール・名前に依存せず（＝ aria-hidden が外れても引ける形で）ホバーしてから名前を見る。
        // getByRole(name, exact) でホバーすると、退行時は 0 件解決のタイムアウトとして出てしまう
        await page.locator("nav a", { hasText: "works" }).hover();
        // aria-hidden が外れると名前が「+ works」になる
        await expect(page.getByRole("link", { name: "works", exact: true })).toHaveCount(1);
        await expect(page.getByRole("link", { name: "+ works" })).toHaveCount(0);
    });
});

test.describe("戻りリンク", () => {
    test("ホバーで末尾に「+」が現れる", async ({ page }) => {
        await page.goto("/works");
        const link = page.getByRole("link", { name: "← back to home" });
        const cue = link.locator("span[aria-hidden='true']");
        await link.scrollIntoViewIfNeeded();
        await expect(cue).toHaveCSS("opacity", "0");
        await link.hover();
        await expect(cue).toHaveCSS("opacity", "1");
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

    test("SSG の HTML に完成テキストが二重に入らない", async ({ page }) => {
        // 打ち込み中の層は未入力ぶんを visibility:hidden で持つが、1文字も打つ前
        // （＝静的 HTML）は空にしてある。持たせたままだと h1 のテキストが2回入る
        const html = await (await page.request.get("/")).text();
        const h1 = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/)?.[0] ?? "";

        expect(h1).toContain("意図を");
        expect(h1.match(/かたちに/g)?.length).toBe(1);
    });
});
