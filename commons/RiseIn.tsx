"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useRiseIn } from "@/lib/useRiseIn";

type RiseInProps = {
    /** 浮き上がりを始めるまでの待ち時間（ms） */
    delay?: number;
    children: ReactNode;
    className?: string;
};

/**
 * 指定時間後に下から浮き上がって現れるブロック。
 * スクロール位置ではなく時間で始めたいもの（ヒーローのボタン列など）に使う。
 * カードのように「画面に入ったら」始めたい場合は GlassCard の reveal を使う。
 */
export function RiseIn({ delay = 0, children, className }: RiseInProps) {
    const [started, setStarted] = useState(false);
    const { riseClass, onTransitionEnd, skipped } = useRiseIn(started);

    useEffect(() => {
        if (skipped) {
            return;
        }
        const timer = window.setTimeout(() => setStarted(true), delay);
        return () => window.clearTimeout(timer);
    }, [delay, skipped]);

    return (
        <div data-rise-in onTransitionEnd={onTransitionEnd} className={cn(riseClass, className)}>
            {children}
        </div>
    );
}
