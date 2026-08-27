"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { requestScrollTo } from "@/lib/scrollTarget";
import { useRiseIn } from "@/lib/useRiseIn";

/**
 * グリッドのカラム指定。lg 未満は 1 カラムに畳むので、lg: を付けたクラスだけを持つ。
 * Tailwind はソースを文字列として走査するため、`lg:col-span-${n}` のような組み立てでは
 * クラスが生成されない。1〜6（= CardGrid のカラム数）を表に書き下しておく。
 */
const spanClasses = {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
} as const;

const startClasses = {
    1: "lg:col-start-1",
    2: "lg:col-start-2",
    3: "lg:col-start-3",
    4: "lg:col-start-4",
    5: "lg:col-start-5",
    6: "lg:col-start-6",
} as const;

/** CardGrid のカラム番号（1 起点） */
export type GridColumn = keyof typeof spanClasses;

type GlassCardProps = {
    /** アンカー用の id。ハッシュ遷移の着地点にするときだけ指定する */
    id?: string;
    /** 占有カラム数。lg 以上でのみ効く（lg 未満は全幅の 1 カラム） */
    span?: GridColumn;
    /** 開始カラム（1 起点）。単独のカードをグリッド内で寄せたいときに指定する。lg 以上でのみ効く */
    start?: GridColumn;
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
    id,
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

    /**
     * href が "#id" を含む場合は、着地先の要素を ScrollToTarget に預けて、
     * Next の自動スクロール（先頭へ即ジャンプ）を切る。それ以外は素の遷移。
     */
    function navigate(to: string) {
        const [path, targetId] = to.split("#");
        if (!targetId) {
            router.push(to);
            return;
        }
        requestScrollTo(targetId);
        router.push(path, { scroll: false });
    }

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
            id={id}
            ref={rootRef}
            // globals.css の @media (scripting: none) がこの属性で伏せた要素を戻す
            data-rise-in={reveal || undefined}
            onTransitionEnd={onTransitionEnd}
            onClick={href ? () => navigate(href) : undefined}
            onMouseMove={
                hoverEffects
                    ? (e) => {
                          const r = e.currentTarget.getBoundingClientRect();
                          setMx(`${((e.clientX - r.left) / r.width) * 100}%`);
                          setMy(`${((e.clientY - r.top) / r.height) * 100}%`);
                      }
                    : undefined
            }
            className={cn(
                "group relative overflow-hidden bg-white/10 backdrop-blur-xs border border-sky-700/15 rounded-card transition-[border-color,translate,box-shadow] duration-350 ease-out motion-reduce:transition-none",
                // lg 未満は 1 カラム。span / start は lg 以上でだけ効かせる
                "col-span-full",
                spanClasses[span],
                start && startClasses[start],
                reveal && riseClass,
                hoverEffects &&
                    "hover:border-indigo-600 hover:-translate-y-0.5 hover:shadow-card-hover",
                padding === "lg" ? "p-6 sm:p-9" : "p-5 sm:p-7",
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
