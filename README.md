# portfolio-site

**Megumi Ayuha** のポートフォリオサイト。Claude Design で作成したプロトタイプ
（Frost & Blueprint デザインシステム）を **Next.js (App Router) + Tailwind CSS v4** で実装したもの。全ページ静的生成（SSG。唯一の例外がお問い合わせ送信の Route Handler `/api/contact`）。

## 技術スタック

| 領域 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 16 LTS（App Router / SSG・Turbopack） |
| 言語 | TypeScript 6 / React 19 |
| スタイリング | Tailwind CSS v4（CSS ファースト設定・`@theme`）+ clsx / tailwind-merge |
| フォント | Space Grotesk / IBM Plex Sans JP（Google Fonts） |
| Lint / Format | Biome 2（汎用 lint + format。`recommended` + `useBlockStatements`）+ ESLint（Next core-web-vitals + 独自ルール） |
| テスト | Playwright（E2E / Chromium・WebKit）+ Playwright MCP |
| フォーム | React Hook Form + Zod（お問い合わせフォームの入力検証） |
| メール送信 | Resend + Cloudflare Turnstile（お問い合わせフォーム） |
| 開発環境 | Docker（Node 24 Alpine）+ Make |
| デプロイ形態 | 静的生成（SSG）+ Route Handler 1本（`/api/contact`） |

型チェックは `npm run build`（`next build`）に含まれる。E2E テストは Playwright を使用（後述）。

## 開発

主要な開発フローは Docker + Make（ホットリロード付き）。

```bash
make up       # コンテナ起動（docker compose up -d）→ http://localhost:3000
make down     # 停止・削除
make logs     # ログ追跡
make sh       # app コンテナのシェルに入る
make rebuild  # キャッシュ無しで再ビルドして起動
make lint     # Biome + ESLint(Next / 独自ルール) で lint/format をチェック（make lint-fix で自動修正）
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

## お問い合わせフォーム（/contact）

`/contact` の送信は `POST /api/contact` で処理され、**Honeypot →（Cloudflare Turnstile）→ Resend でメール送信**
の順に進みます。ページ自体は SSG のままで、動的なのはこの Route Handler だけです。

入力検証は **React Hook Form + Zod** で行います。スキーマは `lib/contactSchema.ts` に置き、
クライアント（`ContactForm`）と Route Handler の双方が同じルールを参照します。
「送信する」を押した時点で必須項目とメールアドレスの形式を検証し、エラーは各項目の直下に赤字で表示されます。

初回のみ `.env.example` を `.env.local` にコピーして値を入れてください（`.env` 系は git 管理外）。

```bash
cp .env.example .env.local
```

| 変数 | 用途 |
| --- | --- |
| `RESEND_API_KEY` | Resend の API キー |
| `CONTACT_TO_EMAIL` | 送信先（受信したいアドレス） |
| `CONTACT_FROM_EMAIL` | 送信元。ドメイン未検証のため `onboarding@resend.dev` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile のサイトキー |
| `TURNSTILE_SECRET_KEY` | Turnstile のシークレット |

`.env.example` の Turnstile はローカル確認用の公式テストキー（常に成功）です。
サイトキーが未設定の場合、フォームはウィジェットの代わりに未設定の注記を表示します。

> **注意**: 独自ドメインを Resend で検証していないため、送信元は共有ドメインの `onboarding@resend.dev` です。
> この状態では Resend の sandbox 制限により、**宛先は Resend アカウントの登録メールアドレスにしか送れません**。
> `CONTACT_TO_EMAIL` に別のアドレスを指定すると Resend が 403 を返し、`[contact] resend error:` がログに出て
> 500 になります。別のアドレスで受け取りたい場合は独自ドメインの取得と検証が必要です。

> **注意**: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` は `NEXT_PUBLIC_` 接頭辞のとおり
> **ビルド時にバンドルへ埋め込まれます**。実行時にだけ環境変数を渡す構成（Docker の `environment` など）では
> 空文字のままになり、ウィジェットが出ず送信が必ず 400 になります。`next build` を実行する環境にも
> 必ず設定してください（Vercel なら Environment Variables に入れておけば OK）。

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
│   ├── skills/page.tsx     # スキル一覧（/skills）
│   ├── about/page.tsx      # 自己紹介（/about）
│   ├── contact/page.tsx    # お問い合わせ（/contact）
│   ├── api/contact/route.ts # お問い合わせ送信（POST。Honeypot → Turnstile → Resend）
│   └── works/
│       ├── page.tsx        # 実績一覧（/works）
│       └── brew/page.tsx   # BREW ケーススタディ（/works/brew）
├── public/                 # 静的アセット
│   └── works/brew/         # BREW ケーススタディの画像（iPhone モック・UI キャプチャ）
├── commons/                # ドメイン非依存の DS プリミティブ（どこからでも使える）
│   ├── BackLink.tsx        # ページ左上の戻りリンク（← home に戻る 等）
│   ├── Button.tsx
│   ├── CardGrid.tsx        # 6 カラムのセクショングリッド
│   ├── CardLabel.tsx
│   ├── EyebrowLabel.tsx
│   ├── GlassCard.tsx       # "use client"（マウス追従グロー＋クリック遷移）
│   ├── HoverCue.tsx        # カード内の導線テキスト（親カードのホバー時のみ表示）
│   ├── LabeledField.tsx    # 破線区切り + mono ラベル + 本文（role / point 等）
│   ├── LinkRow.tsx
│   ├── MonoHeading.tsx     # mono / indigo のセクション見出し
│   ├── StatBlock.tsx
│   ├── Tag.tsx
│   └── Text.tsx            # Text（variant / tone）。サイト内テキストの共通入口
├── components/             # このサイト固有のコンポーネント（再利用しない）
│   ├── ContactForm.tsx     # "use client"（お問い合わせフォーム。Turnstile / Honeypot）
│   ├── FormField.tsx       # ラベル + 必須／任意の注記 + 入力コントロール + エラー表示の行
│   ├── PageHeading.tsx     # ページ共通の eyebrow + h1 + リード文（hero / list / detail）
│   ├── SiteNav.tsx         # "use client"（usePathname で active 判定）
│   ├── SkillBar.tsx        # Home のスキルバー（percent 必須）
│   └── SkillName.tsx       # /skills のスキル名（バー無し・mono / indigo）
├── lib/
│   ├── about.ts            # About のテキストデータ（挨拶文は Home と共用。強み・人となり・来歴 ほか）
│   ├── cases.ts            # 実績データ（BREW・匿名化ケーススタディ・その他案件）
│   ├── cn.ts               # clsx + tailwind-merge のクラス結合（衝突は後勝ち）
│   ├── contactSchema.ts    # お問い合わせフォームの検証ルール（Zod。クライアント／API で共用）
│   └── skills.ts           # スキルデータ（Development / Design / Tools。Home のカードと /skills で共用）
├── e2e/                    # Playwright E2E テスト（smoke / navigation）
├── playwright.config.ts    # Playwright 設定（Chromium / WebKit）
├── .mcp.json               # Playwright MCP（探索的確認の補助）
├── .env.example            # お問い合わせフォームの環境変数の雛形（.env.local にコピーして使う）
├── Dockerfile              # Node 24 Alpine / dev サーバー
├── compose.yaml            # サービス app / ポート3000 / ホットリロード
├── Makefile                # make up / down / logs / sh などのラッパー
├── biome.json              # Biome（汎用 lint / format）設定
├── eslint.config.mjs       # ESLint（Next core-web-vitals + eslint-rules/）設定
├── eslint-rules/           # プロジェクト独自の ESLint ルール（no-conditional-jsx）
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
| `--tracking-label` | `tracking-label`（mono ラベル共通字間 0.06em） |

