# WORK_LOG

ポートフォリオサイト初期構築の作業ログ。

## 1. Claude Design プロトタイプの取り込み

- Claude Design プロジェクト（`Portfolio Prototype.dc.html` / Frost & Blueprint デザインシステム）を取得。
- デザイントークン（色・タイポグラフィ・スペーシング・エフェクト・フォント）、コンポーネントバンドル（`_ds_bundle.js`）、README を参照。
- 3画面構成を把握: Home / Works（実績一覧）/ Coffee（BREW ケーススタディ）。プロトタイプでは state による疑似ページ切り替え。

## 2. 初回実装（Vite + React + TypeScript）

- Vite + React + react-router 構成で実装。
- デザイントークンを `src/styles/tokens/` に移植、DS コンポーネント8種を TypeScript 化。
- 疑似ページ切り替えを react-router の3ルート（`/`, `/works`, `/works/brew`）へ。
- `npm run build` 成功、preview で配信確認。

## 3. Next.js + Tailwind CSS v4 へ移行

方針: **既存 Vite 実装を置き換え / トークンは Tailwind テーマに統合**（ユーザー選択）。

- Vite 構成を削除し、Next.js (App Router) 構成へ再構築。
- デザイントークンを `app/globals.css` の `@theme` に統合し、`bg-navy` `font-display` `rounded-card` などのユーティリティとして使えるようにした（`tailwind.config.js` なしの CSS ファースト設定）。
- インライン style を Tailwind クラス化。半端な実数値は arbitrary value（`text-[14.5px]`）で再現。
- `"use client"` は `GlassCard`（マウス追従グロー＋クリック遷移）と `SiteNav`（`usePathname`）の2つに限定。ページ本体は Server Component、全ページ SSG。
- ルーティングを App Router の実 URL に変更（`app/page.tsx`, `app/works/page.tsx`, `app/works/brew/page.tsx`）。
- `npm run build` 成功、`npm run start` で3ルートすべて HTTP 200 を確認。
- 上位ディレクトリの `package-lock.json` 誤検出警告を `outputFileTracingRoot` で解消。

## 4. Docker + Make 開発環境

- `Dockerfile`（Node 24 Alpine / dev サーバー）、`compose.yaml`（サービス `app` / ポート3000 / バインドマウント + 匿名ボリューム / `WATCHPACK_POLLING=true`）、`.dockerignore`、`Makefile` を追加。
- Makefile ターゲット: `up` / `down` / `build` / `rebuild` / `logs` / `ps` / `sh` / `restart` / `install` / `clean` / `help`。`COMPOSE` 変数で v1（`docker-compose`）にも切替可。
- `make build` → `make up` で起動し、`/` と `/works` が HTTP 200、コンテナ稼働を確認。

## 5. Git 初期化・リモート連携

- `git init -b main` で初期化。コミット author はこのリポジトリのローカル設定で `user.email = meayubgm@gmail.com`（`user.name` はグローバルの `ayuha` を継承）。
- 初回コミット `fa8da03`（26ファイル。`node_modules` / `.next` は `.gitignore` で除外）。
- リモート `git@github.com:meayubgm/portfolio-site.git` へ `git push -u origin main`。upstream を `origin/main` に設定。

## 6. CLAUDE.md 追加

- `/init` により Claude Code 向けの `CLAUDE.md` を作成（Docker+Make フロー、`@theme` トークン統合、Client/Server 切り分けなど非自明な設計方針）。
- コミット `10fdfd1`（`docs: Claude Code 向けの CLAUDE.md を追加`）。

## 7. Next.js 16 LTS へアップグレード

