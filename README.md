# portfolio-site

**Megumi Ayuha** のポートフォリオサイト。デザインシステム **Frost & Blueprint**（フロスト＝磨りガラス面＋
ブループリント＝設計図の格子）を **Next.js (App Router) + Tailwind CSS v4** で実装しています。
全ページ静的生成（SSG）で、唯一の動的ルートがお問い合わせ送信の Route Handler `/api/contact` です。

ページは `/`（Home）・`/works`・`/works/brew`（BREW ケーススタディ）・`/skills`・`/about`・`/contact` の6つ。

## 技術スタック

| 領域 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 16 LTS（App Router / SSG・Turbopack） |
| 言語 | TypeScript 6 / React 19 |
| スタイリング | Tailwind CSS v4（CSS ファースト設定・`@theme`）+ clsx / tailwind-merge |
| フォント | Space Grotesk / Inter / JetBrains Mono / IBM Plex Sans JP（Google Fonts） |
| Lint / Format | Biome 2（汎用 lint + format。`recommended` + `useBlockStatements`）+ ESLint（Next core-web-vitals + 独自ルール） |
| テスト | Playwright（E2E / Chromium・WebKit）+ Playwright MCP |
| フォーム | React Hook Form + Zod（お問い合わせフォームの入力検証） |
| メール送信 | Resend + Cloudflare Turnstile（お問い合わせフォーム） |
| 開発環境 | Docker（Node 24 Alpine）+ Make |
| デプロイ形態 | 静的生成（SSG）+ Route Handler 1本（`/api/contact`） |

型チェックは `npm run build`（`next build`）に含まれます。

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

ソースはコンテナへバインドマウントし、`node_modules` と `.next` はコンテナ内のもの（匿名ボリューム）を
使います。ホスト（macOS）は musl 非対応なので、依存はコンテナ内で解決してください。
Docker Compose v1 環境では `make up COMPOSE=docker-compose` のように上書きします。

Docker を使わない場合:

```bash
npm install
npm run dev      # 開発サーバー（http://localhost:3000）
npm run build    # 本番ビルド（型チェック込み）
npm run start    # 本番サーバー
```

> **Tip**: `app/globals.css` の `@theme` / `@utility` / `@custom-variant` を編集したのに新しい
> ユーティリティだけ効かない場合は、dev サーバーが古い CSS をキャッシュしています。
> `docker compose exec app sh -c 'rm -rf .next/*'` のうえ `docker compose restart app` で直ります。

## お問い合わせフォーム（/contact）

`/contact` の送信は `POST /api/contact` で処理され、**Honeypot → Cloudflare Turnstile → Resend でメール送信**
の順に進みます。ページ自体は SSG のままで、動的なのはこの Route Handler だけです。
ボット対策は Honeypot と Turnstile の2段構えです。

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
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile のサイトキー（クライアント側） |
| `TURNSTILE_SECRET_KEY` | Turnstile のシークレット（サーバー側） |

`.env.example` の Turnstile はローカル確認用の公式テストキー（常に成功）です。
サイトキーが未設定の場合、フォームはウィジェットの代わりに未設定の注記を表示します。
環境変数が揃っていなくてもビルドは通り（モジュールトップで throw しません）、送信時に 500 を返します。

> **注意**: 独自ドメインを Resend で検証していないため、送信元は共有ドメインの `onboarding@resend.dev` です。
> この状態では Resend の sandbox 制限により、**宛先は Resend アカウントの登録メールアドレスにしか送れません**。
> `CONTACT_TO_EMAIL` に別のアドレスを指定すると Resend が 403 を返し、`[contact] resend error:` がログに出て
> 500 になります。別のアドレスで受け取りたい場合は独自ドメインの取得と検証（MX / SPF / DKIM）が必要です。

