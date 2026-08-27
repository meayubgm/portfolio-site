import { expect, type Page, test } from "@playwright/test";

/**
 * レスポンシブ（モバイルビューポート専用）:
 * - sm(640px) 未満で SiteNav がハンバーガーメニューに切り替わること
 * - メニューパネルの開閉（grid-template-rows 0fr ⇄ 1fr の伸縮 + visibility）
 * - sm 未満ではスクロールしてもナビが引っ込まないこと
 * - lg(1024px) 未満でカードが 1 カラムに畳まれ、横スクロールが出ないこと
 *
 * playwright.config.ts の mobile-chrome / mobile-safari プロジェクトだけがこの spec を走らせる。
 */

const ROUTES = ["/", "/works", "/works/brew", "/skills", "/about", "/contact"] as const;

const menu = (page: Page) => page.locator("#site-menu");
const menuButton = (page: Page) => page.getByRole("button", { name: "メニューを開く" });
const closeButton = (page: Page) => page.getByRole("button", { name: "メニューを閉じる" });

test.describe("SiteNav（sm 未満）", () => {
    test("リンク列は畳まれ、ハンバーガーボタンが出る", async ({ page }) => {
        await page.goto("/");
        await expect(menuButton(page)).toBeVisible();
        // 横並びのリンク列（nav 直下）は display:none
        await expect(page.locator("nav").getByRole("link", { name: "works" })).toBeHidden();
        // ロゴは左上に残る
        await expect(page.locator("nav").getByRole("link").first()).toBeVisible();
    });

    test("初期状態ではメニューパネルが伏せられている", async ({ page }) => {
        await page.goto("/");
        await expect(menu(page)).toBeHidden();
        expect((await menu(page).boundingBox())?.height ?? -1).toBe(0);
    });

    test("ボタンでパネルが伸び、もう一度押すと畳まれる", async ({ page }) => {
        await page.goto("/");
        await menuButton(page).click();

        await expect(menu(page)).toBeVisible();
        // 0fr → 1fr へ伸びきったこと（中身の高さを持っていること）
        expect((await menu(page).boundingBox())?.height ?? 0).toBeGreaterThan(0);

        // パネル内に home 〜 contact の5リンクが2列で並ぶ
        await expect(menu(page).getByRole("link")).toHaveCount(6); // ロゴ + 5リンク
        for (const label of ["home", "works", "skills", "about", "contact"]) {
            await expect(menu(page).getByRole("link", { name: label, exact: true })).toBeVisible();
        }

        await closeButton(page).click();
        await expect(menu(page)).toBeHidden();
    });

    test("パネルの現在地には先頭に「+」が付く（名前には混ざらない）", async ({ page }) => {
        await page.goto("/works");
        await menuButton(page).click();
        await expect(menu(page)).toBeVisible();

        const active = menu(page).locator("a", { hasText: "works" });
        await expect(active).toHaveText("+works");
        // aria-hidden なのでアクセシブルネームは「works」のまま
        await expect(menu(page).getByRole("link", { name: "works", exact: true })).toHaveCount(1);
        await expect(menu(page).getByRole("link", { name: "+works" })).toHaveCount(0);

        // 現在地以外には出ない
        await expect(menu(page).locator("a", { hasText: "about" })).toHaveText("about");
    });

    test("メニューから遷移するとパネルが閉じる", async ({ page }) => {
        await page.goto("/");
        await menuButton(page).click();
        await expect(menu(page)).toBeVisible();

        await menu(page).getByRole("link", { name: "works", exact: true }).click();
        await expect(page).toHaveURL("/works");
        await expect(menu(page)).toBeHidden();
    });

    test("現在地のリンクをタップしてもパネルが閉じる", async ({ page }) => {
        // pathname が変わらないので、閉じるのは useEffect ではなくリンクの onClick 側
        await page.goto("/works");
        await menuButton(page).click();
        await expect(menu(page)).toBeVisible();

        await menu(page).getByRole("link", { name: "works", exact: true }).click();
        await expect(page).toHaveURL("/works");
        await expect(menu(page)).toBeHidden();
    });

    test("下スクロールしてもナビは引っ込まない", async ({ page }) => {
        await page.goto("/works");
        const nav = page.locator("nav");
        await expect(nav).not.toHaveClass(/-translate-y-full/);

        await page.evaluate(() => window.scrollTo(0, 1200));
        await page.waitForTimeout(500);

        // sm 未満では -translate-y-full が当たらない（クラスは sm: 付きで出るだけ）
        await expect(nav).toBeVisible();
        expect((await nav.boundingBox())?.y ?? -1).toBe(0);
    });
});

