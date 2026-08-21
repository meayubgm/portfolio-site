import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * `@theme` で足したカスタムトークンは tailwind-merge の既定 validator に載らないため、
 * 対応する classGroup を拡張して衝突検出の対象に含める。
 * - tracking: `--tracking-heading` / `--tracking-label`
 */
const twMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            tracking: [{ tracking: ["heading", "label"] }],
        },
    },
});

/** クラスを結合し、Tailwind の衝突は後勝ちで解決する（className での上書きを安全にする） */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
