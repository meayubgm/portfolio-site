import { type ComponentPropsWithoutRef, type ElementType, Fragment } from "react";
import { cn } from "@/lib/cn";

/**
 * サイズ・行間・ウェイトの組み合わせ。値はすべて Tailwind 標準スケール。
 * クラス文字列が必要な箇所（ul / input 等）向けに export している。
 *
 * 段落用の lead / body には text-justify を含める。日本語の折り返しで右端が
 * ガタつくのを防ぐため。折り返しの起きない span 用途では効果が出ないだけで害はない。
 */
export const textStyles = {
    // 本文（font-body）
    /** ページ / カードのリード文・ケーススタディ本文（16px / 1.75） */
    lead: "text-base/7 text-justify",
    /** 通常の本文（14px / 1.71） */
    body: "text-sm/6 text-justify",
    /** 補足・注記・小ラベル（12px / 1.67） */
    note: "text-xs/5",

    // 見出し（font-display）
    /** featured カードの見出し（24px） */
    featureTitle: "font-display text-2xl font-semibold",
    /** カード見出し（20px） */
    cardTitle: "font-display text-xl font-semibold",
    /** カード冒頭の大きめリード（20px / 1.6） */
    cardLead: "font-display text-xl/8 font-medium",
    /** カード内の小見出し（18px） */
    subTitle: "font-display text-lg font-semibold",
    /** リンク行（16px） */
    rowTitle: "font-display text-base",
    /** フォームのラベル（14px） */
    formLabel: "font-display text-sm",
    /** font-body のまま太字にする小見出し（14px） */
    labelStrong: "text-sm font-semibold",

    // mono ラベル
    monoLg: "font-mono text-base",
    monoMd: "font-mono text-sm",
    monoSm: "font-mono text-xs",
} as const;

/** 文字色。className でも上書きできるが、既定はこの4段 + エラー用の danger */
export const toneStyles = {
    strong: "text-slate-900",
    default: "text-slate-600",
    muted: "text-slate-500",
    accent: "text-indigo-600",
    danger: "text-red-500",
} as const;

export type TextVariant = keyof typeof textStyles;
export type TextTone = keyof typeof toneStyles;

type TextOwnProps<T extends ElementType> = {
    /** 描画する要素（既定は p） */
    as?: T;
    variant?: TextVariant;
    tone?: TextTone;
    className?: string;
};

type TextProps<T extends ElementType> = TextOwnProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof TextOwnProps<T>>;

/**
 * サイト内のテキストはこのコンポーネント経由で描く。
 * サイズ・行間・色の選択肢を variant / tone に閉じ込め、arbitrary value の乱立を防ぐ。
 */
export function Text<T extends ElementType = "p">({
    as,
    variant = "body",
    tone = "default",
    className,
    ...rest
}: TextProps<T>) {
    const Component = (as ?? "p") as ElementType;
    return <Component className={cn(textStyles[variant], toneStyles[tone], className)} {...rest} />;
}

/** 行配列を <br /> 区切りの ReactNode にする（Text の children に渡して使う） */
export function withLineBreaks(lines: string[]) {
    const [firstLine, ...restLines] = lines;
    return (
        <>
            {firstLine}
            {restLines.map((line, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: 行の並びは固定で並べ替えない
                <Fragment key={index}>
                    <br />
                    {line}
                </Fragment>
            ))}
        </>
    );
}

/**
 * 文節改行の面。日本語は既定でどこでも折り返せるので、まず keep-all で任意改行を止め、
 * <wbr>（withPhraseBreaks が文節境界に置く）の位置だけ改行を許す。
 * wrap-break-word（overflow-wrap: break-word）は1文節が行幅を超えたときの保険。
 * overflow-wrap: anywhere は min-content 幅にも効いてグリッドの列幅を変えるので使わない。
 *
 * **overflow-wrap 側に旧名の break-words を使わないこと**。tailwind-merge は
 * break-normal / break-words / break-all / break-keep を1つの衝突グループとして扱うため、
 * cn() を通すと "break-keep break-words" から break-keep が落ちて word-break: normal になる
 * （＝任意位置で折り返す）。v4.1 以降の wrap-break-word なら別グループなので共存できる。
 */
export const phraseWrap = "break-keep wrap-break-word";

/**
 * 「行 × 文節」を <br />（行間）と <wbr />（文節間）区切りの ReactNode にする。
 * <wbr> はテキストを持たないので textContent もアクセシブルネームも変わらない。
 * 文節への分割は commons/Phrase.tsx（サーバー）が行う。ここは描画だけの純粋関数で、
 * クライアントコンポーネント（Typewriter）からも使うため BudouX を import しない。
 *
 * typedCount を渡すと、そこから先を visibility:hidden で場所だけ確保して描く（Typewriter 用）。
 * **打ち込み途中のテキストを素直に切り出すと、行末の文節が「1〜2文字ぶんは前の行に収まる →
 * 伸びて入りきらなくなった瞬間に次の行へ飛ぶ」という跳ね方をする**。未入力ぶんの場所を先に
 * 確保しておけば折り返しは常に完成形と同じで、文字はその位置に現れるだけになる。
 */
export function withPhraseBreaks(lines: readonly (readonly string[])[], typedCount?: number) {
    // 改行も1文字として消費する（Typewriter が打ち込み位置を数えるときと桁を合わせる）
    let left = typedCount ?? Number.POSITIVE_INFINITY;
    return lines.map((phrases, lineIndex) => {
        if (lineIndex > 0) {
            left -= 1;
        }
        return (
            // biome-ignore lint/suspicious/noArrayIndexKey: 行の並びは固定で並べ替えない
            <Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {phrases.map((phrase, phraseIndex) => {
                    const typed = Math.min(phrase.length, Math.max(0, left));
                    left -= phrase.length;
                    const shown = phrase.slice(0, typed);
                    const pending = phrase.slice(typed);
                    return (
                        // biome-ignore lint/suspicious/noArrayIndexKey: 文節の並びは固定で並べ替えない
                        <Fragment key={phraseIndex}>
                            {phraseIndex > 0 && <wbr />}
                            {shown}
                            {pending && <span className="invisible">{pending}</span>}
                        </Fragment>
                    );
                })}
            </Fragment>
        );
    });
}