> **注意**: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` は `NEXT_PUBLIC_` 接頭辞のとおり
> **ビルド時にバンドルへ埋め込まれます**。実行時にだけ環境変数を渡す構成（Docker の `environment` など）では
> 空文字のままになり、ウィジェットが出ず送信が必ず 400 になります。`next build` を実行する環境にも
> 必ず設定してください（Vercel なら Environment Variables に入れておけば OK）。

> **注意**: Turnstile のホスト名は **FQDN のみ・ワイルドカード不可**で、登録したホスト名の配下の
> サブドメインだけが自動許可されます。Vercel のプレビューデプロイは `<project>-<hash>-<team>.vercel.app` と
> いう**兄弟サブドメイン**になるため、本番ホスト名を登録してもプレビューでは Turnstile を通過できません。

## E2E テスト（Playwright）

E2E テストは **Playwright**（`@playwright/test`）で実装。開発コンテナ（`node:24-alpine`）は
Playwright のブラウザ非対応のため、**テストはホスト（macOS）で実行**し、Docker が配信する
`http://localhost:3000` を叩きます。

```bash
# 初回のみ: ホストで依存とブラウザを取得
npm install
npx playwright install chromium webkit

# 実行
make up            # Docker でアプリ起動（:3000）
make test-e2e      # = npx playwright test（Chromium / WebKit + モバイル2種）
npm run test:e2e:ui        # UI モードで実行
npm run test:e2e:report    # 直近の HTML レポートを表示
```

`playwright.config.ts` の `webServer` は `reuseExistingServer: true`。`make up` が :3000 を
占有していればそれを再利用し、Docker 未起動時や CI（Linux）では `npm run build && npm run start`
でフォールバック起動します。spec は `e2e/` 配下（smoke / navigation / motion / geometry / responsive）。

プロジェクトは4つ。`chromium` / `webkit`（いずれも 1280px）はデスクトップ幅の期待値で書かれた
spec を走らせ、`testIgnore` で `responsive.spec.ts` を外します。`mobile-chrome`（Pixel 5）と
`mobile-safari`（iPhone 13）は逆に `testMatch` で `responsive.spec.ts` だけを拾います。

`.mcp.json` の Playwright MCP は探索的なブラウザ確認の補助（Claude Code から使用）。
リグレッション検知は `@playwright/test` に一任します。

## ディレクトリ構成

`commons/` は**ドメイン非依存の DS プリミティブ**、`components/` は**このサイト固有**のコンポーネントです。
依存は `app/` → `components/` → `commons/` の一方向で、`commons/` から `components/` は参照しません。
import には `@/` エイリアスを使います（`tsconfig.json` の `paths` でリポジトリルートに解決）。

