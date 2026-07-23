# portfolio-site

**Megumi Ayuha** のポートフォリオサイト。Claude Design で作成したプロトタイプ
（Frost & Blueprint デザインシステム）を **Next.js (App Router) + Tailwind CSS v4** で実装したもの。全ページ静的生成（SSG）。

## 技術スタック

| 領域 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 16 LTS（App Router / SSG・Turbopack） |
| 言語 | TypeScript 6 / React 19 |
| スタイリング | Tailwind CSS v4（CSS ファースト設定・`@theme`） |
| フォント | Space Grotesk / IBM Plex Sans JP（Google Fonts） |
| Lint / Format | Biome 2（汎用 lint + format）+ ESLint（Next core-web-vitals） |
| テスト | Playwright（E2E / Chromium・WebKit）+ Playwright MCP |
| 開発環境 | Docker（Node 24 Alpine）+ Make |
| デプロイ形態 | 静的生成（SSG） |

型チェックは `npm run build`（`next build`）に含まれる。E2E テストは Playwright を使用（後述）。

## 開発

主要な開発フローは Docker + Make（ホットリロード付き）。

```bash
make up       # コンテナ起動（docker compose up -d）→ http://localhost:3000
make down     # 停止・削除
make logs     # ログ追跡
make sh       # app コンテナのシェルに入る
make rebuild  # キャッシュ無しで再ビルドして起動
make lint     # Biome + ESLint(Next) で lint/format をチェック（make lint-fix で自動修正）
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

## E2E テスト（Playwright）

E2E テストは **Playwright**（`@playwright/test`）で実装。開発コンテナ（`node:24-alpine`）は
Playwright のブラウザ非対応のため、**テストはホスト（macOS）で実行**し、Docker が配信する
`http://localhost:3000` を叩く。

```bash
# 初回のみ: ホストで依存とブラウザを取得
npm install
npx playwright install chromium webkit

# 実行
make up            # Docker でアプリ起動（:3000）
make test-e2e      # = npx playwright test（Chromium / WebKit）
npm run test:e2e:ui        # UI モードで実行
npm run test:e2e:report    # 直近の HTML レポートを表示
```

`playwright.config.ts` の `webServer` は `reuseExistingServer: true`。`make up` が :3000 を
占有していればそれを再利用し、Docker 未起動時や CI（Linux）では `npm run build && npm run start`
でフォールバック起動する。spec は `e2e/` 配下。

`.mcp.json` の Playwright MCP は探索的なブラウザ確認の補助（Claude Code から使用）。
リグレッション検知は `@playwright/test` に一任する。

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
│   ├── CardGrid.tsx        # 6 カラムのセクショングリッド
│   ├── CardLabel.tsx
│   ├── EyebrowLabel.tsx
│   ├── GlassCard.tsx       # "use client"（マウス追従グロー＋クリック遷移）
│   ├── LabeledField.tsx    # 破線区切り + mono ラベル + 本文（role / point 等）
│   ├── LinkRow.tsx
│   ├── MonoHeading.tsx     # mono / indigo のセクション見出し
│   ├── PageHeading.tsx     # ページ共通の eyebrow + h1 + リード文
│   ├── SiteNav.tsx         # "use client"（usePathname で active 判定）
│   ├── SkillBar.tsx
│   ├── StatBlock.tsx
│   └── Tag.tsx
├── lib/
│   ├── cases.ts            # 実績データ（BREW・匿名化ケーススタディ・その他案件）
│   └── skills.ts           # Home のスキルカード（Development / Design）データ
├── e2e/                    # Playwright E2E テスト（smoke / navigation）
├── playwright.config.ts    # Playwright 設定（Chromium / WebKit）
├── .mcp.json               # Playwright MCP（探索的確認の補助）
├── Dockerfile              # Node 24 Alpine / dev サーバー
├── compose.yaml            # サービス app / ポート3000 / ホットリロード
├── Makefile                # make up / down / logs / sh などのラッパー
├── biome.json              # Biome（汎用 lint / format）設定
├── eslint.config.mjs       # ESLint（Next core-web-vitals ルール）設定
├── next.config.mjs
├── postcss.config.mjs
└── tsconfig.json
```

## デザイントークンの扱い

DS 固有トークン（フォント・角丸・影・余白・字間）を CSS 変数として Tailwind テーマに統合しています
（`app/globals.css` の `@theme`）。命名規則は Tailwind v4 の慣習どおり:

| 変数 | 生成されるユーティリティ |
| --- | --- |
| `--font-display` | `font-display` |
| `--radius-card` | `rounded-card` |
| `--shadow-card-hover` | `shadow-card-hover` |
| `--spacing-section` | `pb-section` 等（セクション下余白） |
| `--tracking-heading` | `tracking-heading`（h1 共通字間） |

featured カード（BREW）のグラデーション面は `@utility bg-featured` として定義しています。

色は Tailwind の組み込みパレット（slate / sky / indigo）へ寄せており、custom な `--color-*`
トークンは持ちません（`text-slate-900` / `text-sky-700` / `border-indigo-600/15` のように直接使用）。
`tailwind.config.js` は存在しません（v4 の CSS ファースト設定）。
背景のブループリント格子は `--grid-cell` と `body` への直接適用で描画し、淡い indigo は
`color-mix` で Tailwind パレット変数（`--color-indigo-600`）から生成しています。

## Client / Server の切り分け

- `GlassCard`（マウス追従グロー＋クリック遷移）と `SiteNav`（`usePathname`）は `"use client"`。
- ページ本体・その他のコンポーネントは Server Component。全ページが静的生成（SSG）されます。

## メモ

- 日本語見出しフォントは LINE Seed JP の代替として IBM Plex Sans JP を使用（再配布不可のため）。
- Home の「連絡する」ボタン、Email / GitHub / デモ / リポジトリのリンク先は未設定（`href="#"`）。公開前に差し替えること。
- ケーススタディ内の GIF はプレースホルダーのまま。
