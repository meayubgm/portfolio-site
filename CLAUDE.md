# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

フロントエンドエンジニア「Megumi Ayuha」の個人ポートフォリオサイト。
Claude Design で作成したプロトタイプ（**Frost & Blueprint** デザインシステム）を、
Next.js 16 (App Router) + Tailwind CSS v4 で実装したもの。全ページ静的生成（SSG）。

## 開発コマンド

主要な開発フローは Docker + Make（ホットリロード付き）。

```bash
make up       # docker compose up -d でコンテナ起動 → http://localhost:3000
make down     # 停止・削除
make logs     # ログ追跡
make sh       # app コンテナのシェルに入る
make rebuild  # キャッシュ無しで再ビルドして起動
make lint     # Biome で lint/format をチェック（make lint-fix で自動修正）
make help     # 全ターゲット一覧
```

- Docker Compose v1 環境では `make up COMPOSE=docker-compose` のように上書きする。
- ソースはコンテナへバインドマウントされ、`node_modules` と `.next` は匿名ボリュームでコンテナ内のものを使う。ホスト（macOS）は musl 非対応なので依存はコンテナ内でのみ解決する。
- Next.js 16 は `next dev` / `next build` とも **Turbopack がデフォルト**。macOS の Docker Desktop（VirtioFS）はファイルイベントが透過するため、バインドマウント経由でも監視が効く。`WATCHPACK_POLLING=true` は Turbopack では参照されず、`next dev --webpack` に切り替えた場合のフォールバック用に残してある。
- Node 要件は 20.9+（Next.js 16）。イメージは `node:24-alpine`（Active LTS）を使用。`@types/node` もランタイムに合わせて 24 系。

Docker を使わない場合:

```bash
npm run dev      # 開発サーバー
npm run build    # 本番ビルド（型チェック込み。型エラーはここで検出）
npm run start    # 本番サーバー
```

型チェックは `npm run build`（`next build`）に含まれる。

E2E テストは **Playwright**（`@playwright/test`）を使用。開発コンテナ（`node:24-alpine`）は
Playwright のブラウザ非対応のため、**テストはホスト（macOS）で実行**し、`compose.yaml` が公開する
`http://localhost:3000` を叩く。手順は `make up`（Docker でアプリ起動）→ `make test-e2e`
（= `npx playwright test`）。`playwright.config.ts` の `webServer` は `reuseExistingServer: true` で、
Docker 未起動時や CI（Linux）では `npm run build && npm run start` でフォールバック起動する。
初回はホストで `npm install` 後に `npx playwright install chromium webkit` でブラウザを取得する。
spec は `e2e/`（Chromium / WebKit の2プロジェクト）。`e2e` と `playwright.config.ts` は
`tsconfig.json` の `exclude` に入れ `next build` の型チェックから外している。
Playwright MCP（`.mcp.json`）は探索的なブラウザ確認の補助であり、リグレッション検知は
`@playwright/test` に一任する。

lint/format は **Biome 2**（`biome.json`）と **ESLint**（`eslint.config.mjs`）の併用。役割分担は明確で、**Biome = 汎用 lint + format**、**ESLint = `@next/eslint-plugin-next` の Core Web Vitals ルールのみ**（`no-img-element` 等 Next 固有チェック。react/a11y は Biome に一任し重複を避ける）。`npm run lint`（= `biome check && eslint . --max-warnings 0`）でチェック、`npm run lint:fix`（= `biome check --write && eslint . --fix`）で自動修正。Prettier は使わない（整形は Biome 一択）。`app/globals.css`（Tailwind v4 の `@theme` 記法）と `tsconfig.json`（`next build` が自動整形）は Biome 対象外（`biome.json` の `files.includes` で除外）。ESLint は TSX パース用に `@typescript-eslint/parser` を設定（型情報なしの軽量構成）。

## アーキテクチャ

### デザイントークンは Tailwind テーマに統合されている

`app/globals.css` の `@theme` ブロックに Frost & Blueprint の **DS 固有トークン**（フォント・角丸・影・余白・字間）を
CSS 変数として定義し、Tailwind v4 が自動でユーティリティを生成する。**新しいフォント・角丸・影・余白・字間を足すときはここに追加する**。命名規則を守ればユーティリティ名が決まる:

| 変数 | 生成されるユーティリティ |
| --- | --- |
| `--font-display` | `font-display` |
| `--radius-card` | `rounded-card` |
| `--shadow-card-hover` | `shadow-card-hover` |
| `--spacing-section` | `pb-section` 等（セクション下余白） |
| `--tracking-heading` | `tracking-heading`（h1 共通字間） |

