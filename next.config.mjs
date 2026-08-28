import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 全レスポンスに付けるセキュリティヘッダー。
 *
 * CSP はここに入れていない（Turnstile・Google Fonts・Next のインラインスタイルの
 * 許可設定と動作確認が要るため別途）。
 */
const securityHeaders = [
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
