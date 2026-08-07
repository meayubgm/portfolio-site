"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import icon from "../app/icon.svg";

const links = [
    { href: "/", label: "home" },
    { href: "/works", label: "works" },
    { href: "/skill", label: "skill" },
];

export function SiteNav() {
    const pathname = usePathname();
    // "/" は完全一致、それ以外は配下（例: /works/brew）も active 扱い
    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between px-8 py-4 backdrop-blur-xs shadow-xs">
            <Link href="/">
                <Image src={icon} alt="icon" width="40" height="40" />
            </Link>
            <div className="flex gap-9 font-mono text-[14px]">
                {links.map((l) => (
                    <Link
                        key={l.href}
                        href={l.href}
                        className={isActive(l.href) ? "text-slate-900" : "text-slate-600"}
                    >
                        {l.label}
                    </Link>
                ))}
                <span className="cursor-default text-slate-500">about</span>
                <span className="cursor-default text-slate-500">contact</span>
            </div>
        </nav>
    );
}
