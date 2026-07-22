# セッションサマリー: Claude Design（/design-sync）への初回同期

- 日時: 2026-07-22 16:58
- プロジェクト: portfolio-site（/Users/meayu/development/portfolio-site）

## 目的

`/design-sync` を実行し、この repo の Frost & Blueprint コンポーネントを claude.ai/design の
デザインシステムプロジェクトへ**初回同期**する。前回セッションで「連携は下地まで、同期本体は
別タスク」と整理していた本体作業を実施する。制約: この repo は**コンポーネントライブラリでは
なく Next.js アプリ**（dist 無し・一部が Next 依存）のため、変換器の happy path を外れる。

## 実施内容

### 0. 探索・方針確認
- `.design-sync/config.json` 無し → **初回同期**と判定。Storybook 無し・`package-lock.json` →
  **package shape / npm**。`components/` に 9 コンポーネント（うち `GlassCard`/`SiteNav`/`Button`
  が `next/link`・`next/navigation` に依存）。dist 無し・フォントは globals.css の Google Fonts
  `@import`（リモート）・スタイルは Tailwind v4（`@theme`）と確認。
- AskUserQuestion で方針決定 →「**フルで高忠実度同期**」「同期先は**既存プロジェクト
  『Frost & Blueprint Design System』へ再同期**」「プレビューは**全 9 コンポーネント作り込む**」
  「Next 結合の 2 つ（GlassCard/SiteNav）は**stub 化して含める**」。

### 1. 変換機構のセットアップ（off-script 対応）
- スクリプトを `.ds-sync/` へステージし `esbuild ts-morph @types/react` を導入。
- **Next stub**: `.design-sync/stubs/next-link.ts`・`next-navigation.ts` を作成し、
  `.design-sync/sync-tsconfig.json` の `paths` で `next/link`・`next/navigation` を差し替え
  （esbuild は `cfg.tsconfig` の paths を専用プラグインで解決）。
- **synth-entry**: dist が無いため `.design-sync/entry.ts` で 9 コンポーネントを再 export し、
  `--entry` で渡す（PKG_DIR をリポジトリルートへ解決させる役割も兼ねる）。
- **Tailwind 静的コンパイル**: `.design-sync/compile-css.mjs`（`@tailwindcss/postcss`）で
  `app/globals.css` を静的 CSS 化 → `.design-sync/compiled-styles.css` を生成し `cfg.cssEntry` に指定。
- `.design-sync/config.json` を確定（projectId / shape / pkg / globalName=FrostBlueprint /
  entry / tsconfig / cssEntry / componentSrcMap 9 件 / overrides.SiteNav / readmeHeader）。
- `.gitignore` に design-sync の生成物・キャッシュ・`compiled-styles.css` を追加。

### 2. ビルド・プレビュー author・検証
- 変換器実行 → 9 コンポーネントを `components/general/<Name>/` に生成（bundle 12KB、
  next stub により inlined npm 0）。
- **全 9 コンポーネントのプレビュー**を `.design-sync/previews/<Name>.tsx` に author
  （ポートフォリオのトーンでリアルな内容・各 2〜4 セル）。SiteNav は `overrides` で
  `cardMode: single`。
- render check（`DS_CHROMIUM_PATH` でシステム Chrome 使用）→ **9/9 クリーン**。
- per-cell capture → 9 コンポーネント全セルの review シートを目視確認し、
  `.design-sync/.cache/review/<Name>.grade.json` に**全て `good`** で採点。
- `.design-sync/conventions.md`（design agent 向け規約ヘッダ）を author し `readmeHeader` に配線 →
  再ビルドで README に反映。再 validate 9/9 クリーン・再 capture 全件 carried forward（決定的）。

### 3. アップロード（atomic path・アンカー無し）
- `report_validate`（total 9 / bad 0）送信。
- `finalize_plan` → §5 順序でアップロード: センチネル先行 → 本体 51 → 削除 41 → センチネル再アーム
  → `_ds_sync.json` 最後。
- **削除**: 旧 `components/core/**`（25）・旧 `guidelines/**`（11）・旧 `tokens/**`（5）。
- **保持**: `ui_kits/portfolio/**`・`uploads/portfolio-mockup-D3.html`（ユーザー実制作物）、
  `_ds_manifest.json`・`_adherence.oxlintrc.json`（アプリ管理）。`readme.md`（小文字）は
  case 衝突事故回避のため削除せず `README.md` と共存。
- `list_files` で最終状態を検証（9 コンポーネント + preview/vendor + 保持物、旧レイアウト消滅）。
- `.design-sync/NOTES.md` に構成の要点・Known render warns・Re-sync risks・再同期手順を記録。

## 主な決定事項

- **既存プロジェクトへ再同期**（新規作成せず）: repo が元にしたプロトタイプと同一プロジェクトを
  実コードベース版で更新。上書き/削除リスクはユーザーが了承済み。
- **Next 依存は stub 化して全 9 コンポーネント同期**: プロバイダ注入ではなく tsconfig paths で
  `next/link`・`next/navigation` をダミーへ差し替え（デザインペインでの throw を回避）。
- **Tailwind はビルド時に静的コンパイル**: デザインペインに Tailwind ランタイムが無いため。
  出力 CSS は gitignore し、再同期前に `compile-css.mjs` で再生成する運用。
- **render check/capture はシステム Chrome**（`DS_CHROMIUM_PATH`）: ms-playwright キャッシュ無し・
  200MB ダウンロード回避。
- **グループは `general`**: コンポーネントが `components/` 直下にあり自動導出の結果。旧は `core`。

## 未完了・残タスク

- **グループ名**: 現状 `general`。旧プロトタイプ準拠の `core` に揃えるには各コンポーネントへ
  category stub（`docsMap`）が必要。ユーザー確認待ち（希望あれば対応）。
- **README への design-sync ワークフロー追記**: 新規ワークフローのため自動追記せず。追記の要否は
  ユーザー提案として保留（「ディレクトリ構成」に `.design-sync/` を載せるかも含む）。
- **同期入力一式のコミット**: `.design-sync/` の durable 17 ファイル + `.gitignore` 更新が未コミット。
  次回再同期の高速化のためコミット/PR を推奨（ユーザー依頼待ち）。

## 動作確認の状況

- **変換器ビルド**: 成功（9 コンポーネント / bundle 12KB / next stub で inlined npm 0 / synth-entry）。
- **render check**: `package-validate` 9/9 クリーン、ハード失敗なし。警告は `[FONT_REMOTE]`（対応不要）と
  tokens 3 missing（閾値以下・非ブロッキング）のみ。
- **grading**: 9 コンポーネント全セルの review シートを目視確認 → 全て `good`。README ヘッダ反映後の
  再 capture は全件 carried forward（決定的で再現可能）。
- **アップロード検証**: `list_files` で 9 コンポーネント（`components/general/*`）・`_preview`/`_vendor`・
  README/styles/bundle/`_ds_sync.json` を確認。実制作物（`ui_kits/`・`uploads/`）とアプリ管理ファイルの
  保持、旧 `components/core`・旧 `guidelines`・旧 `tokens` の消滅を確認。
- 同期先: https://claude.ai/design/p/a3f0969e-d51c-40d2-8898-a174b9532461
