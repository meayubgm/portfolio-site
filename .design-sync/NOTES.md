# design-sync NOTES（portfolio-site → Frost & Blueprint Design System）

> 2026-08-29 再同期: DS プリミティブ10件が `commons/` へ移っていたのに `componentSrcMap` /
> `entry.ts` / `compile-css.mjs` が `components/` を指したままだったのを修正。副作用として
> **グループが `commons`(10) と `general`(3) の2つに分かれた**（この形で確定）。
> 書込 73 / 削除 42（旧 `components/general/` の10件ぶん40 + `guidelines/` 2）。
> 検証は 12 が verified-by-upload でスキップ、`LabeledField` のみ再採点（good）。

> 2026-07-23 再同期: リファクタリングで追加された 4 コンポーネント
> （PageHeading / CardGrid / LabeledField / MonoHeading）を追加し **13 コンポーネント構成**に。
> 全 13 を再検証・再アップロード（styleSha 変更のため全件 changed 扱い）。削除 0。

このリポジトリは**コンポーネントライブラリではなく Next.js アプリ**なので、変換器の
happy path（dist + .d.ts）から外れる。以下の仕掛けで同期している。

## 構成の要点

- **synth-entry**: dist が無いので `.design-sync/entry.ts` が 13 コンポーネントを再 export し、
  `--entry .design-sync/entry.ts` で渡す。これが PKG_DIR をリポジトリルートに解決させる
  役目も兼ねる（`package.json` の name を walk-up で発見）。
- **Next 依存の stub**: `GlassCard`（useRouter）・`SiteNav`（usePathname + next/link +
  next/image）・`Button`（href 時 next/link）はデザインペインで throw する。
  `.design-sync/sync-tsconfig.json` の `paths` で `next/link`・`next/navigation`・
  `next/image` を `.design-sync/stubs/*` へ差し替え
  （esbuild は cfg.tsconfig の paths を専用プラグインで解決する）。
  **next/image を stub しないとバンドル全体が `process is not defined` で全滅する**
  （本物の next/image が process.env.NEXT_* を参照するため）。2026-07-23 に遭遇・解決。
- **Tailwind の静的コンパイル**: デザインペインに Tailwind ランタイムは無いので、
  `.design-sync/compile-css.mjs` が `app/globals.css` を `@tailwindcss/postcss` で
  コンパイルし `.design-sync/compiled-styles.css` を生成、`cfg.cssEntry` に指定。
  **このファイルは gitignore 対象**なので、**再同期前に必ず再生成すること**。
- **render check / capture のブラウザ**: `~/.cache/ms-playwright` にビルドが無い。
  `DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` を
  環境変数で渡してシステム Chrome を使う（playwright-core は導入済み）。
- **group は `commons`（10件）と `general`（3件）の2つ**。グループ名はソースの
  ディレクトリ名から決まり、`components/` のような汎用名は除外されて `general` に落ちる。
  DS プリミティブが `commons/` にあるので `commons` グループができ、`components/` 直下に
  残る `PageHeading` / `SiteNav` / `SkillBar` だけが `general` になる。**2026-08-29 に
  この2分割で確定**（ユーザー判断。リポジトリの依存の向き `commons/` ← `components/` が
  そのままペインに出る）。1つに統一したい場合は各コンポーネントに `cfg.docsMap` の
  フロントマター stub（`---\ncategory: <Group>\n---`）が13件ぶん必要。
- **`guidelinesGlob` は空配列**。既定（`docs/*.md` ほか）だとリポジトリの `docs/` にある
  ローカル作業メモまで `guidelines/` に載る。**2026-08-29 にユーザー判断で `[]` に固定**し、
  リモートの `guidelines/` は削除した。ガイドラインを載せるなら送ってよい文書だけを
  明示的に glob で指すこと。
- **`componentSrcMap` / `entry.ts` / `compile-css.mjs` の3箇所はディレクトリ構成に連動する**。
  DS プリミティブが `commons/` へ移ったとき、この3つが `components/` を指したまま陳腐化した
  （2026-08-29 に修正）。コンポーネントを別ディレクトリへ動かしたら必ず3つとも直す。
  compile-css.mjs の `@source` が漏れると**ビルドも検証も通るのに CSS だけが欠ける**
  （このときは 35KB → 53KB、クラスセレクタ 237 → 432 の差だった）。

