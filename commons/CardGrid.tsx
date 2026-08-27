import type { ReactNode } from "react";

/** GlassCard を並べるセクショングリッド。lg 以上で 6 カラム、それ未満は 1 カラム */
export function CardGrid({ children }: { children: ReactNode }) {
    return (
        <section className="grid grid-cols-1 lg:grid-cols-6 gap-4 pb-12 sm:pb-16">
            {children}
        </section>
    );
}