```
portfolio-site/
├── app/                    # App Router
│   ├── layout.tsx          # 共通レイアウト（ナビ＋アンビエントグロー＋最大幅コンテナ＋フッター＋ScrollToTarget）
│   ├── globals.css         # Tailwind v4 @theme にデザイントークンを統合
│   ├── icon.svg / icon.png / apple-icon.png  # metadata ファイル（favicon・アプリアイコン）
│   ├── api/contact/route.ts # お問い合わせ送信（POST。Honeypot → Turnstile → Resend）
│   └── (pages)/            # Route Group。括弧付きなので URL には現れない
│       ├── page.tsx        # Home（/）
│       ├── skills/page.tsx # スキル一覧（/skills）
│       ├── about/page.tsx  # 自己紹介（/about）
│       ├── contact/page.tsx # お問い合わせ（/contact）
│       └── works/
│           ├── page.tsx    # 実績一覧（/works）
│           └── brew/page.tsx # BREW ケーススタディ（/works/brew）
├── public/                 # 静的アセット
│   └── works/brew/         # BREW ケーススタディの画像（iPhone モック・UI キャプチャ）
├── commons/                # ドメイン非依存の DS プリミティブ（どこからでも使える）
│   ├── BackLink.tsx        # ページ末尾の戻りリンク（← back to home 等）
│   ├── BulletList.tsx      # 中黒付きの箇条書き（list-disc + インデント）
│   ├── Button.tsx
│   ├── CardGrid.tsx        # セクショングリッド（lg 以上で 6 カラム、それ未満は 1 カラム）
│   ├── CardLabel.tsx       # カード左上の mono ラベル（meta で右端に通し番号を添えられる）
│   ├── EyebrowLabel.tsx
│   ├── GlassCard.tsx       # "use client"（マウス追従グロー＋クリック遷移＋scroll reveal）
│   ├── HoverCue.tsx        # カード内の導線テキスト（親カードのホバー時のみ表示）
│   ├── LabeledField.tsx    # 破線区切り + mono ラベル + 本文（role / point 等）
│   ├── LearnMoreCue.tsx    # 「learn more ↗」固定の HoverCue
│   ├── LinkRow.tsx
│   ├── MonoHeading.tsx     # mono / indigo のセクション見出し
│   ├── RiseIn.tsx          # "use client"（指定時間後に浮き上がって現れるブロック）
│   ├── ScrollToTarget.tsx  # "use client"（遷移先で指定された要素へスムーススクロール）
│   ├── StatBlock.tsx
│   ├── Tag.tsx
│   ├── TagList.tsx         # Tag を折り返しながら並べる列
│   ├── Text.tsx            # Text（variant / tone）。サイト内テキストの共通入口
│   ├── Typewriter.tsx      # "use client"（文字を左から打ち込むテキスト）
│   └── Wireframe.tsx       # "use client"（正多面体の線画。自転＋組み上げ演出）
├── components/             # このサイト固有のコンポーネント（再利用しない）
│   ├── ContactForm.tsx     # "use client"（お問い合わせフォーム。Turnstile / Honeypot）
│   ├── FormField.tsx       # ラベル + 必須／任意の注記 + 入力コントロール + エラー表示の行
│   ├── HeroGeometry.tsx    # 背景に固定する正多面体（ページ→図形・配置の対応表）
│   ├── PageHeader.tsx      # 一覧系ページ共通の header ラッパー + PageHeading
│   ├── PageHeading.tsx     # ページ共通の eyebrow + h1 + リード文（hero / list / detail）
│   ├── SiteNav.tsx         # "use client"（active 判定＋出し入れ＋sm 未満のハンバーガーメニュー）
│   ├── SkillBar.tsx        # Home のスキルバー（percent 必須）
│   └── SkillName.tsx       # /skills のスキル名（バー無し・mono / indigo）
├── lib/
│   ├── about.ts            # About のテキストデータ（挨拶文は Home と共用。強み・人となり・来歴 ほか）
│   ├── cases.ts            # 実績データ（BREW・匿名化ケーススタディ・その他案件）
│   ├── cn.ts               # clsx + tailwind-merge のクラス結合（衝突は後勝ち）
│   ├── home.ts             # Home ヒーローの文言とタイピング演出のスケジュール
│   ├── polyhedra.ts        # 正多面体5種の頂点・辺データ（辺は最小距離から導出）
│   ├── scrollTarget.ts     # 遷移をまたいで着地後にスクロールする要素の id を受け渡す
│   ├── useRiseIn.ts        # 浮き上がり表示を当てるフック（RiseIn / GlassCard が共用）
│   ├── contactSchema.ts    # お問い合わせフォームの検証ルール（Zod。クライアント／API で共用）
│   └── skills.ts           # スキルデータ（Development / Design / Tools。Home のカードと /skills で共用）
├── e2e/                    # Playwright E2E テスト（smoke / navigation / motion / geometry / responsive）
├── playwright.config.ts    # Playwright 設定（Chromium / WebKit + モバイル2種）
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

## データの持ち方

ページに表示する内容は `lib/` のデータモジュールに集約し、ページはそれを map して描画します。

- `lib/cases.ts` — featured の `brewCase` は Home / `/works` / `/works/brew` の3ページから参照する単一ソース。
  ほかに匿名化ケーススタディの `cases` と `otherWorks`。
- `lib/skills.ts` — Home のスキルカードと `/skills` の単一ソース。各グループ（Development / Design / Tools）は
  `id`（`/skills` でカードに付けるアンカー。Home の Design カードからのスクロール先）と
  `sections`（職能ベースの分類。`heading` を省略すると見出し無しの単一セクション＝Design / Tools）と
  `layout`（`/skills` でのカード幅 `span` とセクションの列数 `columns`）を持ちます。
  Development は span 6 / 2列（左＝フロントエンド、右＝バックエンド + AI活用。どちらの列に置くかは各 section の
  `column`）、Design と Tools は span 3 / 1列です（`span` が効くのは lg 以上で、それ未満は 1 カラムに畳まれます）。
  `note` は Home のカード用で、`/skills` では
  `skillsNote`（あれば）を優先表示、`description` は `/skills` でのみ表示します。
  `percent` は optional で、**Home に載せるかどうかの分岐を兼ねます**（値はバーの長さ）。Home は `percent` を
  持つ項目だけを残した派生配列 `homeSkillGroups` を使い、並べ替えはしません。`homeName` を持つ項目は
  Home でだけその名前で表示します（React が `homeName: "React / Next.js"` を持ち、Next.js 側が `percent` を
  持たないことで Home の1本のバーにまとまります）。`/skills` は `percent` の有無にかかわらず全項目を
  バー無し（`SkillName`）で表示します。
- `lib/about.ts` — 挨拶文・強み4項目・人となり／好きなもの・これからやってみたいこと・年表形式の来歴。
- `lib/home.ts` — ヒーローの文言（`heroCopy`）とタイピングの遅延・速度（`heroTyping`）。
  遅延は文字数から静的に算出するため、文言を書き換えればスケジュールも追従します。

## デザイントークンの扱い

DS 固有トークン（フォント・角丸・影・字間・h1 のサイズ段・コンテナ幅）を CSS 変数として
Tailwind テーマに統合しています（`app/globals.css` の `@theme`）。命名規則は Tailwind v4 の慣習どおりで、
変数を足せばそのままユーティリティが生成されます。

| 変数 | 生成されるユーティリティ |
| --- | --- |
| `--font-display` / `--font-body` / `--font-mono` | `font-display` / `font-body` / `font-mono` |
| `--radius-card` | `rounded-card` |
| `--shadow-card-hover` | `shadow-card-hover` |
| `--tracking-heading` | `tracking-heading`（h1 共通字間） |
| `--tracking-label` | `tracking-label`（mono ラベル共通字間 0.06em） |
| `--text-hero` / `--text-page` / `--text-detail` | `text-hero` / `text-page` / `text-detail`（h1 の3サイズ。`--text-*--line-height` を対で置いているので行間もこれ1つで決まる） |
| `--container-site` | `max-w-site`（サイト全体の最大幅 1800px） |

`@theme` に収まらないものは `@utility` / `@custom-variant` で定義しています。featured カード（BREW）の
グラデーション面が `bg-featured`、画面上部のアンビエントグローが `bg-ambient-glow`、
ホバー非対応環境向けの variant が `hover-none:`（`@custom-variant`）です。

文字サイズ・行間はカスタムトークンを持たず、Tailwind 標準スケール（`xs` / `sm` / `base` / `lg` /
`xl` / `2xl` と `leading-5` 〜 `leading-8`）だけを使います。サイト内のテキストは
`commons/Text.tsx` の `Text` を経由して描き、`variant`（サイズ・行間・ウェイト・font-family）と
`tone`（文字色）から選びます。h1 のみレスポンシブな `clamp()` が必要ですが、これも `@theme` の
`--text-hero` / `--text-page` / `--text-detail` にトークン化してあり、`PageHeading` はそのユーティリティを
当てるだけです。段落用の `lead` / `body` には `text-justify` を含めており、日本語の折り返しでも右端が揃います。

色は Tailwind の組み込みパレット（slate / sky / indigo）に準拠し、custom な `--color-*` トークンは
持ちません（`text-slate-900` / `text-sky-700` / `border-indigo-600/15` のように直接使用）。
`tailwind.config.js` はありません（v4 の CSS ファースト設定）。
背景のブループリント格子は `--grid-cell` と `body` への直接適用で描画し、淡い indigo は
`color-mix` で Tailwind パレット変数（`--color-indigo-600`）から生成しています。

## レスポンシブ

切り替え点は **`sm`（640px）と `lg`（1024px）の2つ**です。`md`（768px）は背景の正多面体の見せ方にだけ使います。

| 幅 | ナビ | カード | 左右余白 / カード padding |
| --- | --- | --- | --- |
| `< sm`（〜639px） | ハンバーガーメニュー。SiteNav は透明・常時表示 | 1 カラム | `px-5.5`(22px) / `p-4`・`p-5` |
| `sm 〜 lg`（640〜1023px） | 横並びのリンク列 | 1 カラム | `px-8`(32px) / `p-7`・`p-9` |
| `>= lg`（1024px〜） | 横並びのリンク列 | 6 カラムグリッド | 同上 |

- **段組み** — `CardGrid` が `grid-cols-1 lg:grid-cols-6`、`GlassCard` が `lg:col-span-*` /
  `lg:col-start-*` を持ちます（値は 1〜6 の `GridColumn` 型。クラス名は `spanClasses` /
  `startClasses` の表に書き下してあり、テンプレートリテラルでは組み立てません）。
  カード内の 2 列組み（`/skills` の Development、`/works/brew` の実装済み/今後）も同じ `lg:` で揃えます。
- **ハンバーガーメニュー** — 右上の 3 本線（indigo）を押すと × に変わり、画面上部に `GlassCard` の
  パネル（枠線は indigo）が上から下へ伸びて出ます。パネル内はロゴ + home〜contact の 2 列で、
  ロゴとリンク群を `justify-between` で左右に振り分けています。現在地の先頭には「+」が付きます。
  遷移すると自動で閉じます。ロゴは開閉のどちらでも同じ位置に出ます。
- **Home ヒーローの高さ** — `h-svh`（`h-screen` = `100vh` ではありません）。iOS Safari / Chrome Android の
  `100vh` は URL バーが隠れたときの高さなので、`h-screen` だと実機の初期表示で CTA 列がバーの下に潜ります。
  `svh` はバーの出入りで値が変わらないためレイアウトも跳ねません。**Playwright のエミュレーションでは
  `innerHeight` が `100vh` と一致するので、この不具合は e2e で検知できません**。
- **左右余白** — `app/layout.tsx` の中央コンテナが `px-5.5 sm:px-8`。sm 未満の 22px は
  `SiteNav` の `max-sm:px-5.5` とメニューパネルのオフセット（`inset-x-2.75` + 枠線 1px + `p-2.5`）に
  揃えてあり、ロゴ・ハンバーガー・カード左端が一直線に並びます。**片方だけ動かさないこと**。
- **カードの padding** — `GlassCard` が `p-4 sm:p-7`（`padding="lg"` は `p-5 sm:p-9`）。
  メニューパネルは `SiteNav` 側が `className` で `p-2.5 sm:p-7` に上書きするため、この既定値の
  変更は波及しません。
- **横並びの解除** — `/about` の来歴（期間ラベル + 本文）は全幅で縦積み、`/works` の featured カードの
  `StatBlock` 3連と、その下のタグ列 + learn more は `sm` で横並びに戻します。
- **セクション下の余白** — `CardGrid` と `/works/brew` の本文が `pb-12 sm:pb-16`。
  以前の `--spacing-section`（90px）は狭い画面に過大だったため、トークンごと廃止しています。
- **`/works/brew`** — 内側の左右 padding は `sm:px-4 lg:px-9` で、sm 未満は中央コンテナの `px-5.5` だけに
  なり他ページと左端が揃います。iPhone モック 3 枚は `sm` で横並びに戻します
  （`next/image` の `sizes` も padding に合わせてあります）。
- **Turnstile** — 常に `normal`（300px）で描画し、置き場の実幅まで `scale` で縮めて**カード内の
  入力欄と幅を揃えます**（375px では 289px）。倍率の上限は 1 なので、lg 以上では 300px のままです。
  `ResizeObserver` が置き場の幅とウィジェットの高さを見張って追従するため、画面を回転しても
  トークンを作り直しません。

## Client / Server の切り分け

- `GlassCard`（マウス追従グロー＋クリック遷移＋scroll reveal）・`Typewriter`（タイピング演出）・
  `RiseIn`（浮き上がり）・`Wireframe`（正多面体の自転）・`ScrollToTarget`（遷移先の要素へのスムーススクロール）・
  `SiteNav`（`usePathname` とスクロール連動）・`ContactForm`（フォーム状態と Turnstile）の
  7ファイルが `"use client"`。
- ページ本体・その他のコンポーネントは Server Component で、全ページが静的生成（SSG）されます。
  唯一の動的ルートが `app/api/contact/route.ts`（お問い合わせの送信先）です。
- カード全体をリンクにする場合は、ページを Server のまま保つため `GlassCard` に `href` を渡します
  （内部で `useRouter().push`。カード内に `<a>` が入るため `<a>` のネストは避けています）。

## モーション

アニメーションライブラリは使わず、CSS transition と IntersectionObserver で実装しています。
いずれも `prefers-reduced-motion: reduce` で即時表示に切り替わります。

- **メニューパネル（sm 未満）** — `grid-template-rows: 0fr → 1fr` と子の `overflow-hidden` で上から下へ
  伸ばします。畳むアニメーションを見せるためパネルは常時マウントし、`visibility` で出し入れします
  （閉じている間は accessibility tree からも外れます）。
- **SiteNav** — 下スクロールで `-translate-y-full`、上スクロールで復帰（最上部 80px 以内では隠さない。
  sm 未満では出し入れせず常に上部に留まります）。
  隠れている状態でリンクにフォーカスが入った場合は出し直します。
  現在地は `text-indigo-600`、それ以外は `text-slate-600`。ホバーすると `text-indigo-600` になり、
  `GlassCard` 右上と同じ「+」がリンクの先頭に絶対配置でフェードインします（ラベルは動きません）。
  ページ末尾の `BackLink` は既定が indigo なので色は変えず、末尾に「+」が出るだけです。
  ロゴはホバーで Y 軸に1回転します。
- **Home ヒーロー** — `Typewriter` が eyebrow / h1 / mono行 / リード文を左から打ち込みます。
  遅延と速度は `lib/home.ts` が文字数から静的に算出（h1 は eyebrow に少し重ねて開始し、
  両方が終わってから mono行とリード文が同時に始まる）。
  完成テキストは `opacity-0` で重ねたまま DOM に残すため、高さが動かず SSG の HTML にも文言が載ります。
- **浮き上がり** — `opacity-0 translate-y-4` → `opacity-100 translate-y-0` を 0.5 秒の transition で
  同時に動かします（当て方は `lib/useRiseIn.ts` に集約。終わったらクラスを外します）。
- **カード** — `GlassCard` の `reveal`。画面に入ったら浮き上がり、初回の交差で監視を打ち切るので
  一度出たら戻りません（カードごとの時間差は付けていません）。`/`・`/works`・`/skills`・`/about` が対象で、
  ケーススタディ `/works/brew` と `/contact` のフォームカードは即表示です。
- **ヒーローのボタン列** — `RiseIn` に `lib/home.ts` の `heroActionsDelay` を渡し、打ち終わりの直後に続けます。
- **遷移先の要素へのスクロール** — Home の Design カードは `/skills` の Design カードまで
  滑らかにスクロールして着地します。`GlassCard` の `href` に `#id` を付けるとクリック時に
  `lib/scrollTarget.ts` へ id を預け、Next の自動スクロールを切って遷移し、着地側の
  `ScrollToTarget` が `scrollIntoView({ behavior: "smooth" })` を呼びます（URL にハッシュは残しません。
  App Router がルートごとにハッシュ付きの URL を保持していて、以後の普通の遷移でも復活するため）。
  オフセットは着地側の `scroll-mt-28` が持ちます。`ScrollToTarget` はルートレイアウトに1つだけ置き、
  遷移のたびに動きます（ページ側に置くと、着く前に別ページへ逸れた指定が残ってしまうため）。
