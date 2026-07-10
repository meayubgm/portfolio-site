"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between px-8 pt-9 pb-6 backdrop-blur-xs shadow-xs">
      <Link
        href="/"
        className="font-display text-[18px] font-semibold tracking-[-0.02em] text-navy"
      >
        A.<span className="text-glow-c">Y</span> / frontend
      </Link>
      <div className="flex gap-9 font-body text-[14px]">
        <Link href="/" className={isHome ? "text-navy" : "text-slate"}>
          home
        </Link>
        <Link href="/works" className={!isHome ? "text-navy" : "text-slate"}>
          works
        </Link>
        <span className="cursor-default text-slate-soft">skill</span>
        <span className="cursor-default text-slate-soft">about</span>
        <span className="cursor-default text-slate-soft">contact</span>
      </div>
    </nav>
  );
}
