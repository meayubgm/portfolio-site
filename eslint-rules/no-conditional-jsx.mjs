// プロジェクト独自の ESLint ルール。
// 「JSX で要素を出しわける場合は三項演算子を避け、早期 return や変数への切り出しを優先する」
// というコーディング規約を機械的に検出する（文字列など短い値の三項は対象外）。

const isJsx = (node) => node.type === "JSXElement" || node.type === "JSXFragment";

export const noConditionalJsx = {
    meta: {
        type: "suggestion",
        docs: { description: "要素の出しわけに三項演算子を使わない" },
        messages: {
            noConditionalJsx:
                "要素の出しわけに三項演算子を使わないでください（早期 return / 変数への切り出し / 論理積 && を使う）。文字列など短い値の出しわけは三項演算子で構いません。",
        },
        schema: [],
    },
    create(context) {
        return {
            ConditionalExpression(node) {
                if (isJsx(node.consequent) || isJsx(node.alternate)) {
                    context.report({ node, messageId: "noConditionalJsx" });
                }
            },
        };
    },
};
