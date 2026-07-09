import type { ReactNode } from "react";

type LinkRowProps = {
  children: ReactNode;
  href?: string;
  first?: boolean;
};

export function LinkRow({ children, href = "#", first = false }: LinkRowProps) {
  return (
    <a
      href={href}
      className={`flex items-center justify-between font-display text-[15px] text-navy transition-colors hover:text-glow-c ${
        first ? "pt-0 mt-[18px] border-t-0" : "pt-[14px] mt-[14px] border-t border-frost-border"
      }`}
    >
      {children} <span>↗</span>
    </a>
  );
}
