import type { ReactNode } from "react";

type HoverCueProps = {
    children: ReactNode;
    className?: string;
};

/**
 * GlassCard 内の導線テキスト（「learn more ↗」）。
 * カードホバー時のみフェードインする（GlassCard 右上の "+" バッジと同じ挙動）。
 * ホバー非対応環境（タッチデバイス）では常時表示。
 */
export function HoverCue({ children, className = "" }: HoverCueProps) {
    return (
        <span
            className={`font-mono text-[12.5px] text-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${className}`}
        >
            {children}
        </span>
    );
}
