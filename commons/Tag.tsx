import type { ReactNode } from "react";
import { Text } from "./Text";

/**
 * 技術スタックのバッジ。枠線・面・文字を sky で揃えた一組のため、文字色だけ
 * `tone` ではなく className で指定している（`cn()` が tone の既定色を上書きする）。
 */
export function Tag({ children }: { children: ReactNode }) {
    return (
        <Text
            as="span"
            variant="monoSm"
            className="inline-block rounded-tag border border-sky-700/15 bg-sky-700/10 px-2.5 py-1.5 text-sky-700"
        >
            {children}
        </Text>
    );
}
