"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { textStyles } from "@/commons/Text";
import { cn } from "@/lib/cn";
import icon from "../app/icon.svg";

const links = [
    { href: "/", label: "home" },
    { href: "/works", label: "works" },
    { href: "/skills", label: "skills" },
    { href: "/about", label: "about" },
    { href: "/contact", label: "contact" },
];

/** これ未満のスクロール量は無視する（トラックパッドの微振動でちらつかせない） */
const SCROLL_THRESHOLD = 8;
/** ページ最上部付近ではナビを隠さない */
const HIDE_AFTER = 80;

export function SiteNav() {
    const pathname = usePathname();
    const [hidden, setHidden] = useState(false);

    // 下スクロールで引っ込め、上スクロールで戻す
    useEffect(() => {
        let lastY = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            if (Math.abs(y - lastY) < SCROLL_THRESHOLD) {
                return;
            }
            setHidden(y > lastY && y > HIDE_AFTER);
            lastY = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // "/" は完全一致、それ以外は配下（例: /works/brew）も active 扱い
    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <nav
            // 隠れている間もリンクはタブ移動の対象なので、フォーカスが入ったら出し直す
            onFocus={() => setHidden(false)}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between px-8 py-4 backdrop-blur-xs shadow-xs",
                "transition-transform duration-300 ease-out motion-reduce:transition-none",
                hidden && "-translate-y-full",
            )}
        >
            {/* perspective は親に置く（子だけで回すと奥行きが出ず平面的に潰れる） */}
            <Link href="/" className="group perspective-midrange">
                <Image
                    src={icon}
                    alt="icon"
                    width="40"
                    height="40"
                    className="transform-3d transition-transform duration-500 ease-out group-hover:rotate-y-360 motion-reduce:transition-none"
                />
            </Link>
            <div className={cn("flex gap-9", textStyles.monoMd)}>
                {links.map((l) => (
                    <Link
                        key={l.href}
                        href={l.href}
                        className={cn(
                            "group relative transition-colors hover:text-indigo-600",
                            isActive(l.href) ? "text-indigo-600" : "text-slate-600",
                        )}
                    >
                        {/* GlassCard 右上の「+」と同じ導線サイン。絶対配置でラベルを動かさない。
                            aria-hidden が無いとアクセシブルネームが「+ home」になる */}
                        <span
                            aria-hidden
                            className="pointer-events-none absolute -left-3.5 text-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
                        >
                            +
                        </span>
                        {l.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
