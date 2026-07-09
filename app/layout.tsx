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
      <body>
        {/* ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none fixed left-1/2 top-[-20%] z-0 h-[700px] w-[1100px] -translate-x-1/2 blur-[10px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(107,174,219,0.16) 0%, rgba(168,216,240,0.08) 35%, rgba(255,255,255,0) 70%)",
          }}
        />
        <div className="relative z-[2] mx-auto max-w-[1120px] px-8 pb-[60px]">
          <SiteNav />
          {children}
        </div>
      </body>
    </html>
  );
}
