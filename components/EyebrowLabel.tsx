import type { ReactNode } from "react";

export function EyebrowLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 font-mono text-[12.5px] tracking-[0.06em] text-indigo">
      <span className="inline-block w-1.5 h-1.5 shrink-0 rounded-full bg-indigo shadow-[0_0_0_4px_var(--color-indigo-soft)]" />
      {children}
    </div>
  );
}
