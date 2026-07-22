import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "A.Y / frontend — ポートフォリオ",
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
          className="pointer-events-none fixed left-1/2 top-[-20%] z-0 h-175 w-275 -translate-x-1/2 blur-[10px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(107,174,219,0.16) 0%, rgba(168,216,240,0.08) 35%, rgba(255,255,255,0) 70%)",
          }}
        />
        <SiteNav />
        <div className="relative z-2 mx-auto max-w-[1800px] px-8 pt-22.5 pb-15">{children}</div>
      </body>
    </html>
  );
}
