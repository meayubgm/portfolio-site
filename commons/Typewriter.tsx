"use client";

import { useEffect, useState } from "react";
import { withLineBreaks } from "@/commons/Text";

type TypewriterProps = {
    /** 打ち込む文言。配列の要素は <br /> 区切りの1行 */
    lines: readonly string[];
    /** 打ち始めるまでの待ち時間（ms） */
    delay: number;
    /** 1文字あたりの間隔（ms） */
    speed: number;
};

/** 改行を含めて1本の文字列として扱い、slice で打ち込み途中を作る */
const LINE_SEPARATOR = "\n";

/**
 * 文字を左から順に打ち込むテキスト。
 *
 * 完成テキストと打ち込み中のテキストをグリッドで重ね、完成テキスト側で高さを確保する。
 * これにより行数が増えても後続がガタつかず、SSG の HTML とアクセシビリティツリーには
 * 最初から完成テキストが載る（打ち込み中の層は aria-hidden）。
 * prefers-reduced-motion: reduce のときは打ち込まず即座に完成状態にする。
 */
export function Typewriter({ lines, delay, speed }: TypewriterProps) {
    const full = lines.join(LINE_SEPARATOR);
    const [typedCount, setTypedCount] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setDone(true);
            return;
        }
        let count = 0;
        let timer = window.setTimeout(function step() {
            count += 1;
            setTypedCount(count);
            if (count >= full.length) {
                setDone(true);
                return;
            }
            timer = window.setTimeout(step, speed);
        }, delay);
        return () => window.clearTimeout(timer);
    }, [full, delay, speed]);

    // 打ち終わったら重ねを解いて素のテキストに戻す（テキスト選択を通常どおりにするため）
    if (done) {
        return withLineBreaks([...lines]);
    }

    return (
        <span className="grid">
            <span data-typewriter-target className="col-start-1 row-start-1 opacity-0">
                {withLineBreaks([...lines])}
            </span>
            <span aria-hidden className="col-start-1 row-start-1">
                {withLineBreaks(full.slice(0, typedCount).split(LINE_SEPARATOR))}
            </span>
        </span>
    );
}
