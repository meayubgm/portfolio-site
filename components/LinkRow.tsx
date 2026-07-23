import type { ReactNode } from "react";

type LinkRowProps = {
    children: ReactNode;
    href?: string;
    first?: boolean;
};

export function LinkRow({ children, href = "#", first = false }: LinkRowProps) {
    return (
        <a
            href={href}
            className={`flex items-center justify-between font-display text-[15px] text-slate-900 transition-colors hover:text-sky-700 ${
                first ? "pt-0 mt-4.5 border-t-0" : "pt-3.5 mt-3.5 border-t border-sky-700/15"
            }`}
        >
            {children} <span>↗</span>
        </a>
    );
}
