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

    test("/works の StatBlock 3連が内容幅のまま折り返し、各行が左端に揃う", async ({ page }) => {
        await page.goto("/works");
        const stats = page.locator("section.grid div.group").first().locator("div.flex-wrap > div");
        await expect(stats).toHaveCount(3);

        const boxes = await stats.evaluateAll((els) =>
            els.map((el) => {
                const rect = el.getBoundingClientRect();
                return {
                    x: Math.round(rect.x),
                    y: Math.round(rect.y),
                    width: Math.round(rect.width),
                };
            }),
        );

        // 等幅セルに引き伸ばされていない（内容幅なので3つの幅は揃わない）
        expect(new Set(boxes.map((b) => b.width)).size).toBeGreaterThan(1);
        // 折り返しは起きている（1行に3つとも並ばない幅）
        expect(new Set(boxes.map((b) => b.y)).size).toBeGreaterThan(1);
        // どの行も先頭は左端に揃う
        const rowHeads = new Map<number, number>();
        for (const box of boxes) {
            const head = rowHeads.get(box.y);
            if (head === undefined || box.x < head) {
                rowHeads.set(box.y, box.x);
            }
        }
        for (const x of rowHeads.values()) {
            expect(x).toBeCloseTo(boxes[0].x, 0);
        }
    });

    test("/works のその他カードは期間が上・案件名が下の縦並びになる", async ({ page }) => {
        await page.goto("/works");
        const row = page
            .locator("section.grid div.group")
            .last()
            .locator("div.flex-col-reverse")
            .first();
        const name = await row.locator("span").nth(0).boundingBox();
        const period = await row.locator("span").nth(1).boundingBox();

        expect(period?.x).toBeCloseTo(name?.x ?? -1, 0);
        expect((period?.y ?? 0) + (period?.height ?? 0)).toBeLessThanOrEqual((name?.y ?? 0) + 1);
    });
});

test.describe("文節改行（BudouX）", () => {
    /**
     * wbr で区切られた各文節が行をまたいでいないかを調べる。
     * 文節ごとに Range を作り、クライアント矩形が1つ ＝ 1行に収まっている。
     */
    const inspect = (target: ReturnType<Page["locator"]>) =>
        target.evaluate((el) => {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            const rectCounts: number[] = [];
            let node = walker.nextNode();
            while (node) {
                const range = document.createRange();
                range.selectNodeContents(node);
                rectCounts.push(range.getClientRects().length);
                node = walker.nextNode();
            }
            return {
                wbr: el.querySelectorAll("wbr").length,
                rectCounts,
                wordBreak: getComputedStyle(el).wordBreak,
            };
        });

    test("/works の見出しとリード文が文節の途中で折り返さない", async ({ page }) => {
        await page.goto("/works");

        const lead = page.locator("header span.break-keep").last();
        const { wbr, rectCounts, wordBreak } = await inspect(lead);

        expect(wordBreak).toBe("keep-all");
        // リード文は複数行に折り返す長さがあり、文節境界が入っている
        expect(wbr).toBeGreaterThan(3);
        expect(rectCounts.length).toBe(wbr + 1);
        expect(new Set(rectCounts)).toEqual(new Set([1]));
    });

    test("NO_BREAK_WORDS に登録した語は途中で切られない", async ({ page }) => {
        await page.goto("/works");
        // BudouX の既定は「水産卸 / 会社向け倉庫管理システム開発」。lib/phrase.ts で直している
        const title = page.locator("h3", { hasText: "水産卸" }).locator("span.break-keep");
        await expect(title).toHaveText("水産卸会社向け倉庫管理システム開発");
        expect(await title.innerHTML()).toBe("水産卸会社向け<wbr>倉庫管理システム開発");
    });

    test("Home の h1 が文節の途中で折り返さない", async ({ page }) => {
        await page.goto("/");

        // 打ち終わると重ねが解けて span が1つになる
        const title = page.locator("h1 span.break-keep");
        await expect(title).toHaveCount(1, { timeout: 15_000 });

        const { wbr, rectCounts } = await inspect(title);
        expect(wbr).toBeGreaterThan(0);
        expect(new Set(rectCounts)).toEqual(new Set([1]));
    });
});

test.describe("Home ヒーローの打ち込み（sm 未満）", () => {
    test("打ち込み中も折り返しが完成形と一致する", async ({ page }) => {
        // 打ち込み中の層は未入力ぶんの場所も確保しているので、そこまでに打った文字の
        // 行の並びは完成テキストの層と常に一致する（＝行末の文節が伸びて次の行へ飛ばない）。
        // 打ち込みは goto 直後に始まるので waitUntil: "commit" で先回りする
        await page.goto("/", { waitUntil: "commit" });

        const result = await page.evaluate(async () => {
            /** 先頭から index 文字目の位置（テキストノードとオフセット） */
            const pointAt = (root: Element, index: number): [Node, number] | null => {
                const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
                let seen = 0;
                let node = walker.nextNode();
                while (node) {
                    const length = node.textContent?.length ?? 0;
                    if (index <= seen + length) {
                        return [node, index - seen];
                    }
                    seen += length;
                    node = walker.nextNode();
                }
                return null;
            };

            /** 先頭から len 文字までが占める各行の上端 */
            const lineTops = (root: Element, len: number) => {
                const start = pointAt(root, 0);
                const end = pointAt(root, len);
                if (!start || !end) {
                    return null;
                }
                const range = document.createRange();
                range.setStart(start[0], start[1]);
                range.setEnd(end[0], end[1]);
                return [...range.getClientRects()].map((rect) => Math.round(rect.top));
            };

            const mismatches: string[] = [];
            let samples = 0;
            const started = performance.now();
            while (performance.now() - started < 5000) {
                for (const layered of document.querySelectorAll("header span.grid")) {
                    const done = layered.querySelector("[data-typewriter-target]");
                    const typing = layered.querySelector("[aria-hidden]");
                    // CSS 到着前は grid にならず2層が縦に並ぶので、その間は測らない
                    if (!done || !typing || getComputedStyle(layered).display !== "grid") {
                        continue;
                    }
                    const pending = [...typing.querySelectorAll(".invisible")].reduce(
                        (total, el) => total + (el.textContent?.length ?? 0),
                        0,
                    );
                    const visible = (typing.textContent?.length ?? 0) - pending;
                    if (visible < 1) {
                        continue;
                    }
                    samples += 1;
                    // cn() が break-keep を落としていないか（tailwind-merge の衝突グループ）
                    if (getComputedStyle(typing).wordBreak !== "keep-all") {
                        mismatches.push(`word-break: ${getComputedStyle(typing).wordBreak}`);
                    }
                    const typingTops = lineTops(typing, visible);
                    const doneTops = lineTops(done, visible);
                    if (JSON.stringify(typingTops) !== JSON.stringify(doneTops)) {
                        mismatches.push(typing.textContent?.slice(0, visible).slice(-14) ?? "");
                    }
                }
                await new Promise((resolve) => setTimeout(resolve, 15));
            }
            return { samples, mismatches: mismatches.slice(0, 3) };
        });

        expect(result.samples).toBeGreaterThan(0);
        expect(result.mismatches).toEqual([]);
    });
});
