import { expect, type Page, test } from "@playwright/test";

/** BREW（featured）の GlassCard。`div.group` は GlassCard のルートにのみ付く */
const featuredCard = (page: Page) =>
    page.locator("div.group").filter({ hasText: "Coffee Brew Timer" });

/**
 * ナビゲーション挙動:
 * - SiteNav のリンク遷移と active 判定（usePathname 由来の text-indigo-600 / text-slate-600 切り替え）
 *   ※ ホバー用の hover:text-indigo-600 も class 文字列に含まれるため、正規表現は前後の空白まで見る
 * - GlassCard の href によるカード全体クリック遷移（useRouter().push）
 */

test.describe("SiteNav", () => {
    test("works リンクで一覧へ遷移する", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "works", exact: true }).click();
        await expect(page).toHaveURL("/works");
        await expect(page.getByRole("heading", { level: 1, name: "実績一覧" })).toBeVisible();
    });

    test("Home では home が active（text-indigo-600）", async ({ page }) => {
        await page.goto("/");
        await expect(page.getByRole("link", { name: "home", exact: true })).toHaveClass(
            /(?:^|\s)text-indigo-600(?:\s|$)/,
        );
        await expect(page.getByRole("link", { name: "works", exact: true })).toHaveClass(
            /(?:^|\s)text-slate-600(?:\s|$)/,
        );
    });

    test("skills リンクでスキルページへ遷移し active になる", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "skills", exact: true }).click();
        await expect(page).toHaveURL("/skills");
        await expect(page.getByRole("heading", { level: 1, name: "スキル" })).toBeVisible();
        await expect(page.getByRole("link", { name: "skills", exact: true })).toHaveClass(
            /(?:^|\s)text-indigo-600(?:\s|$)/,
        );
    });

    test("about リンクで About ページへ遷移し active になる", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "about", exact: true }).click();
        await expect(page).toHaveURL("/about");
        await expect(page.getByRole("heading", { level: 1, name: "私自身について" })).toBeVisible();
        await expect(page.getByRole("link", { name: "about", exact: true })).toHaveClass(
            /(?:^|\s)text-indigo-600(?:\s|$)/,
        );
    });

    test("Works では works が active（text-indigo-600）", async ({ page }) => {
        await page.goto("/works");
        await expect(page.getByRole("link", { name: "works", exact: true })).toHaveClass(
            /(?:^|\s)text-indigo-600(?:\s|$)/,
        );
        await expect(page.getByRole("link", { name: "home", exact: true })).toHaveClass(
            /(?:^|\s)text-slate-600(?:\s|$)/,
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
        // 「learn more ↗」は複数カードに載りうるため featured カードにスコープする
        // （div.group = GlassCard のルート。他のマークアップには付かない）
        await featuredCard(page).getByText("learn more ↗").click();
        await expect(page).toHaveURL("/works/brew");
    });

    test("導線テキストはカードホバー時のみ表示される", async ({ page }) => {
        await page.goto("/");
        const card = featuredCard(page);
        const cue = card.getByText("learn more ↗");
        await expect(cue).toHaveCSS("opacity", "0");
        await card.hover();
        await expect(cue).toHaveCSS("opacity", "1");
    });

    test("Home のスキルカードから /skills へ遷移する", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("heading", { level: 3, name: "Development" }).click();
        await expect(page).toHaveURL("/skills");
    });

    test("Home の Design カードから /skills の Design カードへスクロールする", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("heading", { level: 3, name: "Design" }).click();
        await expect(page).toHaveURL("/skills");

        const cardTop = () =>
            page.evaluate(() => {
                const card = document.getElementById("design");
                return card ? Math.round(card.getBoundingClientRect().top) : -1;
            });
        const navHeight = await page.evaluate(() => {
            const nav = document.querySelector("nav");
            return nav ? Math.round(nav.getBoundingClientRect().height) : -1;
        });

        // カードの上端が画面上端付近まで寄ったら着地とみなす（縦に長いカードなので、
        // 画面と接しているかだけを見る toBeInViewport では緩すぎる）。完了待ちは poll のリトライ
        await expect.poll(cardTop).toBeLessThan(200);
        // SiteNav に隠れていない ＝ scroll-mt-* が効いている
        expect(await cardTop()).toBeGreaterThan(navHeight);
        expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    });

    test("Design カードで飛んだ後、SiteNav から /skills へ来ても先頭に着地する", async ({
        page,
    }) => {
        await page.goto("/");
        await page.getByRole("heading", { level: 3, name: "Design" }).click();
        await expect(page.locator("#design")).toBeInViewport();

        // 下スクロール後は SiteNav が隠れているので、最上部（80px 以内なら隠さない）まで戻す
        await expect(async () => {
            await page.mouse.wheel(0, -600);
            expect(await page.evaluate(() => window.scrollY)).toBe(0);
        }).toPass();

        await page.getByRole("link", { name: "home", exact: true }).click();
        await expect(page).toHaveURL("/");
        await page.getByRole("link", { name: "skills", exact: true }).click();
        await expect(page).toHaveURL("/skills");

        // スクロールが起きないことの確認なので、少し待ってから見る
        await page.waitForTimeout(1000);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test("Works から home に戻れる", async ({ page }) => {
        await page.goto("/works");
        await page.getByRole("link", { name: "← back to home" }).click();
        await expect(page).toHaveURL("/");
    });

    test("戻りリンクはページ末尾（最後のカードより下）にある", async ({ page }) => {
        await page.goto("/works");
        const lastCard = page.locator("div.group").last();
        await lastCard.scrollIntoViewIfNeeded();
        const cardBox = await lastCard.boundingBox();
        const linkBox = await page.getByRole("link", { name: "← back to home" }).boundingBox();
        expect(linkBox?.y ?? 0).toBeGreaterThan((cardBox?.y ?? 0) + (cardBox?.height ?? 0));
    });

    test("Skills から home に戻れる", async ({ page }) => {
        await page.goto("/skills");
        await page.getByRole("link", { name: "← back to home" }).click();
        await expect(page).toHaveURL("/");
    });

    test("Home の about カードから /about へ遷移する", async ({ page }) => {
        await page.goto("/");
        await page.getByText("その両方の立場で会話できる").click();
        await expect(page).toHaveURL("/about");
    });

    test("About から home に戻れる", async ({ page }) => {
        await page.goto("/about");
        await page.getByRole("link", { name: "← back to home" }).click();
        await expect(page).toHaveURL("/");
    });

    test("BREW から works に戻れる", async ({ page }) => {
        // 画像点数が多く load（全画像の読み込み完了）待ちは不安定なため、DOM の構築完了で先へ進める
        await page.goto("/works/brew", { waitUntil: "domcontentloaded" });
        await page.getByRole("link", { name: "← back to works" }).click();
        await expect(page).toHaveURL("/works");
    });
});

