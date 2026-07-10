# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

フロントエンドエンジニア「A.Y / frontend（Ayuha Megumi）」の個人ポートフォリオサイト。
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
- Node 要件は 20.9+（Next.js 16）。イメージは `node:20-alpine` で満たしている。

Docker を使わない場合:

```bash
npm run dev      # 開発サーバー
npm run build    # 本番ビルド（型チェック込み。型エラーはここで検出）
npm run start    # 本番サーバー
```

テストフレームワークは未導入。型チェックは `npm run build`（`next build`）に含まれる。

lint/format は **Biome 2**（`biome.json`）。`npm run lint`（= `biome check`）でチェック、`npm run lint:fix`（= `biome check --write`）で自動修正。Next.js 16 で `next lint` は廃止されたため ESLint/Prettier は使わず Biome に一本化している。`app/globals.css`（Tailwind v4 の `@theme` 記法）と `tsconfig.json`（`next build` が自動整形）は Biome 対象外（`biome.json` の `files.includes` で除外）。

## アーキテクチャ

### デザイントークンは Tailwind テーマに統合されている

`app/globals.css` の `@theme` ブロックに Frost & Blueprint のトークンを CSS 変数として定義し、
Tailwind v4 が自動でユーティリティを生成する。**新しい色・フォント・角丸を足すときはここに追加する**。命名規則を守ればユーティリティ名が決まる:

| 変数 | 生成されるユーティリティ |
| --- | --- |
| `--color-navy` | `bg-navy` / `text-navy` / `border-navy` |
| `--font-display` | `font-display` |
| `--radius-card` | `rounded-card` |
| `--shadow-card-hover` | `shadow-card-hover` |

- `tailwind.config.js` は存在しない（v4 の CSS ファースト設定）。設定はすべて `globals.css`。
- 半端な実数値（`14.5px` 等）はプロトタイプ再現のため arbitrary value（`text-[14.5px]`）で表現している。既存の見た目を変えないこと。
- 背景のブループリント格子（`--grid-cell` / `--color-indigo-grid`）はトークン化せず `body` に直接適用。

### Client / Server の切り分け

- ページ本体（`app/**/page.tsx`）とほとんどのコンポーネントは Server Component。
- `"use client"` は **`components/GlassCard.tsx`**（マウス追従グロー＋クリック遷移）と **`components/SiteNav.tsx`**（`usePathname` でナビの active 判定）の2つだけ。
- カード全体をリンクにする場合は、ページを Server のまま保つため `GlassCard` に `href` を渡す（内部で `useRouter().push`）。カード内に `<a>`（`LinkRow` 等）が入るため `<a>` ネストは不可、という制約からこの設計になっている。

### ディレクトリ

- `app/` — App Router。`layout.tsx` に共通レイアウト（ナビ・アンビエントグロー・最大幅コンテナ）。ルートは `/`, `/works`, `/works/brew`。
- `components/` — Frost & Blueprint の DS コンポーネント8種 + `SiteNav`。プロトタイプの `_ds_bundle.js` から移植したもので、見た目はプロトタイプに忠実。
- `lib/cases.ts` — 実績（匿名化ケーススタディ）のデータ。Works ページはここを map して描画。

## コンテンツ方針（デザインシステム由来）

- バイリンガル・日本語主体。UI ラベル・固有名詞・モノスペース注釈のみ英語。
- 絵文字は使わない。トーンはプロフェッショナル／技術寄り。
- 受託案件は契約上キャプチャ不可のため、匿名化テキストのケーススタディとして掲載する（既存の書き方を踏襲）。
- 日本語見出しは LINE Seed JP（再配布不可）の代替として IBM Plex Sans JP を使用。

## 未設定・注意点

- Home の「連絡する」ボタン、Email / GitHub / デモ / リポジトリのリンク先は `href="#"` のまま。
- ケーススタディ内の GIF はプレースホルダー（`MediaPlaceholder`）。
- コミット author はこのリポジトリのローカル設定で `user.email = meayubgm@gmail.com`（`user.name` はグローバルの `ayuha` を継承）。リモートは `git@github.com:meayubgm/portfolio-site.git`。