- `next` を 15.1.6 → **16.2.10** へ。`react` / `react-dom` / `@types/*` も 19.2 系（19.2.7）に更新。依存解決はコンテナ内で実施。
- 破壊的変更の影響を精査: 動的ルート／`cookies`・`headers`・`searchParams`／`middleware`／`next/image`／parallel routes をいずれも未使用のため、async params 化・proxy リネーム・image 系仕様変更は非該当。
- Next.js 16 で `next lint` が廃止されたため `lint` スクリプトを削除（ESLint 設定は元々なく実質未使用）。
- `next build` 実行時に `tsconfig.json` が自動更新（`jsx: preserve` → `react-jsx`、`include` に `.next/dev/types/**/*.ts` 追加）。16 の必須変更のため受け入れ。
- Turbopack がデフォルト化。macOS の Docker Desktop（VirtioFS）ではバインドマウント経由でもファイル監視が効くことを実機確認（編集 → `✓ Compiled` を確認）。`WATCHPACK_POLLING` は Turbopack では参照されないため、`compose.yaml` のコメントを実態に合わせて更新。
- 検証: コンテナ内 `npm run build` 成功（3ルートすべて静的生成）、`/`・`/works`・`/works/brew` が HTTP 200。
- 既知の残課題: Next.js が内部依存する `postcss` の moderate 脆弱性2件。`audit fix --force` は next を 9 系へダウングレードするため未対応（Next 側の更新待ち。静的サイトかつ内部依存で実害は限定的）。

## 8. Biome（linter + formatter）導入

- ESLint/Prettier の代替として **Biome 2.5.3** を devDependency に固定版で追加（`--save-exact`）。依存解決・実行はコンテナ内（musl バイナリで Alpine 動作を確認）。
- `biome.json` を新規作成。既存スタイルに寄せて無用な差分を抑制（`indentStyle: space`/`indentWidth: 2`、`quoteStyle`/`jsxQuoteStyle: double`、`semicolons: always`、`lineWidth: 100`）。`vcs.useIgnoreFile` で `.gitignore` 尊重、`rules.preset: recommended`、import 整理を有効化。
- **Biome 対象外**: `app/globals.css`（Tailwind v4 の `@theme` 記法を CSS パーサが解釈できずパースエラー）と `tsconfig.json`（`next build` が自動整形し競合するため）を `files.includes` で除外。
- lint 指摘への対応: `useTemplate` 2件は手動でテンプレートリテラル化。`GlassCard` の a11y 2件（`noStaticElementInteractions` / `useKeyWithClickEvents`）はカード全体クリック遷移という意図的設計のため `biome-ignore` で局所抑制（理由コメント付き）。**本来はキーボード操作非対応の a11y 負債であり、別途改善が望ましい**。
- `package.json` に `lint`（`biome check`）/ `lint:fix`（`biome check --write`）、`Makefile` に `make lint` / `make lint-fix` を追加。
- 検証: `biome check` クリーン（19ファイル）、`npm run build` 成功、3ルート HTTP 200。
  - 注意: dev サーバー稼働中に本番 `npm run build` を回すと共有 `.next` が上書きされ dev が 500（`required-server-files.json` 欠落）になる。dev を `make restart` すれば復旧する。

## 9. ESLint（Next core-web-vitals）併用

- Biome が持たない **Next.js 固有ルール（Core Web Vitals 系）** をチェックするため ESLint を併用。役割分担は **Biome = 汎用 lint + format**、**ESLint = `@next/eslint-plugin-next` の core-web-vitals ルールのみ**（react/a11y は Biome に一任し重複回避。ユーザー選択）。
- devDependency 追加: `eslint`（10.6.0）/ `@next/eslint-plugin-next`（16.2.10）/ `@typescript-eslint/parser`（8.63.0）。実行はコンテナ内。
- `eslint.config.mjs`（Flat Config）を新規作成。`@next/eslint-plugin-next` の `configs["core-web-vitals"]`（既に Flat Config 形式・21ルール）をそのまま適用し、TSX パース用に `@typescript-eslint/parser` を設定（型情報なしの軽量構成）。`.next`/`out`/`build`/`next-env.d.ts` は ignore。
- `package.json`: `lint` = `biome check && eslint . --max-warnings 0`（warning も失敗扱いにして CWV 違反を確実に検出）、`lint:fix` = `biome check --write && eslint . --fix`。`Makefile` の `make lint` / `make lint-fix` は npm script 経由で自動的に両ツール実行。
- 検証: `eslint .` がクリーン完走（既存は `<img>` 不使用のため指摘0）、`--print-config` で `@next/next/*` 21ルールのロードを確認、標準入力の `<img>` で `no-img-element`（warning）検知を実証。`npm run lint` で Biome + ESLint 両方が走り exit 0、`npm run build` 成功。

