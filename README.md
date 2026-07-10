# portfolio-site

**A.Y / frontend** のポートフォリオサイト。Claude Design で作成したプロトタイプ
（Frost & Blueprint デザインシステム）を **Next.js (App Router) + Tailwind CSS v4** で実装したもの。全ページ静的生成（SSG）。

## 技術スタック

| 領域 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 16 LTS（App Router / SSG・Turbopack） |
| 言語 | TypeScript 5 / React 19 |
| スタイリング | Tailwind CSS v4（CSS ファースト設定・`@theme`） |
| フォント | Space Grotesk / IBM Plex Sans JP（Google Fonts） |
| Lint / Format | Biome 2（`biome.json` で一元管理） |
| 開発環境 | Docker（Node 20 Alpine）+ Make |
| デプロイ形態 | 静的生成（SSG） |

テストフレームワークは未導入。型チェックは `npm run build`（`next build`）に含まれる。

## 開発

主要な開発フローは Docker + Make（ホットリロード付き）。

```bash
make up       # コンテナ起動（docker compose up -d）→ http://localhost:3000
make down     # 停止・削除
make logs     # ログ追跡
make sh       # app コンテナのシェルに入る
make rebuild  # キャッシュ無しで再ビルドして起動
make lint     # Biome で lint/format をチェック（make lint-fix で自動修正）
make help     # 全ターゲット一覧
```

Docker Compose v1 環境では `make up COMPOSE=docker-compose` のように上書きする。

Docker を使わない場合:

```bash
npm install
npm run dev      # 開発サーバー（http://localhost:3000）
npm run build    # 本番ビルド（型チェック込み）
npm run start    # 本番サーバー
```

## ディレクトリ構成

```
portfolio-site/
├── app/                    # App Router
│   ├── layout.tsx          # 共通レイアウト（ナビ＋アンビエントグロー＋最大幅コンテナ）
│   ├── page.tsx            # Home（/）
│   ├── globals.css         # Tailwind v4 @theme にデザイントークンを統合
│   └── works/
│       ├── page.tsx        # 実績一覧（/works）
│       └── brew/page.tsx   # BREW ケーススタディ（/works/brew）
├── components/             # Frost & Blueprint の DS コンポーネント
│   ├── Button.tsx
│   ├── CardLabel.tsx
│   ├── EyebrowLabel.tsx
│   ├── GlassCard.tsx       # "use client"（マウス追従グロー＋クリック遷移）
│   ├── LinkRow.tsx
│   ├── SiteNav.tsx         # "use client"（usePathname で active 判定）
│   ├── SkillBar.tsx
│   ├── StatBlock.tsx
│   └── Tag.tsx
├── lib/
│   └── cases.ts            # 匿名化ケーススタディのデータ
├── Dockerfile              # Node 20 Alpine / dev サーバー
├── docker-compose.yml      # サービス app / ポート3000 / ホットリロード
├── Makefile                # make up / down / logs / sh などのラッパー
├── biome.json              # Biome（lint / format）設定
├── next.config.mjs
├── postcss.config.mjs
└── tsconfig.json
```

## デザイントークンの扱い

CSS 変数を Tailwind テーマに統合しています（`app/globals.css` の `@theme`）。
命名規則は Tailwind v4 の慣習どおり:

| 変数 | 生成されるユーティリティ |
| --- | --- |
| `--color-navy` | `bg-navy` / `text-navy` / `border-navy` |
| `--font-display` | `font-display` |
| `--radius-card` | `rounded-card` |
| `--shadow-card-hover` | `shadow-card-hover` |

`tailwind.config.js` は存在しません（v4 の CSS ファースト設定）。
背景のブループリント格子（`--grid-cell` / `--color-indigo-grid`）は `body` に直接適用しています。

## Client / Server の切り分け

- `GlassCard`（マウス追従グロー＋クリック遷移）と `SiteNav`（`usePathname`）は `"use client"`。
- ページ本体・その他のコンポーネントは Server Component。全ページが静的生成（SSG）されます。

## メモ

- 日本語見出しフォントは LINE Seed JP の代替として IBM Plex Sans JP を使用（再配布不可のため）。
- Home の「連絡する」ボタン、Email / GitHub / デモ / リポジトリのリンク先は未設定（`href="#"`）。公開前に差し替えること。
- ケーススタディ内の GIF はプレースホルダーのまま。
