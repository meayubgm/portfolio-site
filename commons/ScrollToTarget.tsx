"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { takeScrollTarget } from "@/lib/scrollTarget";

/**
 * 直前の遷移が要素を指定していた場合だけ、その要素へスムーススクロールする。
 * 指定は `lib/scrollTarget.ts` 経由で受け取るので、普通の遷移では何もしない。
 * ナビに隠れないためのオフセットは着地側の scroll-mt-* が持つ（scrollIntoView が尊重する）。
 *
 * ルートレイアウトに1つだけ置き、遷移のたびに（usePathname を依存に）動かす。
 * ページ側に置くと、指定した遷移が途中で別ページへ逸れたときに指定が残り続け、
 * 次にそのページを普通に開いたときに勝手に飛ばされる。
 */
export function ScrollToTarget() {
    const pathname = usePathname();

    // biome-ignore lint/correctness/useExhaustiveDependencies: pathname は遷移のたびに動かすためのトリガーで、本体では読まない
    useEffect(() => {
        const id = takeScrollTarget();
        if (!id) {
            return;
        }
        // 遷移先が変わって対象が無い場合も、取り出し済みなので次の遷移には持ち越さない。
        // GlassCard 側で Next の「先頭へ即ジャンプ」を切っているぶんは自前で埋める
        const el = document.getElementById(id);
        if (!el) {
            window.scrollTo(0, 0);
            return;
        }
        // 一度きりの演出なので、Wireframe の自転と違い change の購読は要らない
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }, [pathname]);

    return null;
}
