import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-tag border border-[rgba(58,124,165,0.15)] bg-[rgba(58,124,165,0.09)] px-[10px] py-[6px] font-mono text-[11.5px] text-glow-c">
      {children}
    </span>
  );
}