test.describe("Contact 導線", () => {
    test("contact リンクでお問い合わせページへ遷移し active になる", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "contact", exact: true }).click();
        await expect(page).toHaveURL("/contact");
        await expect(page.getByRole("heading", { level: 1, name: "お問い合わせ" })).toBeVisible();
        await expect(page.getByRole("link", { name: "contact", exact: true })).toHaveClass(
            /(?:^|\s)text-indigo-600(?:\s|$)/,
        );
    });

    test("Home の「連絡する」ボタンから /contact へ遷移する", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "連絡する" }).click();
        await expect(page).toHaveURL("/contact");
    });

    test("Home の Contact Form リンクから /contact へ遷移する", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Contact Form" }).click();
        await expect(page).toHaveURL("/contact");
    });

    test("Contact から home に戻れる", async ({ page }) => {
        await page.goto("/contact");
        await page.getByRole("link", { name: "← back to home" }).click();
        await expect(page).toHaveURL("/");
    });
});

/**
 * /api/contact の入口の挙動のみ検証する。
 * 実送信（Turnstile 検証 / Resend）は外部 API 依存のため E2E の対象外で、
 * ここでの2ケースはいずれも Turnstile 検証より手前で返るため外部通信は発生しない。
 */
test.describe("/api/contact", () => {
    test("必須項目が欠けていれば 400 を返す", async ({ request }) => {
        const res = await request.post("/api/contact", {
            data: { name: "", email: "not-an-email", message: "" },
        });
        expect(res.status()).toBe(400);
    });

    test("Honeypot が埋まっていれば 200 を返しつつ送信しない", async ({ request }) => {
        const res = await request.post("/api/contact", {
            data: {
                name: "テスト太郎",
                company: "",
                email: "test@example.com",
                message: "テスト送信です。",
                website: "https://spam.example.com",
                token: "dummy",
            },
        });
        expect(res.status()).toBe(200);
        expect(await res.json()).toEqual({ ok: true });
    });
});

/**
 * Turnstile のウィジェットは `window.turnstile.render()` で作られ、React の管理外に残る。
 * 破棄していないと /contact を出入りするたびに増え、Turnstile が
 * 「Cannot find Widget ... consider using turnstile.remove()」を警告する。
 * （サイトキー未設定の環境ではウィジェットが出ないので、その場合はスキップする）
 */
test("/contact を出入りしても Turnstile のウィジェットが増えない", async ({ page }) => {
    // 「Turnstile を含む出力すべて」だと、サイトキーの許可ホスト名に実行ホストが
    // 入っていないときの Cloudflare 自身のエラーでも落ちる。破棄漏れの警告だけを見る
    const leakWarnings: string[] = [];
    page.on("console", (m) => {
        if (m.text().includes("Cannot find Widget")) {
            leakWarnings.push(m.text());
        }
    });

    const widgets = page.locator('input[name="cf-turnstile-response"]');
    await page.goto("/contact");
    await page.waitForTimeout(2500);
    test.skip((await widgets.count()) === 0, "NEXT_PUBLIC_TURNSTILE_SITE_KEY が未設定");

    for (let i = 0; i < 3; i += 1) {
        await page.getByRole("link", { name: "about" }).click();
        await page.waitForURL("**/about");
        await page.getByRole("link", { name: "contact" }).click();
        await page.waitForURL("**/contact");
        await page.waitForTimeout(2500);
        // 破棄されていれば毎回1つに戻る（漏れていると増える／描き直せず 0 になる）
        await expect(widgets).toHaveCount(1);
    }
    expect(leakWarnings).toEqual([]);
});
