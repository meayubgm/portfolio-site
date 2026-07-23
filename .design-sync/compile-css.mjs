// Tailwind v4 の globals.css を静的 CSS へコンパイルして design-sync の
// cfg.cssEntry 用に書き出す。デザインペインは Tailwind ランタイムを持たないため、
// components/ と app/ を走査して使用ユーティリティを全て具体化した CSS が必要。
//
// 出力: .design-sync/compiled-styles.css（gitignore 対象・再同期のたびに再生成）
// 実行: node .design-sync/compile-css.mjs [repo-root]  （repo-root 既定は cwd）

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";

const root = resolve(process.argv[2] || ".");

// globals.css は @import "tailwindcss" を含むので、それを取り込んだうえで
// 走査対象（components / app）を @source で明示する薄いエントリを作る。
const entry = [
    '@import "./app/globals.css";',
    '@source "./components";',
    '@source "./app";',
    "",
].join("\n");

const result = await postcss([tailwind()]).process(entry, {
    // from はディスク上に無くてよい。@import / @source の相対解決の基点になる。
    from: resolve(root, "_ds_tw_entry.css"),
    to: undefined,
});

const outPath = resolve(root, ".design-sync/compiled-styles.css");
writeFileSync(outPath, result.css);
console.log(`wrote ${outPath} (${result.css.length} bytes)`);
