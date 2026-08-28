import { phraseWrap, withPhraseBreaks } from "@/commons/Text";
import { parseLines } from "@/lib/phrase";

type PhraseProps = {
    /** 文節に分ける文言。配列を渡すと要素が <br /> 区切りの1行になる */
    children: string | readonly string[];
};

/**
 * 日本語テキストを文節単位で折り返す（BudouX）。**サーバーコンポーネント専用**。
 * クライアントコンポーネントから使うと BudouX のモデルがクライアントバンドルに載るため、
 * client 側（Typewriter）はパース済みの配列を props で受け取る。
 *
 * span に当てるので word-break / overflow-wrap は効くが text-align は効かない。
 * text-justify を打ち消したい場合は外側のブロック（Text）に text-left を足す。
 */
export function Phrase({ children }: PhraseProps) {
    const lines = typeof children === "string" ? [children] : children;
    return <span className={phraseWrap}>{withPhraseBreaks(parseLines(lines))}</span>;
}
