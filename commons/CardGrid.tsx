import type { ReactNode } from "react";

/** GlassCard を並べる 6 カラムのセクショングリッド */
export function CardGrid({ children }: { children: ReactNode }) {
    return <section className="grid grid-cols-6 gap-4 pb-section">{children}</section>;
}
