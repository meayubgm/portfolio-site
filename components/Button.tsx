import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  variant?: "primary" | "ghost";
  children: ReactNode;
  href?: string;
};

const base =
  "inline-flex items-center gap-2 rounded-btn font-body text-[14.5px] font-medium px-6 py-[13px] cursor-pointer transition-all duration-250 ease-in-out";

const styles = {
  primary: "bg-navy text-white hover:bg-[#1c3358] hover:-translate-y-px",
  ghost:
    "bg-white/60 text-navy border border-sky-700/15 backdrop-blur-[6px] hover:bg-white/85 hover:border-sky-700/30",
};

export function Button({ variant = "primary", children, href }: ButtonProps) {
  const className = `${base} ${styles[variant]}`;
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className}>
      {children}
    </button>
  );
}
