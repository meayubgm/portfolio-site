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

## 未対応・注意点

- Home の「連絡する」ボタン、Email / GitHub / デモ / リポジトリのリンク先は `href="#"` のまま。
- ケーススタディ内の GIF はプレースホルダー（`MediaPlaceholder`）。
- テストフレームワークは未導入（型チェックは `npm run build` に含まれる）。
