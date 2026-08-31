import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV !== "production";

/** Turnstile のスクリプト・iframe・検証通信の配信元 */
const TURNSTILE = "https://challenges.cloudflare.com";

/**
 * Vercel Analytics が **development のときだけ** 読むデバッグ用スクリプトの配信元。
 * 本番の `<Analytics />` は同一オリジンの `/_vercel/insights/script.js` を読み、
 * 計測ビーコンも同じ `/_vercel/insights/` 配下（ページビューは `view`）へ送るので
 * `'self'` で足りる。
 */
const VERCEL_ANALYTICS_DEV = "https://va.vercel-scripts.com";

/**
 * Content-Security-Policy を組み立てる。
 *
 * `script-src` に `'unsafe-inline'` が残っているのは意図的。Next はページごとに
 * インラインの `self.__next_f.push(...)` を吐き、Home には JSON-LD の `<script>` もある。
 * これを nonce で許可するにはリクエストごとに値を変える必要があり middleware が要るが、
 * middleware を置くと全ページが dynamic レンダリングに落ちて SSG が効かなくなる。
 * よってこの CSP の狙いは「インライン script の遮断」ではなく、
 * **読み込み元オリジンの限定**と、XSS を前提としない指示
 * （frame-ancestors / base-uri / form-action / object-src）に置いている。
 *
 * 外部のリソースを増やしたら、ここにも配信元を足すこと。
 */
function contentSecurityPolicy() {
    // dev サーバーにもこのヘッダーは付く。React Refresh は eval を、HMR は WebSocket を使うので、
    // 開発時だけ緩める（消すと `make up` の画面が固まる）。
    // Vercel Analytics のデバッグ用スクリプトも dev でしか読まれないのでここに置く
    const scriptSrc = ["'self'", "'unsafe-inline'", TURNSTILE];
    const connectSrc = ["'self'", TURNSTILE];
    if (isDev) {
        scriptSrc.push("'unsafe-eval'", VERCEL_ANALYTICS_DEV);
        connectSrc.push("ws:");
    }

    const directives = [
        ["default-src", ["'self'"]],
        ["script-src", scriptSrc],
        // Next / next/image / Turnstile が style 属性を書き、globals.css が Google Fonts の CSS を @import する
        ["style-src", ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"]],
        // 上の CSS が参照する実フォント
        ["font-src", ["'self'", "https://fonts.gstatic.com"]],
        // next/image の最適化結果は同一オリジン。data: は blur placeholder 用
        ["img-src", ["'self'", "data:", "blob:"]],
        // /api/contact と Turnstile の検証通信
        ["connect-src", connectSrc],
        // Turnstile ウィジェットの iframe
        ["frame-src", [TURNSTILE]],
        // X-Frame-Options: DENY の後継。両方付けておく
        ["frame-ancestors", ["'none'"]],
        // <base> の注入で相対 URL の解決先をすり替えられるのを塞ぐ
        ["base-uri", ["'self'"]],
        // フォームの送信先すり替えを塞ぐ
        ["form-action", ["'self'"]],
        ["object-src", ["'none'"]],
        // http のサブリソースを https に持ち上げる（値を取らない指示）
        ["upgrade-insecure-requests", []],
    ];

    return directives.map(([name, sources]) => [name, ...sources].join(" ")).join("; ");
}

/**
 * 全レスポンスに付けるセキュリティヘッダー。
 */
const securityHeaders = [
    { key: "Content-Security-Policy", value: contentSecurityPolicy() },
    // Content-Type を無視した MIME スニッフィングを止める
    { key: "X-Content-Type-Options", value: "nosniff" },
    // 外部サイトへ遷移するときに URL のパスまで渡さない
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // 使わないブラウザ API を明示的に閉じる
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
    // クリックジャッキング対策。Turnstile は「このページが iframe を埋め込む」側なので影響しない
    { key: "X-Frame-Options", value: "DENY" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    // 上位ディレクトリの package-lock.json を誤検出しないよう、ルートを固定
    outputFileTracingRoot: __dirname,
    async headers() {
        return [{ source: "/:path*", headers: securityHeaders }];
    },
};

export default nextConfig;