featured カード（BREW）のグラデーション面は `@utility bg-featured` として定義しています。

文字サイズ・行間はカスタムトークンを持たず、Tailwind 標準スケール（`xs` / `sm` / `base` / `lg` /
`xl` / `2xl` と `leading-5` 〜 `leading-8`）だけを使います。サイト内のテキストは
`commons/Text.tsx` の `Text` を経由して描き、`variant`（サイズ・行間・ウェイト・font-family）と
`tone`（文字色）から選びます。h1 のみレスポンシブな `clamp()` のため `PageHeading` 内に直接指定しています。

色は Tailwind の組み込みパレット（slate / sky / indigo）へ寄せており、custom な `--color-*`
トークンは持ちません（`text-slate-900` / `text-sky-700` / `border-indigo-600/15` のように直接使用）。
`tailwind.config.js` は存在しません（v4 の CSS ファースト設定）。
背景のブループリント格子は `--grid-cell` と `body` への直接適用で描画し、淡い indigo は
`color-mix` で Tailwind パレット変数（`--color-indigo-600`）から生成しています。

## Client / Server の切り分け

- `GlassCard`（マウス追従グロー＋クリック遷移）・`SiteNav`（`usePathname`）・`ContactForm`（フォーム状態と Turnstile）は `"use client"`。
- ページ本体・その他のコンポーネントは Server Component。全ページが静的生成（SSG）されます。
  唯一の動的ルートが `app/api/contact/route.ts`（お問い合わせの送信先）です。

## メモ

- 日本語見出しフォントは LINE Seed JP の代替として IBM Plex Sans JP を使用（再配布不可のため）。
- サイト内のリンクはすべて設定済み（Home の「連絡する」ボタン・Contact Form・ヘッダーの contact はいずれも `/contact` へ。Home の GitHub / X、BREW ケーススタディのデモ / リポジトリは実 URL）。
- Resend / Turnstile とも実キーを取得済みで、フォームからの送信・受信を確認済み（ローカル）。送信元は `onboarding@resend.dev` のままで、宛先は Resend アカウントの登録アドレスに限られます（上記の注意を参照）。デプロイ先では環境変数を設定したうえで再ビルドが必要です。
- BREW ケーススタディのヒーロー（iPhone モック3枚）と「デザイン」の UI キャプチャは実画像（`public/works/brew/`）。
