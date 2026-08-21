import type { ReactNode } from "react";
import { Text } from "./Text";

/** mono / indigo のセクション見出し（例: "// 開発背景・課題設定"） */
export function MonoHeading({ children }: { children: ReactNode }) {
    return (
        <Text variant="monoLg" tone="accent" className="mb-3">
            {children}
        </Text>
    );
}
