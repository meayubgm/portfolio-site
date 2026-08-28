/**
 * 日本語テキストを文節に分ける（BudouX）。
 *
 * 結果は <wbr> の挿入位置になり、word-break: keep-all と組で「文節の途中で折り返さない」
 * 表示を作る（commons/Text.tsx の phraseWrap / withPhraseBreaks）。
 *
 * 全ページ SSG なのでパースはビルド時に終わる。**この module をクライアントコンポーネントから
 * import しないこと**（BudouX のモデルがクライアントバンドルに載る）。入口は commons/Phrase.tsx。
 */
import { loadDefaultJapaneseParser } from "budoux";

// パーサはモデルを読み込むので1度だけ生成する
const parser = loadDefaultJapaneseParser();

/**
 * BudouX が途中で切ってしまう語。**この語の内部には改行位置を作らず、語の前後には作る**。
 * 語そのものを1文節として扱うので、長い複合語はここに「切ってよい単位」で登録する
 * （例: 「水産卸会社向け倉庫管理システム開発」は既定だと「水産卸 / 会社向け〜」で切れる）。
 * **語同士が重なるものは登録しないこと**（後から処理した語が境界を足し直し、
 * 先の語の内部に改行位置が戻る）。
 */
const NO_BREAK_WORDS = [
    "水産卸会社向け",
    "建設業向け",
    "卸売業向け",
    "クラウドストレージ",
    "お問い合わせ",
    "私自身について",
];

/** 文節の区切り位置（先頭からの文字数）を NO_BREAK_WORDS に合わせて直す */
function applyNoBreakWords(phrases: string[]): string[] {
    const line = phrases.join("");
    const boundaries = new Set<number>();
    let at = 0;
    for (const phrase of phrases.slice(0, -1)) {
        at += phrase.length;
        boundaries.add(at);
    }

    for (const word of NO_BREAK_WORDS) {
        // 空文字は indexOf が常に同じ位置を返して while が進まないので弾く
        if (!word) {
            continue;
        }
        let from = line.indexOf(word);
        while (from !== -1) {
            const to = from + word.length;
            // 語の内部の区切りを消し、語の前後は区切れるようにする
            for (let i = from + 1; i < to; i++) {
                boundaries.delete(i);
            }
            if (from > 0) {
                boundaries.add(from);
            }
            if (to < line.length) {
                boundaries.add(to);
            }
            from = line.indexOf(word, to);
        }
    }

    const result: string[] = [];
    let start = 0;
    for (const boundary of [...boundaries].sort((a, b) => a - b)) {
        result.push(line.slice(start, boundary));
        start = boundary;
    }
    result.push(line.slice(start));
    return result;
}

/** 1行を文節に分ける */
export const parsePhrases = (line: string): string[] => applyNoBreakWords(parser.parse(line));

/** 行配列を「行 × 文節」の2次元配列にする */
export const parseLines = (lines: readonly string[]): string[][] => lines.map(parsePhrases);
