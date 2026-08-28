/**
 * サイト全体で使う公開情報（URL・名前・説明文）の単一ソース。
 *
 * metadata / sitemap / robots / OGP 画像はいずれもサーバー側でしか評価されないので、
 * URL は `NEXT_PUBLIC_` を付けずに持つ（クライアントバンドルに載せない）。
 */

/**
 * 本番 URL。次の順でフォールバックする。
 *
 * 1. `SITE_URL` — 独自ドメインを取ったらこれを設定する
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel が自動で入れる本番ホスト名（スキームを含まない）
 * 3. ローカル開発
 *
 * 2段目があるので、Vercel に `SITE_URL` を設定する前でも canonical / OGP / sitemap は
 * 本番ドメインを向く。**ビルド時に評価される**ため、値を変えたら再デプロイが要る。
 */
function resolveSiteUrl(): string {
    const configured = process.env.SITE_URL?.trim();
    if (configured) {
        // スキームなし（`example.com`）で渡されることが多いので補う。
        // 素通しすると app/layout.tsx の `new URL()` が投げて next build ごと落ちる
        const withScheme = /^https?:\/\//.test(configured) ? configured : `https://${configured}`;
        return withScheme.replace(/\/+$/, "");
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();

/** OGP の og:site_name とタイトルテンプレートに使う */
export const siteName = "Megumi Ayuha";

/**
 * ページ名にサイト名を足したタイトル。
 *
 * `<title>`（`app/layout.tsx` の `title.template`）と og:title の**両方がこれを通る**。
 * 区切り方を2箇所に書くと、片方だけ変えたときに静かに食い違う。
 */
export function fullTitle(pageTitle: string): string {
    return `${pageTitle} | ${siteName}`;
}

export const siteTitle = "Megumi Ayuha — ポートフォリオ";

export const siteDescription =
    "要件のヒアリングから、デザインと実装まで。フロントエンドエンジニア 阿由葉 萌のポートフォリオサイト。";

export const authorName = "阿由葉 萌";

export const authorJobTitle = "フロントエンドエンジニア";

/**
 * OGP 画像（`app/opengraph-image.tsx`）のパスと代替テキスト。
 * ページが `openGraph` を持つとルートからの継承が切れるので、`lib/metadata.ts` が明示的に付ける。
 */
export const OG_IMAGE_PATH = "/opengraph-image";

export const OG_IMAGE_ALT = `${siteName} — Frontend Engineer Portfolio`;

/**
 * サイト内の全ルート。`app/sitemap.ts` がこれを map する。
 * **ページを増やしたらここにも足す**（sitemap から漏れる）。
 */
export const sitePaths = ["/", "/works", "/works/brew", "/skills", "/about", "/contact"] as const;
