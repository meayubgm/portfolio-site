"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between px-8 py-6 backdrop-blur-xs shadow-xs">
      <Link
        href="/"
        className="font-display text-[18px] font-semibold tracking-[-0.02em] text-slate-900"
      >
        <span className="text-sky-700">MEGUMI</span> AYUHA
      </Link>
      <div className="flex gap-9 font-mono text-[14px]">
        <Link href="/" className={isHome ? "text-slate-900" : "text-slate-600"}>
          home
        </Link>
        <Link href="/works" className={!isHome ? "text-slate-900" : "text-slate-600"}>
          works
        </Link>
        <span className="cursor-default text-slate-500">skill</span>
        <span className="cursor-default text-slate-500">about</span>
        <span className="cursor-default text-slate-500">contact</span>
      </div>
    </nav>
  );
}
