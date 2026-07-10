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

- `Dockerfile`（Node 20 Alpine / dev サーバー）、`docker-compose.yml`（サービス `app` / ポート3000 / バインドマウント + 匿名ボリューム / `WATCHPACK_POLLING=true`）、`.dockerignore`、`Makefile` を追加。
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
- Turbopack がデフォルト化。macOS の Docker Desktop（VirtioFS）ではバインドマウント経由でもファイル監視が効くことを実機確認（編集 → `✓ Compiled` を確認）。`WATCHPACK_POLLING` は Turbopack では参照されないため、`docker-compose.yml` のコメントを実態に合わせて更新。
- 検証: コンテナ内 `npm run build` 成功（3ルートすべて静的生成）、`/`・`/works`・`/works/brew` が HTTP 200。
- 既知の残課題: Next.js が内部依存する `postcss` の moderate 脆弱性2件。`audit fix --force` は next を 9 系へダウングレードするため未対応（Next 側の更新待ち。静的サイトかつ内部依存で実害は限定的）。

## 未対応・注意点

- Home の「連絡する」ボタン、Email / GitHub / デモ / リポジトリのリンク先は `href="#"` のまま。
- ケーススタディ内の GIF はプレースホルダー（`MediaPlaceholder`）。
- テストフレームワークは未導入（型チェックは `npm run build` に含まれる）。
- Next.js 内部依存 `postcss` の moderate 脆弱性2件は Next 側の更新待ち（`audit fix --force` はダウングレードになるため実行しない）。
