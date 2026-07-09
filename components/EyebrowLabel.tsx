import type { ReactNode } from "react";

export function EyebrowLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-[10px] font-mono text-[12.5px] tracking-[0.06em] text-indigo">
      <span className="inline-block w-[6px] h-[6px] shrink-0 rounded-full bg-indigo shadow-[0_0_0_4px_var(--color-indigo-soft)]" />
      {children}
    </div>
  );
}
