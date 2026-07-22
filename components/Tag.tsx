import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-tag border border-sky-700/15 bg-sky-700/10 px-2.5 py-1.5 font-mono text-[11.5px] text-glow-c">
      {children}
    </span>
  );
}