- **JS 無効時の保険** — 表示待ちの要素は `opacity-0` で伏せているため、`app/globals.css` の
  `@media (scripting: none)` が `[data-typewriter-target]` / `[data-rise-in]` を元に戻します。

## 背景の正多面体

各ページの背景に、正多面体のワイヤーフレームを1つ置いています（`components/HeroGeometry.tsx`）。
**ビューポートに固定**（`fixed inset-0`）するのでスクロールしても位置が変わらず、カードやテキストが
その上を流れていきます（フロスト面のカードには裏から透けて見えます）。図形は元素の対応で割り当て、
いずれもビューポート右端で切れるように配置します。**`/contact` には置きません。**

| ページ | 図形 | 頂点 / 辺 | 元素 |
| --- | --- | --- | --- |
| `/` | 正二十面体 | 12 / 30 | 水 |
| `/works` | 正八面体 | 6 / 12 | 空気 |
| `/works/brew` | 正六面体 | 8 / 12 | 土 |
| `/skills` | 正四面体 | 4 / 6 | 火 |
| `/about` | 正十二面体 | 20 / 30 | 宇宙 |

- **座標** — `lib/polyhedra.ts` が5種の頂点を単位球上に持ち、**辺は「頂点間の最小距離にあるペア」から
  導出**します（正多面体では最短距離＝辺）。3D ライブラリは使いません。
