/** Home（/）ヒーローのテキストと、タイピング演出のスケジュール */

import { parseLines } from "@/lib/phrase";

/** 各ブロックの文言。配列の要素は <br /> 区切りの1行 */
export const heroCopy = {
    eyebrow: ["design × development"],
    title: ["意図を汲みとって、かたちにする"],
    mono: ["Megumi Ayuha / Web Design × Frontend Development — Portfolio"],
    lead: [
        "ご覧いただきありがとうございます。",
        "デザイン理解を強みにしたフロントエンド実装、常にユーザビリティを意識したUI改善を大切にして開発に向き合っています。",
        "指示を受けた要件をそのまま実装するのではなく、指示の意図を汲み取ってより使いやすいUIを提案します。",
    ],
} as const;

/**
 * Typewriter に渡す「行 × 文節」。BudouX でビルド時にパースする。
 * client の Typewriter に BudouX を持ち込まないよう、パースはここ（サーバー側）で済ませる。
 * **この module を import できるのはサーバーコンポーネントだけ**。
 */
export const heroPhrases = {
    eyebrow: parseLines(heroCopy.eyebrow),
    title: parseLines(heroCopy.title),
    mono: parseLines(heroCopy.mono),
    lead: parseLines(heroCopy.lead),
} as const;

/** 1文字あたりの間隔（ms）。長い本文ほど速くして待たせない */
const SPEED = { eyebrow: 45, title: 65, mono: 25, lead: 18 } as const;

/** h1 は eyebrow の打ち終わりを待たず、この分だけ遅れて重なって始まる */
const TITLE_OVERLAP_DELAY = 350;
/** 見出し2つが打ち終わってから本文ブロックが始まるまでの間 */
const BODY_GAP = 200;

/** 打ち込みにかかる時間の計算に使う総文字数。Typewriter は改行も1文字として打つ */
const charCount = (lines: readonly string[]) => lines.join("\n").length;

const eyebrowEnd = charCount(heroCopy.eyebrow) * SPEED.eyebrow;
const titleEnd = TITLE_OVERLAP_DELAY + charCount(heroCopy.title) * SPEED.title;
const bodyStart = Math.max(eyebrowEnd, titleEnd) + BODY_GAP;

/**
 * Typewriter に渡す { delay, speed }。
 * 文言が静的なので、実行時のコールバック連鎖ではなく文字数から静的に算出する。
 */
export const heroTyping = {
    eyebrow: { delay: 0, speed: SPEED.eyebrow },
    title: { delay: TITLE_OVERLAP_DELAY, speed: SPEED.title },
    // mono行と本文は同時に打ち始める
    mono: { delay: bodyStart, speed: SPEED.mono },
    lead: { delay: bodyStart, speed: SPEED.lead },
} as const;

/**
 * ヒーローの正多面体（components/HeroGeometry.tsx）が組み上がる尺。
 * h1 の打ち終わりで図形も完成するよう、titleEnd をそのまま尺にする。
 * 文言を変えれば打ち込みと同じように追従する。
 */
export const heroGeometryBuild = { delay: 0, duration: titleEnd } as const;

/** ボタン列が浮き上がり始めるまでの時間（ms）。打ち終わりの直後に続ける */
export const heroActionsDelay =
    bodyStart +
    Math.max(charCount(heroCopy.mono) * SPEED.mono, charCount(heroCopy.lead) * SPEED.lead) +
    150;
