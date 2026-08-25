"use client";

import { type TransitionEvent, useCallback, useEffect, useState } from "react";

/** 浮き上がりのトランジション。終わったら外すので、当てている間だけ duration が効く */
const RISE_TRANSITION = "transition-[translate,opacity] duration-500 ease-out";

/**
 * 下から浮き上がりながら現れる表示を要素に当てるためのフック。
 * started が true になった時点で opacity と translate を終点へ動かす（フェードと移動は同時）。
 *
 * 終わったらクラスを外して素の状態に戻す。付けっぱなしでも見た目は同じだが、
 * duration がホバーの浮き上がりにも効き続けてしまうため。
 *
 * prefers-reduced-motion: reduce の判定は初回描画後（useEffect）に行う。
 * サーバー側では判定できず、初期 class を変えると hydration が食い違うため。
 */
export function useRiseIn(started: boolean) {
    const [skipped, setSkipped] = useState(false);
    const [finished, setFinished] = useState(false);

    // 同じ duration の他プロパティでも発火するので、移動の終わりだけを拾う。
    // 開始前のホバー（GlassCard の hover:-translate-y-0.5）でも translate の
    // transitionend は飛んでくるため、started を見て取り違えを防ぐ。
    const onTransitionEnd = useCallback(
        (e: TransitionEvent<Element>) => {
            if (started && e.target === e.currentTarget && e.propertyName === "translate") {
                setFinished(true);
            }
        },
        [started],
    );

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setSkipped(true);
        }
    }, []);

    if (skipped || finished) {
        return { riseClass: undefined, onTransitionEnd, skipped };
    }
    if (!started) {
        return {
            riseClass: `${RISE_TRANSITION} opacity-0 translate-y-4`,
            onTransitionEnd,
            skipped,
        };
    }
    return { riseClass: `${RISE_TRANSITION} opacity-100 translate-y-0`, onTransitionEnd, skipped };
}
