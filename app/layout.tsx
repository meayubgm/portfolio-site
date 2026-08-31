import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ScrollToTarget } from "@/commons/ScrollToTarget";
import { Text } from "@/commons/Text";
import { SiteNav } from "@/components/SiteNav";
import { fullTitle, siteDescription, siteName, siteTitle, siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
    // OGP や canonical の相対 URL を解決する基準。これが無いと絶対 URL にならない
    metadataBase: new URL(siteUrl),
    title: {
        default: siteTitle,
        // 各ページは短いタイトルだけを持つ。区切り方は fullTitle が一手に持つので、
        // <title> と og:title（lib/metadata.ts）が食い違わない
        template: fullTitle("%s"),
    },
    description: siteDescription,
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        locale: "ja_JP",
        siteName,
        url: siteUrl,
        title: siteTitle,
        description: siteDescription,
    },
    // og:image（app/opengraph-image.tsx）を大きく出す
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="ja">
            {/* body への属性注入（ブラウザ拡張の cz-shortcut-listen 等）による hydration 警告を抑制。
          body 自身の属性のみ対象で、子要素の不一致は引き続き検出される。 */}
            <body suppressHydrationWarning>
                {/* ambient glow */}
                <div
                    aria-hidden
                    className="pointer-events-none fixed left-1/2 -top-1/4 z-0 h-175 w-275 -translate-x-1/2 bg-ambient-glow blur-md"
                />
                <ScrollToTarget />
                <SiteNav />
                <div className="relative z-2 mx-auto max-w-site px-5.5 sm:px-8 pb-15">
                    {children}
                </div>
                <footer className="relative z-2 py-8 text-center">
                    <Text as="small" variant="monoSm" tone="muted">
                        &copy; 2026 Megumi Ayuha
                    </Text>
                </footer>
                {/* Vercel Web Analytics。スクリプトも計測ビーコンも同一オリジン
            （/_vercel/insights/*）なので CSP は 'self' のままで通る。cookieless。
            client component だがページは Static のまま。 */}
                <Analytics />
            </body>
        </html>
    );
}