## 10. TypeScript 6.0 へアップグレード

- `typescript` を 5.9.3（`^5.7.3` 表記）→ **6.0.3**（`^6.0.3`）へ。最新は 7.0.2（Go ネイティブ）だが、typescript-eslint 8.63 の peer が `typescript <6.1.0` で **TS7 は非対応**のため、ESLint を壊さない安定版 6 系を採用（ユーザー判断）。
- 6.0.3 は typescript-eslint の peer 範囲内のため **typescript-eslint は変更不要・ESLint 維持**。
- 検証（6.0 は breaking change を含む移行版のため実測）: `npx tsc --noEmit` exit 0（型エラーなし）、`npm run build` 成功（型チェック込み SSG）、`npm run lint`（Biome + ESLint）通過、3ルート HTTP 200。全て合格し採用。

## 11. Playwright 導入（E2E テスト + MCP）

- テストフレームワーク未導入だった状態に対し、**E2E テストとして Playwright（`@playwright/test`）を主軸に導入**。加えて **Playwright MCP** を探索的確認の補助として設定（ユーザー選択＝両方）。
- **実行環境の判断**: 開発コンテナ（`node:24-alpine`）は Playwright のブラウザ非対応（musl 依存で追加セットアップ要）。よってブラウザは**ホスト（macOS）で実行**し、`compose.yaml` が公開する `http://localhost:3000` を叩く構成に。コンテナ側は一切変更なし。`@playwright/test` は JS のみのため `devDependencies` に追加しても alpine コンテナに無害（ブラウザは `playwright install` を明示実行しない限り落ちてこない）。
- `playwright.config.ts` 新規: `testDir: e2e`、`baseURL: http://localhost:3000`、`projects` は **Chromium + WebKit**（フロントエンドのポートフォリオゆえクロスブラウザ担保に意味あり）。`webServer` は `reuseExistingServer: true` で、`make up` が :3000 を占有していれば再利用、未起動時や CI（Linux）では `npm run build && npm run start` でフォールバック起動。
- テスト `e2e/`: `smoke.spec.ts`（3ルートの 200 表示・`<title>`・主要見出し）、`navigation.spec.ts`（`SiteNav` の遷移と active 判定 text-navy/text-slate、`GlassCard` の href カード全体クリック遷移、BREW→works 戻り）。セレクタは role / accessible name ベースを優先。
- `.mcp.json` 新規: `@playwright/mcp`（`npx -y @playwright/mcp@latest`）をプロジェクトスコープで登録。既存の `claude-in-chrome` とは別系統、役割は対話的確認に限定。
- 既存ファイル編集: `tsconfig.json` の `exclude` に `e2e` / `playwright.config.ts`（`include: **/*.ts` による `next build` 型チェック巻き込み回避）。`package.json` に `test:e2e` 系 scripts。`Makefile` に `make test-e2e`（ホスト実行）。`.gitignore` / `.dockerignore` に Playwright 生成物を追加。
- 検証: ホストで `npm install` → `npx playwright install chromium webkit` → `make up` → `npx playwright test`（Chromium/WebKit 全 spec グリーン）。`npm run build`（型チェック込み SSG）と `npm run lint`（Biome + ESLint）が非破壊で通過することも確認。

## 未対応・注意点

- Home の「連絡する」ボタン、Email / GitHub / デモ / リポジトリのリンク先は `href="#"` のまま。
- ケーススタディ内の GIF はプレースホルダー（`MediaPlaceholder`）。
- E2E テストは Playwright を導入済み（§11。ホスト実行・Chromium/WebKit）。ユニット/コンポーネントテストは未導入。型チェックは `npm run build` に含まれる。
- Next.js 内部依存 `postcss` の moderate 脆弱性2件は Next 側の更新待ち（`audit fix --force` はダウングレードになるため実行しない）。
- `GlassCard` のカード全体クリック遷移はキーボード操作非対応（a11y 負債・`biome-ignore` で抑制中）。role/tabIndex/onKeyDown での改善は別課題。
