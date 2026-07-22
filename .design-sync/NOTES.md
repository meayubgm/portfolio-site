# design-sync NOTES（portfolio-site → Frost & Blueprint Design System）

このリポジトリは**コンポーネントライブラリではなく Next.js アプリ**なので、変換器の
happy path（dist + .d.ts）から外れる。以下の仕掛けで同期している。

## 構成の要点

- **synth-entry**: dist が無いので `.design-sync/entry.ts` が 9 コンポーネントを再 export し、
  `--entry .design-sync/entry.ts` で渡す。これが PKG_DIR をリポジトリルートに解決させる
  役目も兼ねる（`package.json` の name を walk-up で発見）。
- **Next 依存の stub**: `GlassCard`（useRouter）・`SiteNav`（usePathname + next/link）・
  `Button`（href 時 next/link）はデザインペインで throw する。`.design-sync/sync-tsconfig.json`
  の `paths` で `next/link`・`next/navigation` を `.design-sync/stubs/*` へ差し替え
  （esbuild は cfg.tsconfig の paths を専用プラグインで解決する）。
- **Tailwind の静的コンパイル**: デザインペインに Tailwind ランタイムは無いので、
  `.design-sync/compile-css.mjs` が `app/globals.css` を `@tailwindcss/postcss` で
  コンパイルし `.design-sync/compiled-styles.css` を生成、`cfg.cssEntry` に指定。
  **このファイルは gitignore 対象**なので、**再同期前に必ず再生成すること**。
- **render check / capture のブラウザ**: `~/.cache/ms-playwright` にビルドが無い。
  `DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` を
  環境変数で渡してシステム Chrome を使う（playwright-core は導入済み）。
- **group は `general`**: コンポーネントが `components/` 直下にあり、汎用ディレクトリ名は
  グループ化から除外されるため。旧プロトタイプは `core` だった。`core` に揃えたい場合は
  各コンポーネントに `cfg.docsMap` のフロントマター stub（`---\ncategory: core\n---`）が必要。

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
- Tailwind のコンテンツ走査は `components/` と `app/` を `@source` で明示している
  （compile-css.mjs 内）。走査対象ディレクトリが増えたら `@source` を追加する。

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
