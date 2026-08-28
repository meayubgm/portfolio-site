"use client";

import { useEffect, useState } from "react";
import { phraseWrap, withPhraseBreaks } from "@/commons/Text";
import { cn } from "@/lib/cn";

type TypewriterProps = {
    /** 打ち込む文言。外側の要素が <br /> 区切りの1行、内側が文節（lib/phrase.ts でパース済み） */
    lines: readonly (readonly string[])[];
    /** 打ち始めるまでの待ち時間（ms） */
    delay: number;
    /** 1文字あたりの間隔（ms） */
    speed: number;
};

/** 改行も1文字として打つので、総文字数はこれで連結して数える */
const LINE_SEPARATOR = "\n";

/**
 * 文字を左から順に打ち込むテキスト。
 *
 * 完成テキストと打ち込み中のテキストをグリッドで重ね、完成テキスト側で高さを確保する。
 * これにより行数が増えても後続がガタつかず、SSG の HTML とアクセシビリティツリーには
 * 最初から完成テキストが載る（打ち込み中の層は aria-hidden）。
 * どちらの層も文節改行（phraseWrap + <wbr>）にする。片方だけだと折り返し位置が食い違い、
 * 打ち込み中に文字が跳ねる。打ち込み中の層は未入力ぶんの場所も確保する（withPhraseBreaks の
 * typedCount）ので、折り返しは最初から完成形と同じになる。
 * prefers-reduced-motion: reduce のときは打ち込まず即座に完成状態にする。
 */
export function Typewriter({ lines, delay, speed }: TypewriterProps) {
    const full = lines.map((phrases) => phrases.join("")).join(LINE_SEPARATOR);
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
        return <span className={phraseWrap}>{withPhraseBreaks(lines)}</span>;
    }

    return (
        <span className="grid">
            <span
                data-typewriter-target
                className={cn("col-start-1 row-start-1 opacity-0", phraseWrap)}
            >
                {withPhraseBreaks(lines)}
            </span>
            <span aria-hidden className={cn("col-start-1 row-start-1", phraseWrap)}>
                {/* 1文字も打っていない間（＝SSG が出す HTML）は空にする。未入力ぶんを
                    visibility:hidden で持たせたままだと、完成テキストの層と合わせて
                    静的 HTML に全文が2回入り、h1 の textContent が二重になる */}
                {typedCount > 0 && withPhraseBreaks(lines, typedCount)}
            </span>
        </span>
    );
}
