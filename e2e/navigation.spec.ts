import { expect, type Page, test } from "@playwright/test";

/** BREW（featured）の GlassCard。`div.group` は GlassCard のルートにのみ付く */
const featuredCard = (page: Page) =>
    page.locator("div.group").filter({ hasText: "Coffee Brew Timer" });

/**
 * ナビゲーション挙動:
 * - SiteNav のリンク遷移と active 判定（usePathname 由来の text-indigo-600 / text-slate-600 切り替え）
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
            /text-indigo-600/,
        );
        await expect(page.getByRole("link", { name: "works", exact: true })).toHaveClass(
            /text-slate-600/,
        );
    });

    test("skills リンクでスキルページへ遷移し active になる", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "skills", exact: true }).click();
        await expect(page).toHaveURL("/skills");
        await expect(page.getByRole("heading", { level: 1, name: "スキル" })).toBeVisible();
        await expect(page.getByRole("link", { name: "skills", exact: true })).toHaveClass(
            /text-indigo-600/,
        );
    });

    test("about リンクで About ページへ遷移し active になる", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "about", exact: true }).click();
        await expect(page).toHaveURL("/about");
        await expect(page.getByRole("heading", { level: 1, name: "私自身について" })).toBeVisible();
        await expect(page.getByRole("link", { name: "about", exact: true })).toHaveClass(
            /text-indigo-600/,
        );
    });

    test("Works では works が active（text-indigo-600）", async ({ page }) => {
        await page.goto("/works");
        await expect(page.getByRole("link", { name: "works", exact: true })).toHaveClass(
            /text-indigo-600/,
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

    test("Works から home に戻れる", async ({ page }) => {
        await page.goto("/works");
        await page.getByRole("link", { name: "← home に戻る" }).click();
        await expect(page).toHaveURL("/");
    });

    test("Skills から home に戻れる", async ({ page }) => {
        await page.goto("/skills");
        await page.getByRole("link", { name: "← home に戻る" }).click();
        await expect(page).toHaveURL("/");
    });

    test("Home の about カードから /about へ遷移する", async ({ page }) => {
        await page.goto("/");
        await page.getByText("その両方の立場で会話できる").click();
        await expect(page).toHaveURL("/about");
    });

    test("About から home に戻れる", async ({ page }) => {
        await page.goto("/about");
        await page.getByRole("link", { name: "← home に戻る" }).click();
        await expect(page).toHaveURL("/");
    });

    test("BREW から works に戻れる", async ({ page }) => {
        // 画像点数が多く load（全画像の読み込み完了）待ちは不安定なため、DOM の構築完了で先へ進める
        await page.goto("/works/brew", { waitUntil: "domcontentloaded" });
        await page.getByRole("link", { name: "← works に戻る" }).click();
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
            /text-indigo-600/,
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
        await page.getByRole("link", { name: "← home に戻る" }).click();
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
