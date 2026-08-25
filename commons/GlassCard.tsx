"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useRiseIn } from "@/lib/useRiseIn";

type GlassCardProps = {
    span?: number;
    /** 開始カラム（1 起点）。単独のカードをグリッド内で寄せたいときに指定する */
    start?: number;
    padding?: "default" | "lg";
    children: ReactNode;
    className?: string;
    /** 指定するとカード全体がこのパスへのリンクになる */
    href?: string;
    /**
     * ホバー演出（枠線の indigo 化・浮き上がり・影・右上の「+」・カーソル追従グロー）の有無。
     * 遷移しないコンテンツ（フォーム等）を載せる場合は false にする。
     */
    hoverEffects?: boolean;
    /**
     * スクロールで画面に入ったときに浮き上がらせる（Home のカード用）。
     * 一度表示したら戻さないので、監視は初回の交差で打ち切る。
     */
    reveal?: boolean;
};

export function GlassCard({
    span = 2,
    start,
    padding = "default",
    children,
    className,
    href,
    hoverEffects = true,
    reveal = false,
}: GlassCardProps) {
    const router = useRouter();
    // グローの表示・非表示は group-hover に任せ、state は追従させる座標だけ持つ
    const [mx, setMx] = useState("50%");
    const [my, setMy] = useState("20%");
    const rootRef = useRef<HTMLDivElement>(null);
    const [entered, setEntered] = useState(!reveal);
    const { riseClass, onTransitionEnd, skipped } = useRiseIn(entered);

    useEffect(() => {
        if (!reveal || skipped) {
            return;
        }
        const el = rootRef.current;
        if (!el) {
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) {
                        continue;
                    }
                    // 一度出したら戻さないので監視はここで打ち切る
                    observer.disconnect();
                    setEntered(true);
                }
            },
            { rootMargin: "0px 0px -12% 0px" },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [reveal, skipped]);

    return (
        // biome-ignore lint/a11y/noStaticElementInteractions: カード全体クリック遷移は意図的な UI（<a> ネスト回避のため div + useRouter）
        // biome-ignore lint/a11y/useKeyWithClickEvents: 同上。プロトタイプ再現を優先し現状はキーボード操作非対応（a11y 改善は別課題）
        <div
            ref={rootRef}
            // globals.css の @media (scripting: none) がこの属性で伏せた要素を戻す
            data-rise-in={reveal || undefined}
            onTransitionEnd={onTransitionEnd}
            onClick={href ? () => router.push(href) : undefined}
            onMouseMove={
                hoverEffects
                    ? (e) => {
                          const r = e.currentTarget.getBoundingClientRect();
                          setMx(`${((e.clientX - r.left) / r.width) * 100}%`);
                          setMy(`${((e.clientY - r.top) / r.height) * 100}%`);
                      }
                    : undefined
            }
            style={{ gridColumn: start ? `${start} / span ${span}` : `span ${span}` }}
            className={cn(
                "group relative overflow-hidden bg-white/10 backdrop-blur-xs border border-sky-700/15 rounded-card transition-[border-color,translate,box-shadow] duration-350 ease-out motion-reduce:transition-none",
                reveal && riseClass,
                hoverEffects &&
                    "hover:border-indigo-600 hover:-translate-y-0.5 hover:shadow-card-hover",
                padding === "lg" ? "p-9" : "p-7",
                href ? "cursor-pointer" : "cursor-default",
                className,
            )}
        >
            {hoverEffects && (
                <>
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                            background: `radial-gradient(320px circle at ${mx} ${my}, rgba(107,174,219,0.22), transparent 60%)`,
                        }}
                    />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute top-3.5 right-4 text-indigo-600 leading-none text-base font-display opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                        +
                    </span>
                </>
            )}
            {children}
        </div>
    );
}
