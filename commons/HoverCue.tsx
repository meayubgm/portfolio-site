import type { ReactNode } from "react";
import { Text } from "./Text";

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
        <Text
            as="span"
            variant="monoSm"
            tone="accent"
            className={`opacity-0 transition-opacity duration-300 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${className}`}
        >
            {children}
        </Text>
    );
}