- **自転** — `commons/Wireframe.tsx` が `requestAnimationFrame` で回転行列＋透視投影を計算し、
  SVG の `x1/y1/x2/y2` `cx/cy` を直接書き換えます（React の再レンダリングは通しません）。
  手前の頂点ほど大きく・濃く描いて奥行きを出します。描き直しは 30fps に間引いています。
- **線幅** — 辺は図形の大きさに関わらず 1px のヘアラインにします。`vector-effect: non-scaling-stroke`
  は使えない（dash の単位が画面ピクセルになり、下記の線引きが効かなくなる）ため、
  ResizeObserver で SVG の実サイズを測って `stroke-width` を user unit で逆算しています。
- **組み上げ** — 頂点のフェードインと辺の線引き（`stroke-dashoffset`）は CSS アニメーション
  （`animate-wf-vertex` / `animate-wf-edge`）で、遅延だけをインライン style で振ります。
  Home は `lib/home.ts` の `heroGeometryBuild`（＝h1 の打ち終わり）に完成を合わせ、他ページは 0.7 秒程度の
  軽い出現に留めます。**マウントするまで `animation-play-state: paused`** にして、hydration 後に始まる
  タイピングと起点を揃えます。
- **JS 無効 / reduced motion** — SVG は SSR 時点で完成しているので、`app/globals.css` が組み上げを
  無効化して素の姿で表示します。`prefers-reduced-motion: reduce` では自転もしません（閲覧中に
  OS 設定を切り替えても止まるよう、変更を購読しています）。
