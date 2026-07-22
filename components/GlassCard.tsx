"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";

type GlassCardProps = {
  span?: number;
  rowSpan?: number;
  padding?: "default" | "lg";
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** 指定するとカード全体がこのパスへのリンクになる */
  href?: string;
};

export function GlassCard({
  span = 2,
  rowSpan = 1,
  padding = "default",
  children,
  className = "",
  style = {},
  href,
}: GlassCardProps) {
  const router = useRouter();
  const [mx, setMx] = useState("50%");
  const [my, setMy] = useState("20%");
  const [hovered, setHovered] = useState(false);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: カード全体クリック遷移は意図的な UI（<a> ネスト回避のため div + useRouter）
    // biome-ignore lint/a11y/useKeyWithClickEvents: 同上。プロトタイプ再現を優先し現状はキーボード操作非対応（a11y 改善は別課題）
    <div
      onClick={href ? () => router.push(href) : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setMx(`${((e.clientX - r.left) / r.width) * 100}%`);
        setMy(`${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      style={{
        gridColumn: `span ${span}`,
        gridRow: `span ${rowSpan}`,
        ...style,
      }}
      className={`group relative overflow-hidden bg-glass-55 border border-frost-border rounded-card backdrop-blur-[14px] transition-[border-color,transform,box-shadow] duration-[350ms] ease-out hover:border-indigo hover:-translate-y-0.5 hover:shadow-card-hover ${
        padding === "lg" ? "p-[36px]" : "p-[28px]"
      } ${href ? "cursor-pointer" : "cursor-default"} ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(320px circle at ${mx} ${my}, rgba(107,174,219,0.22), transparent 60%)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-3.5 right-4 text-indigo leading-none text-base font-display opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        +
      </span>
      {children}
    </div>
  );
}