featured カード（BREW）のグラデーション面は `@theme` ではなく `@utility bg-featured` として定義している。

- **色は Tailwind の組み込みパレット（slate / sky / indigo）へ寄せている**。custom な `--color-*` トークンは廃止し、マークアップは組み込みユーティリティを直接使う（`text-slate-900`＝旧 navy、`text-slate-600`＝旧 slate、`text-slate-500`＝旧 slate-soft、`text-sky-700`＝旧 glow-c、`text-indigo-600`＝旧 indigo、`border-indigo-600/15`＝旧 indigo-soft、`bg-slate-200`＝旧 ice-2）。**新しい色は原則パレットから選ぶ**。ピクセル完全一致より Tailwind パレット準拠を優先する方針（過去の色トークン群は近似シフトで移行済み）。
- `tailwind.config.js` は存在しない（v4 の CSS ファースト設定）。設定はすべて `globals.css`。
- 半端な実数値（`14.5px` 等）はプロトタイプ再現のため arbitrary value（`text-[14.5px]`）で表現している。既存の見た目を変えないこと。
- 背景のブループリント格子（`--grid-cell` + `body` 直接適用）と、格子・面の淡い indigo は `color-mix(in srgb, var(--color-indigo-600) 6%, transparent)` のように Tailwind パレット変数から生成する。

### Client / Server の切り分け

- ページ本体（`app/**/page.tsx`）とほとんどのコンポーネントは Server Component。
- `"use client"` は **`components/GlassCard.tsx`**（マウス追従グロー＋クリック遷移）と **`components/SiteNav.tsx`**（`usePathname` でナビの active 判定）の2つだけ。
- カード全体をリンクにする場合は、ページを Server のまま保つため `GlassCard` に `href` を渡す（内部で `useRouter().push`）。カード内に `<a>`（`LinkRow` 等）が入るため `<a>` ネストは不可、という制約からこの設計になっている。

### ディレクトリ

- `app/` — App Router。`layout.tsx` に共通レイアウト（ナビ・アンビエントグロー・最大幅コンテナ）。ルートは `/`, `/works`, `/works/brew`, `/skills`, `/about`。
- `components/` — Frost & Blueprint の DS コンポーネント + `SiteNav`。プロトタイプの `_ds_bundle.js` から移植した8種（Button / CardLabel / EyebrowLabel / GlassCard / LinkRow / SkillBar / StatBlock / Tag。見た目はプロトタイプに忠実）に加え、ページ間の同型マークアップを集約したレイアウト系6種（PageHeading / CardGrid / LabeledField / MonoHeading / HoverCue / BackLink）。`HoverCue` はカード内の導線テキストで、`GlassCard` の `group` に乗って親カードのホバー時のみフェードインする（ホバー非対応環境では常時表示）。`BackLink` はページ左上の戻りリンクで、`/works`・`/skills`・`/about` は Home へ、`/works/brew` は `/works` へ戻る。
- `lib/cases.ts` — 実績データ。featured の `brewCase`（3ページから参照する単一ソース）・匿名化ケーススタディの `cases`・`otherWorks`。Works ページはここを map して描画。
- `lib/about.ts` — About ページのテキストデータ（挨拶文・強み4項目・人となり／好きなもの・これからやってみたいこと・年表形式の来歴）。
- `lib/skills.ts` — スキルデータ（Development / Design）。Home のスキルカードと `/skills` ページの単一ソース。`description` は `/skills` でのみ表示する。

## コンテンツ方針（デザインシステム由来）

- バイリンガル・日本語主体。UI ラベル・固有名詞・モノスペース注釈のみ英語。
- 絵文字は使わない。トーンはプロフェッショナル／技術寄り。
- 受託案件は契約上キャプチャ不可のため、匿名化テキストのケーススタディとして掲載する（既存の書き方を踏襲）。
- 日本語見出しは LINE Seed JP（再配布不可）の代替として IBM Plex Sans JP を使用。

## 未設定・注意点

- Home の「連絡する」ボタンは `href` 未指定で `<button>` のまま。Home の Contact Form は `LinkRow` の既定値 `href="#"` のまま。GitHub / X と BREW のデモ / リポジトリは実 URL を設定済み。
- ケーススタディ内の GIF はプレースホルダー（`MediaPlaceholder`）。
- コミット author はこのリポジトリのローカル設定で `user.email = meayubgm@gmail.com`（`user.name` はグローバルの `ayuha` を継承）。リモートは `git@github.com:meayubgm/portfolio-site.git`。