- **見えていないときは回さない** — CSS で `display:none` にしても rAF は回り続けるため、
  実幅が 0 のあいだは自転を止めています。
- **クロップ** — 枠は `fixed inset-0` なので、`overflow-hidden` が画面端で図形を切ります。
- **狭い画面** — md 未満では本文と重なるため、消さずに `opacity-45` で薄くします。位置と大きさは
  `PLACEMENTS` の `mobileFigure`（`max-md:` クラス）で上書きします。

## コンテンツ方針

- バイリンガル・日本語主体。UI ラベル・固有名詞・モノスペース注釈のみ英語で、絵文字は使いません。
- トーンはプロフェッショナル／技術寄り。
- 受託案件は契約上キャプチャ不可のため、匿名化テキストのケーススタディとして掲載しています。
  BREW ケーススタディのヒーロー（iPhone モック3枚）と「デザイン」の UI キャプチャは実画像
  （`public/works/brew/`）です。
- 日本語見出しフォントは LINE Seed JP が再配布不可のため、代替として IBM Plex Sans JP を使用しています。

## 現状

- サイト内のリンクはすべて設定済み（Home の「連絡する」ボタン・Contact Form・ヘッダーの contact はいずれも
  `/contact` へ。Home の GitHub / X、BREW ケーススタディのデモ / リポジトリは実 URL）。
- Resend / Turnstile とも実キーを取得済みで、ローカルでの送信・受信を確認済みです。送信元は
  `onboarding@resend.dev` のため、宛先は Resend アカウントの登録アドレスに限られます（上記の注意を参照）。
  デプロイ先では環境変数を設定したうえで再ビルドが必要です。
- `/api/contact` にレート制限は入れていません（永続ストアが必要なため）。Honeypot + Turnstile の2段で防いでいます。
