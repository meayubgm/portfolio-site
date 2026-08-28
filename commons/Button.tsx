import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = {
    variant?: "primary" | "ghost";
    children: ReactNode;
    href?: string;
    /** href 未指定時の <button> の type。フォーム送信ボタンでは "submit" を渡す */
    type?: "button" | "submit";
    disabled?: boolean;
};

const base =
    "inline-flex items-center gap-2 whitespace-nowrap rounded-lg font-body text-sm font-medium px-6 py-3.5 cursor-pointer transition-all duration-250 ease-in-out";

const styles = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-px",
    ghost: "bg-white/60 text-slate-900 border border-sky-700/15 backdrop-blur-xs hover:bg-white/85 hover:border-sky-700/30",
};

export function Button({
    variant = "primary",
    children,
    href,
    type = "button",
    disabled = false,
}: ButtonProps) {
    const className = cn(base, styles[variant]);
    // disabled のときは <Link> ではなく無効化した <button> を返す（href があっても押せてしまわないように）
    if (href && !disabled) {
        return (
            <Link href={href} className={className}>
                {children}
            </Link>
        );
    }
    return (
        <button
            type={type}
            disabled={disabled}
            className={cn(
                className,
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
            )}
        >
            {children}
        </button>
    );
}
