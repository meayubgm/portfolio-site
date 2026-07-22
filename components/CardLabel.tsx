import type { ReactNode } from "react";

export function CardLabel({ children }: { children: ReactNode }) {
  return (
    <span className="block mb-3.5 font-mono text-[11.5px] uppercase tracking-[0.06em] text-indigo">
      {children}
    </span>
  );
}
