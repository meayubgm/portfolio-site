import Link from "next/link";
import type { ReactNode } from "react";

type LinkRowProps = {
    children: ReactNode;
    href?: string;
    first?: boolean;
    external?: boolean;
};

export function LinkRow({ children, href = "#", first = false, external = false }: LinkRowProps) {
    const className = `flex items-center justify-between font-display text-[15px] text-slate-900 transition-colors hover:text-sky-700 ${
        first ? "pt-0 mt-4.5 border-t-0" : "pt-3.5 mt-3.5 border-t border-sky-700/15"
    }`;

    // 外部リンクは素の <a>、サイト内リンクは next/link（クライアント遷移・プリフェッチ）
    if (external) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                {children} <span>↗</span>
            </a>
        );
    }
    return (
        <Link href={href} className={className}>
            {children} <span>↗</span>
        </Link>
    );
}