test.describe("レイアウト（lg 未満）", () => {
    for (const path of ROUTES) {
        test(`${path} に横スクロールが出ない`, async ({ page }) => {
            await page.goto(path, { waitUntil: "domcontentloaded" });
            const overflow = await page.evaluate(() => {
                const d = document.documentElement;
                return d.scrollWidth - d.clientWidth;
            });
            expect(overflow).toBe(0);
        });
    }

    test("Works のカードが 1 カラムに畳まれる", async ({ page }) => {
        await page.goto("/works");
        // CardGrid（section.grid）にスコープする。div.group = GlassCard のルートだが、
        // #site-menu のパネルも同じクラスを持つのでグリッド配下だけを見る
        const grid = page.locator("section.grid").first();
        const gridBox = await grid.boundingBox();
        const first = await grid.locator("div.group").first().boundingBox();
        const second = await grid.locator("div.group").nth(1).boundingBox();

        // 左端が揃い、グリッド幅いっぱいで、縦に積まれている ＝ 1 カラム
        expect(first?.x).toBeCloseTo(second?.x ?? -1, 0);
        expect(first?.width).toBeCloseTo(gridBox?.width ?? -1, 0);
        expect(second?.y ?? 0).toBeGreaterThan((first?.y ?? 0) + (first?.height ?? 0) - 1);
    });
});

test.describe("Home ヒーロー（sm 未満）", () => {
    test("ヒーローが1画面に収まり、ボタン列が折り返さない", async ({ page }) => {
        await page.goto("/");

        const viewportHeight = await page.evaluate(() => window.innerHeight);
        const header = await page.locator("header").first().boundingBox();
        expect(header?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(viewportHeight);

        // 打ち終わりを待ってからボタン列を測る（RiseIn は heroActionsDelay ≒ 4.3 秒後に始まり、
        // そこから 500ms かけて opacity 0→1 / translate 16px→0 と動く）。
        // toBeVisible() は opacity:0 を「見えている」と判定するので待機条件にならない。
        // 伏せたまま測ると 16px 下の座標を拾ってしまい、遷移の途中だと2つの y も食い違う。
        const actions = page.locator("header [data-rise-in]");
        await expect(actions).toHaveCSS("opacity", "1", { timeout: 15_000 });
        await expect(actions).toHaveCSS("translate", "none");

        const works = page.getByRole("link", { name: "Works を見る" });
        const contact = page.getByRole("link", { name: "連絡する" });

        const worksBox = await works.boundingBox();
        const contactBox = await contact.boundingBox();

        // 同じ行に並ぶ ＝ 折り返していない
        expect(worksBox?.y).toBeCloseTo(contactBox?.y ?? -1, 0);
        // 下端も画面内に収まる
        expect((contactBox?.y ?? 0) + (contactBox?.height ?? 0)).toBeLessThanOrEqual(
            viewportHeight,
        );
    });
});

test.describe("横並びの解除（sm 未満）", () => {
    test("/about の来歴は期間ラベルが本文の上に積まれる", async ({ page }) => {
        await page.goto("/about");
        // 最後の CardGrid（// story）の1行目
        const row = page.locator("section.grid").last().locator("div.group > div > div").first();
        const period = await row.locator("p").first().boundingBox();
        const body = await row.locator("p").nth(1).boundingBox();

        expect(period?.x).toBeCloseTo(body?.x ?? -1, 0);
        expect((period?.y ?? 0) + (period?.height ?? 0)).toBeLessThanOrEqual((body?.y ?? 0) + 1);
    });

    test("/works の StatBlock 3連が縦に積まれる", async ({ page }) => {
        await page.goto("/works");
        const stats = page.locator("section.grid div.group").first().locator("div.grid > div");
        await expect(stats).toHaveCount(3);

        const first = await stats.nth(0).boundingBox();
        const second = await stats.nth(1).boundingBox();

        expect(first?.x).toBeCloseTo(second?.x ?? -1, 0);
        expect(second?.y ?? 0).toBeGreaterThan((first?.y ?? 0) + (first?.height ?? 0) - 1);
    });
});