## Known render warns（再同期時に「新規」と誤認しないこと）

- `[FONT_REMOTE]` "JetBrains Mono" / "Inter" / "Space Grotesk" / "IBM Plex Sans JP" —
  globals.css の Google Fonts `@import url(...)` によるランタイム読込。対応不要。
- `tokens: N defined, M referenced (3 missing, below threshold)` — 非ブロッキング。

## 同期先プロジェクトの注意（atomic path・アンカー無し前提だった）

- 同期先 `Frost & Blueprint Design System`（projectId は config.json）は**実制作物と共存**する:
  - **`ui_kits/portfolio/**` と `uploads/**` はユーザーが Claude Design 上で作った制作物。
    絶対に削除しないこと。**
  - `_ds_manifest.json` / `_adherence.oxlintrc.json` はアプリが再生成する管理ファイル。触らない。
  - `readme.md`（小文字）が旧プロトタイプから残存。`README.md`（大文字・変換器出力）と共存。
    case 衝突での「書込後削除」事故を避けるため削除対象から**あえて外している**。
- 初回同期では旧レイアウト（`components/core/**`）・旧 `guidelines/**`・旧 `tokens/**` を削除した。
  以降はアンカー（`_ds_sync.json`）があるので driver の diff が削除を導出する。

## Re-sync risks（次回同期で静かに陳腐化しうる点）

- **compiled-styles.css の再生成忘れ**が最大のリスク。gitignore 済みなので、
  `node .design-sync/compile-css.mjs .` を **package-build の前に必ず実行**。
  これを怠ると古い（または存在しない）CSS で同期してしまう。
- **stub の陳腐化**: `.design-sync/stubs/next-*.ts` は next の API 変更に追随しない。
  コンポーネントが next の別 API を使い始めたら stub を追記する。
- Tailwind のコンテンツ走査は `commons/` と `components/` と `app/` を `@source` で明示している
  （compile-css.mjs 内）。走査対象ディレクトリが増えたら `@source` を追加する。
- **`conventions.md` はコードの変化から静かにずれる**。デザインエージェントのシステム
  プロンプトに入るので、ずれた記述はそのまま誤作動になる。再同期のたびに、そこで名指し
  しているユーティリティ・トークン・コンポーネント名・パスを**ビルド成果物と突き合わせる**
  こと。2026-08-29 には `rounded-btn` / `rounded-tag`（arbitrary value を廃したリファクタで
  消滅。ボタン・タグは標準の `rounded-lg`）と、`components/general/<Name>/` という固定パスの
  2箇所がずれていた。
- **`DesignSync` は claude.ai アカウントの design-system 認可が要る**。切れていると
  `get_project` などが認可エラーを返す。`/design-login` で通る（環境変数やスキルの
  有効・無効とは別の話）。

## 再同期の手順

```sh
# 0) ステージ済みスクリプトを再コピー（instructions 更新に追随）
BASE="<design-sync skill base>/"
cp -r "$BASE"/package-*.mjs "$BASE"/resync.mjs "$BASE"/lib "$BASE"/storybook .ds-sync/
(cd .ds-sync && npm i esbuild ts-morph @types/react)   # 依存が無ければ

# 1) Tailwind を再コンパイル（必須）
node .design-sync/compile-css.mjs .

# 2) ビルド → 検証 → 採点（システム Chrome を使用）
export DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
node .ds-sync/package-build.mjs --config .design-sync/config.json \
  --node-modules ./node_modules --entry .design-sync/entry.ts --out ./ds-bundle
node .ds-sync/package-validate.mjs ./ds-bundle
node .ds-sync/package-capture.mjs --out ./ds-bundle   # 変更が無ければ全て carried forward

# 3) driver で差分アップロード（アンカーを取得してから）
#    DesignSync(get_file, path:"_ds_sync.json") → .design-sync/.cache/remote-sync.json
node .ds-sync/resync.mjs --config .design-sync/config.json \
  --node-modules ./node_modules --entry .design-sync/entry.ts \
  --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json
```
