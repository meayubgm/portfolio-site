import { expect, test } from "@playwright/test";

/**
 * スモークテスト: 6ルートが正常に表示され、想定の主要見出し / <title> を持つこと。
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

test("スキル（/skills）が表示される", async ({ page }) => {
    const res = await page.goto("/skills");
    expect(res?.status()).toBe(200);

    await expect(page).toHaveTitle("スキル — Megumi Ayuha");
    await expect(page.getByRole("heading", { level: 1, name: "スキル" })).toBeVisible();
    // Development / Design の2グループが並ぶ
    await expect(page.getByRole("heading", { level: 2, name: "Development" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Design" })).toBeVisible();
});

test("BREW ケーススタディ（/works/brew）が表示される", async ({ page }) => {
    // 画像点数が多く load（全画像の読み込み完了）待ちは不安定なため、DOM の構築完了で先へ進める
    const res = await page.goto("/works/brew", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);

    await expect(page).toHaveTitle("Coffee Brew Timer — コーヒー抽出タイマー | Megumi Ayuha");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Coffee Brew Timer");
});

test("About（/about）が表示される", async ({ page }) => {
    const res = await page.goto("/about");
    expect(res?.status()).toBe(200);

    await expect(page).toHaveTitle("私自身について — Megumi Ayuha");
    await expect(page.getByRole("heading", { level: 1, name: "私自身について" })).toBeVisible();
    // 強み4項目と来歴の年表が並ぶ
    await expect(
        page.getByRole("heading", { level: 2, name: "デザインと実装をつなぐ" }),
    ).toBeVisible();
    await expect(page.getByText("1990.12")).toBeVisible();
});

test("お問い合わせ（/contact）が表示される", async ({ page }) => {
    const res = await page.goto("/contact");
    expect(res?.status()).toBe(200);

    await expect(page).toHaveTitle("お問い合わせ — Megumi Ayuha");
    await expect(page.getByRole("heading", { level: 1, name: "お問い合わせ" })).toBeVisible();
    // 入力4項目が label と紐づいている
    await expect(page.getByLabel("お名前")).toBeVisible();
    await expect(page.getByLabel("会社名")).toBeVisible();
    await expect(page.getByLabel("メールアドレス")).toBeVisible();
    await expect(page.getByLabel("お問い合わせ内容")).toBeVisible();

    // Honeypot は画面外に置かれ、キーボード / スクリーンリーダーからも到達できない。
    // display:none を検出するボットがあるため意図的に「表示はされている」実装になっており、
    // toBeHidden ではなく位置と属性で確認する。
    const honeypot = page.locator("#contact-website");
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot.locator("xpath=ancestor::div[@aria-hidden='true']")).toHaveCount(1);
    const box = await honeypot.boundingBox();
    expect(box?.x ?? 0).toBeLessThan(0);
});
