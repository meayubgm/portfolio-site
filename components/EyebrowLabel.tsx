import type { ReactNode } from "react";

export function EyebrowLabel({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-center gap-2.5 font-mono text-[12.5px] tracking-[0.06em] text-indigo-600">
            <span className="inline-block w-1.5 h-1.5 shrink-0 rounded-full bg-indigo-600 ring-4 ring-indigo-600/15" />
            {children}
        </div>
    );
}
