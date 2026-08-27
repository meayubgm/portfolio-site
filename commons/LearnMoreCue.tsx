import { HoverCue } from "./HoverCue";

type LearnMoreCueProps = {
    /** true でタグ列と横並びにする（カード下部へ落とさず、その場に置く。sm 未満で縦積みになったときは右端へ寄せる） */
    inline?: boolean;
};

/**
 * カード全体がリンクになっているときの導線テキスト。
 * 既定はカード下部の右寄せ（flex の余白を mt-auto で食う）。
 */
export function LearnMoreCue({ inline = false }: LearnMoreCueProps) {
    const className = inline
        ? "self-end whitespace-nowrap sm:self-auto"
        : "mt-auto block pt-4 text-right";
    return <HoverCue className={className}>learn more ↗</HoverCue>;
}
