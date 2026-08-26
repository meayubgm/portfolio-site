import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ScrollToTarget } from "@/commons/ScrollToTarget";
import { Text } from "@/commons/Text";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

export const metadata: Metadata = {
    title: "Megumi Ayuha — ポートフォリオ",
    description:
        "要件のヒアリングから、デザインと実装まで。フロントエンドエンジニア 阿由葉 萌のポートフォリオサイト。",
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
                <div className="relative z-2 mx-auto max-w-site px-8 pb-15">{children}</div>
                <footer className="relative z-2 py-8 text-center">
                    <Text as="small" variant="monoSm" tone="muted">
                        &copy; 2026 Megumi Ayuha
                    </Text>
                </footer>
            </body>
        </html>
    );
}
