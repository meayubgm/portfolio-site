# portfolio-site

フロントエンドエンジニア **Megumi Ayuha** の個人ポートフォリオサイトです。デザインシステム
**Frost & Blueprint**（フロスト＝磨りガラス面、ブループリント＝設計図の格子）を
Next.js (App Router) + Tailwind CSS v4 で実装しています。

ページは `/`（Home）・`/works`（実績一覧）・`/works/brew`（BREW ケーススタディ）・`/skills`・
`/about`・`/contact` の6つ。**全ページを静的生成（SSG）**し、唯一の動的ルートが
お問い合わせ送信の Route Handler `/api/contact` です。Vercel でホストしています
（本番 <https://megumi-ayuha-v2.vercel.app>）。

## 技術スタック

| 領域 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 16.3（App Router / SSG・Turbopack） |
| 言語 | TypeScript 6 / React 19 |
| スタイリング | Tailwind CSS v4（CSS ファースト設定・`@theme`）+ clsx / tailwind-merge |
| フォント | Space Grotesk / Inter / JetBrains Mono / IBM Plex Sans JP（Google Fonts） |
| 日本語の改行 | BudouX 0.7（ビルド時に文節へ分割し `<wbr>` を埋め込む） |
| Lint / Format | Biome 2（汎用 lint + format）+ ESLint（Next Core Web Vitals + 独自ルール） |
| テスト | Playwright（E2E / デスクトップ2 + モバイル2プロジェクト） |
| フォーム | React Hook Form + Zod |
| メール送信 | Resend + Cloudflare Turnstile |
| 開発環境 | Docker（`node:24-alpine`）+ Make |
| ホスティング | Vercel |
| アクセス解析 | Vercel Web Analytics（`@vercel/analytics`。cookieless・同一オリジン配信） |

## 動作要件

- **Docker / Docker Compose v2**（開発サーバーはコンテナで動かします）
- **Node.js 20.9 以上**（Playwright をホストで実行するため、および Docker を使わない場合）
- Make

Docker Compose v1 の環境では `make up COMPOSE=docker-compose` のように上書きします。

## セットアップ

```bash
# 1. 環境変数（お問い合わせフォーム用）
cp .env.example .env.local

# 2. 開発サーバー起動 → http://localhost:3000
make up

# 3. E2E 用にホスト側の依存とブラウザを取得（初回のみ）
npm install
npx playwright install chromium webkit
```

ソースはコンテナへバインドマウントし、`node_modules` と `.next` は匿名ボリュームでコンテナ内のものを
使います。ホスト（macOS）は musl 非対応のため、アプリの依存はコンテナ内で解決してください
（ホスト側の `npm install` は Playwright を動かすためのものです）。

`.env.local` に入れる値は次の6つです。`.env` 系は git 管理外です。

| 変数 | 用途 |
| --- | --- |
| `SITE_URL` | サイトの本番 URL（canonical / OGP / sitemap の基準）。スキームは省略可、未設定でも動きます |
| `RESEND_API_KEY` | Resend の API キー |
| `CONTACT_TO_EMAIL` | 送信先（受信したいアドレス） |
| `CONTACT_FROM_EMAIL` | 送信元。共有ドメインの `onboarding@resend.dev` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile のサイトキー（クライアント側） |
| `TURNSTILE_SECRET_KEY` | Turnstile のシークレット（サーバー側） |

`.env.example` の Turnstile はローカル確認用の公式テストキー（常に成功）です。サイトキーが空の場合、
フォームはウィジェットの代わりに未設定の注記を表示します。環境変数が揃っていなくてもビルドは通り、
送信時に 500 を返します。

## コマンド

```bash
make up        # コンテナ起動（docker compose up -d）→ http://localhost:3000
make down      # 停止・削除
make logs      # ログ追跡
make sh        # app コンテナのシェルに入る
make rebuild   # キャッシュ無しで再ビルドして起動
make install   # コンテナ内で npm install
make lint      # Biome + ESLint（make lint-fix で自動修正）
make test-e2e  # ホストで npx playwright test（事前に make up）
make clean     # コンテナとボリュームを削除
make help      # 全ターゲット一覧
```

Docker を使わない場合は `npm run dev` / `npm run build` / `npm run start`。
**型チェックは `npm run build`（`next build`）に含まれます。**

E2E は UI モード（`npm run test:e2e:ui`）と HTML レポート（`npm run test:e2e:report`）も使えます。

> **Tip**: `app/globals.css` の `@theme` / `@utility` / `@custom-variant` を編集したのに新しい
> ユーティリティだけ効かない場合、dev サーバーが古い CSS を配っています。
> `docker compose exec app sh -c 'rm -rf .next/*'` のうえ `docker compose restart app` で直ります。

## ディレクトリ構成

依存は **`app/` → `components/` → `commons/` の一方向**で、`commons/` から `components/` は参照しません。
import には `@/` エイリアスを使います（`tsconfig.json` の `paths` でリポジトリルートに解決）。

```
portfolio-site/
├── app/                     # App Router
│   ├── layout.tsx           # 共通レイアウト（ナビ・アンビエントグロー・最大幅コンテナ・フッター・ScrollToTarget）
│   ├── globals.css          # Tailwind v4 の @theme にデザイントークンを統合
│   ├── icon.svg / icon.png / apple-icon.png   # metadata ファイル
│   ├── opengraph-image.tsx  # OGP 画像（next/og。全ルートに継承される）
│   ├── sitemap.ts / robots.ts # サイトマップと robots
│   ├── api/contact/route.ts # お問い合わせ送信（POST。Honeypot → Turnstile → Resend）
│   └── (pages)/             # Route Group（括弧付きなので URL に現れない）
│       ├── page.tsx         # Home（/）
│       ├── works/page.tsx   # 実績一覧（/works）
│       ├── works/brew/page.tsx  # BREW ケーススタディ（/works/brew）
│       ├── skills/page.tsx  # スキル（/skills）
│       ├── about/page.tsx   # 自己紹介（/about）
│       └── contact/page.tsx # お問い合わせ（/contact）
├── commons/                 # ドメイン非依存の DS プリミティブ（21種）
├── components/              # このサイト固有のコンポーネント（8種）
├── lib/                     # データとユーティリティ
├── e2e/                     # Playwright E2E（smoke / navigation / motion / geometry / responsive）
├── eslint-rules/            # 独自 ESLint ルール（no-conditional-jsx）
├── public/works/brew/       # BREW ケーススタディの画像
├── .design-sync/            # claude.ai/design 連携の入力（config / entry / sync-tsconfig /
│                           #   compile-css / conventions / NOTES / stubs / previews）
├── WORK_LOG/                # 作業セッションのサマリー
├── Dockerfile / compose.yaml / Makefile
├── biome.json / eslint.config.mjs / playwright.config.ts / .mcp.json
└── next.config.mjs / postcss.config.mjs / tsconfig.json / .env.example
```

### commons/（DS プリミティブ）

| コンポーネント | 役割 |
| --- | --- |
| `Text` | サイト内テキストの共通入口（`variant` / `tone`）。`textStyles` / `toneStyles` も export |
| `Phrase` | 日本語を文節単位で折り返す（BudouX。**サーバーコンポーネント専用**） |
| `GlassCard` | フロスト面のカード。マウス追従グロー・クリック遷移・scroll reveal（client） |
| `CardGrid` | セクショングリッド（lg 以上で 6 カラム、それ未満は 1 カラム） |
| `CardLabel` / `EyebrowLabel` / `MonoHeading` / `Tag` / `TagList` | mono 系のラベル・見出し・タグ |
| `Button` / `LinkRow` / `BackLink` | ボタンとリンク行、ページ末尾の戻りリンク |
| `HoverCue` / `LearnMoreCue` | 親カードのホバー時に出る導線テキスト |
| `LabeledField` / `StatBlock` / `BulletList` | 破線区切りのラベル付き本文、数値ブロック、箇条書き |
| `Typewriter` | 文字を左から打ち込むテキスト（client） |
| `RiseIn` | 指定時間後に浮き上がって現れるブロック（client） |
| `Wireframe` | 正多面体の線画。自転と組み上げ（client） |
| `ScrollToTarget` | 遷移先の要素へスムーススクロール（client） |

### components/（サイト固有）

| コンポーネント | 役割 |
| --- | --- |
| `SiteNav` | ナビ。active 判定・スクロール連動の出し入れ・sm 未満のハンバーガーメニュー（client） |
| `PageHeader` / `PageHeading` | ページ共通の header ラッパーと eyebrow + h1 + リード文（hero / list / detail） |
| `HeroGeometry` | 背景の正多面体（ページ→図形・配置の対応表 `PLACEMENTS`） |
| `ContactForm` / `FormField` | お問い合わせフォーム（client）と入力行 |
| `SkillBar` / `SkillName` | Home のスキルバーと `/skills` のスキル名 |

### lib/（データとユーティリティ）

| モジュール | 内容 |
| --- | --- |
| `cases.ts` | 実績データ。`brewCase`（3ページから参照する単一ソース）・`cases`・`otherWorks` |
| `skills.ts` | スキルデータ（Development / Design / Tools）。Home と `/skills` の単一ソース |
| `about.ts` | About のテキスト（挨拶文・強み・人となり・好きなもの・やってみたいこと・来歴） |
| `home.ts` | Home ヒーローの文言・文節・タイピングのスケジュール |
| `phrase.ts` | BudouX のパーサ（**サーバー専用**） |
| `contactSchema.ts` | お問い合わせフォームの検証ルール（Zod。クライアント / API で共用） |
| `site.ts` | サイト URL・名前・説明文・ルート一覧（metadata / sitemap / robots / OGP の単一ソース） |
| `metadata.ts` | ページ別 metadata を組み立てる `pageMetadata()` |
| `cn.ts` | clsx + tailwind-merge のクラス結合（衝突は後勝ち） |
| `useRiseIn.ts` / `scrollTarget.ts` | 浮き上がりのフック、遷移をまたぐスクロール指定の受け渡し |
| `polyhedra.ts` | 正多面体5種の頂点データ（辺は頂点間の最小距離から導出） |

## データの持ち方

ページに表示する内容は `lib/` のデータモジュールに集約し、ページはそれを map して描画します。

- **`lib/cases.ts`** — featured の `brewCase` は Home / `/works` / `/works/brew` の3ページが参照します。
- **`lib/skills.ts`** — 各グループ（Development / Design / Tools）は `id`（`/skills` のアンカー。Home の
  Design カードからのスクロール先）、`sections`（職能ベースの分類。`heading` を省くと見出し無しの
  単一セクション）、`layout`（`/skills` でのカード幅 `span` とセクションの列数 `columns`）を持ちます。
  Development は span 6 / 2列（左＝フロントエンド、右＝バックエンド + AI活用。列の指定は各 section の
  `column`）、Design と Tools は span 3 / 1列です。
  `note` は Home のカード用で、`/skills` では `skillsNote`（あれば）を優先し、`description` は
  `/skills` にだけ表示します。
  **`percent` は optional で、Home に載せるかどうかの分岐を兼ねます**（値はバーの長さ）。Home は
  `percent` を持つ項目だけを残した派生配列 `homeSkillGroups` を使い、並べ替えはしません。
  `homeName` を持つ項目は Home でだけその名前で表示します（React が `homeName: "React / Next.js"` を持ち、
  Next.js 側が `percent` を持たないことで Home の1本のバーにまとまります）。`/skills` は `percent` の
  有無にかかわらず全項目をバー無し（`SkillName`）で表示します。
- **`lib/home.ts`** — ヒーローの文言（`heroCopy`）、それを文節に分けた `heroPhrases`、タイピングの
  遅延と速度（`heroTyping`）。遅延は文字数から静的に算出するため、文言を書き換えれば
  スケジュールも追従します。

## デザイントークン

DS 固有トークン（フォント・角丸・影・字間・h1 のサイズ段・コンテナ幅）を CSS 変数として
Tailwind テーマに統合しています（`app/globals.css` の `@theme`）。変数を足せばそのまま
ユーティリティが生成されます。設定は Tailwind v4 の CSS ファースト方式で、`tailwind.config.js` は
持ちません。

| 変数 | 生成されるユーティリティ |
| --- | --- |
| `--font-display` / `--font-body` / `--font-mono` | `font-display` / `font-body` / `font-mono` |
| `--radius-card` | `rounded-card` |
| `--shadow-card-hover` | `shadow-card-hover` |
| `--tracking-heading` / `--tracking-label` | `tracking-heading`（h1 共通字間）/ `tracking-label`（mono ラベル 0.06em） |
| `--text-hero` / `--text-page` / `--text-detail` | h1 の3サイズ。`--text-*--line-height` を対で置くので行間も決まる |
| `--container-site` | `max-w-site`（サイト全体の最大幅 1800px） |
| `--animate-wf-vertex` / `--animate-wf-edge` | 正多面体の組み上げアニメーション |

`@theme` に収まらない面と variant は `@utility` / `@custom-variant` で定義します
（featured カードの `bg-featured`、画面上部の `bg-ambient-glow`、ホバー非対応環境向けの `hover-none:`）。

**色は Tailwind の組み込みパレット（slate / sky / indigo）に準拠**し、custom な `--color-*` トークンは
持ちません（`text-slate-900` / `text-sky-700` / `border-indigo-600/15` のように直接使用）。
背景のブループリント格子は `--grid-cell` と `body` への直接適用で描き、淡い indigo は `color-mix` で
パレット変数から生成します。

**文字サイズ・行間は Tailwind 標準スケールのみ**（`xs` 〜 `2xl`、`leading-5` 〜 `leading-8`）。
サイト内のテキストは `commons/Text.tsx` の `Text` を経由し、`variant`（サイズ・行間・ウェイト・
font-family）と `tone`（文字色）から選びます。h1 だけレスポンシブな `clamp()` が要りますが、これも
`@theme` にトークン化してあり、`PageHeading` はユーティリティを当てるだけです。段落用の `lead` /
`body` は `text-justify` で右端を揃えます（文節改行を当てた段落は `text-left` に戻します）。

## 日本語の文節改行（BudouX）

見出し・リード文・カード見出しは、文節の途中で折り返さないようにしています。ビルド時に BudouX で
文節へ分割して `<wbr>` を埋め込み、`word-break: keep-all`（＋ 長い文節向けの `wrap-break-word`）と
組み合わせて「`<wbr>` の位置でだけ改行する」表示にします。

- 入口は **`commons/Phrase.tsx`**（サーバーコンポーネント専用）。`<Phrase>実績一覧</Phrase>` のように
  文字列か行配列を渡します。クライアントへ BudouX のモデルを送らないため、`commons/Typewriter.tsx` は
  パース済みの配列を props で受け取ります。
- 打ち込み中のテキストは未入力ぶんを `visibility: hidden` で確保するので、折り返し位置は最初から
  完成形と一致します。1文字も打つ前は空にして、静的 HTML にテキストが二重に入らないようにしています。
- `<wbr>` はテキストを持たないため、`textContent` もアクセシブルネームも変わりません。
- BudouX が切り間違える語は `lib/phrase.ts` の `NO_BREAK_WORDS` で直します。
- **BudouX は 0.7 を使います。** 0.8 以降は `google-artifactregistry-auth` を `dependencies` に持ち、
  本番依存が約40パッケージ増えます（パーサと日本語モデルは同じ）。

## レスポンシブ

切り替え点は **`sm`（640px）と `lg`（1024px）の2つ**です。`md`（768px）は背景の正多面体の見せ方にだけ使います。

| 幅 | ナビ | カード | 左右余白 / カード padding |
| --- | --- | --- | --- |
| `< sm`（〜639px） | ハンバーガーメニュー。SiteNav は透明・常時表示 | 1 カラム | `px-5.5`(22px) / `p-4`・`p-5` |
| `sm 〜 lg`（640〜1023px） | 横並びのリンク列 | 1 カラム | `px-8`(32px) / `p-7`・`p-9` |
| `>= lg`（1024px〜） | 横並びのリンク列 | 6 カラムグリッド | 同上 |

- **段組み** — `CardGrid` が `grid-cols-1 lg:grid-cols-6`、`GlassCard` が `lg:col-span-*` /
  `lg:col-start-*` を持ちます（値は 1〜6 の `GridColumn` 型）。カード内の 2 列組み（`/skills` の
  Development、`/works/brew` の実装済み/今後）も同じ `lg:` で揃えます。
- **ハンバーガーメニュー** — 右上の 3 本線（indigo）を押すと × に変わり、`GlassCard` のパネルが
  上から下へ伸びて出ます。パネル内はロゴ + home〜contact の 2 列で、現在地の先頭には「+」が付きます。
  遷移すると自動で閉じ、ロゴは開閉のどちらでも同じ位置に出ます。
- **Home ヒーローの高さは `h-svh`** — iOS Safari / Chrome Android の `100vh` は URL バーが隠れたときの
  高さなので、`100vh` だと実機の初期表示で CTA 列がバーの下に潜ります。`svh` はバーの出入りで値が
  変わらないためレイアウトも跳ねません。**Playwright のエミュレーションでは `innerHeight` が `100vh` と
  一致するので、この不具合は e2e で検知できません。**
- **左右余白 22px は SiteNav と連動** — 中央コンテナの `px-5.5 sm:px-8` は `SiteNav` の `max-sm:px-5.5` と
  メニューパネルのオフセットに揃えてあり、狭い画面でロゴ・ハンバーガー・カード左端が一直線に並びます。
- **カードの padding** — `GlassCard` が `p-4 sm:p-7`（`padding="lg"` は `p-5 sm:p-9`）。メニューパネルは
  `SiteNav` 側が `className` で `p-2.5 sm:p-7` に上書きします。
- **横並びの解除** — `/about` の来歴（期間ラベル + 本文）は全幅で縦積み。`/works` の featured カードの
  タグ列 + learn more は `sm` で横並びに戻します。「その他」カードの行は sm 未満では期間を上・案件名を
  下にした縦並び（DOM 順は案件名 → 期間のまま `flex-col-reverse` で入れ替え）、`sm` 以上で左右に
  振り分けます。
- **featured カードの `StatBlock` 3連** — 等幅の grid ではなく `flex-wrap` で並べます。各ブロックは
  内容幅のまま左に詰まり、幅が足りなくなったぶんだけ次の行へ折り返します（375px で 2 + 1）。
- **セクション下の余白** — `CardGrid` と `/works/brew` の本文が `pb-12 sm:pb-16`。
- **`/works/brew`** — 内側の左右 padding は `sm:px-4 lg:px-9` で、sm 未満は中央コンテナの `px-5.5` だけに
  なり他ページと左端が揃います。iPhone モック 3 枚は `sm` で横並びに戻します
  （`next/image` の `sizes` も padding に合わせます）。
- **Turnstile** — 常に `normal`（300px）で描画し、置き場の実幅まで `scale` で縮めてカード内の入力欄と
  幅を揃えます（375px で 289px）。倍率の上限は 1 なので lg 以上では 300px のままです。`ResizeObserver` が
  幅と高さを見張って追従するため、画面を回転してもトークンを作り直しません。

## Client / Server の切り分け

- ページ本体とほとんどのコンポーネントは Server Component で、全ページが静的生成されます。
  唯一の動的ルートが `app/api/contact/route.ts` です。
- `"use client"` は7ファイル: `GlassCard`（マウス追従グロー・クリック遷移・scroll reveal）・
  `Typewriter`（タイピング）・`RiseIn`（浮き上がり）・`Wireframe`（正多面体の自転）・
  `ScrollToTarget`（遷移先へのスムーススクロール）・`SiteNav`（`usePathname` とスクロール連動）・
  `ContactForm`（フォーム状態と Turnstile）。
  これに加えて `app/layout.tsx` が `@vercel/analytics` の `<Analytics />`（client）を置いていますが、
  `layout.tsx` 自体は Server Component のままです。
- カード全体をリンクにする場合は、ページを Server のまま保つため `GlassCard` に `href` を渡します
  （内部で `useRouter().push`。カード内に `<a>` が入るため `<a>` のネストは避けています）。

## モーション

アニメーションライブラリは使わず、CSS transition と IntersectionObserver で実装します。
いずれも `prefers-reduced-motion: reduce` で即時表示に切り替わります。

- **SiteNav** — 下スクロールで `-translate-y-full`、上スクロールで復帰（最上部 80px 以内では隠さず、
  sm 未満では常に上部に留まります）。隠れている状態でリンクにフォーカスが入ったら出し直します。
  現在地は `text-indigo-600`、それ以外は `text-slate-600`。ホバーで `GlassCard` 右上と同じ「+」が
  リンクの先頭に絶対配置でフェードインし、ロゴは Y 軸に1回転します。
- **メニューパネル（sm 未満）** — `grid-template-rows: 0fr → 1fr` と子の `overflow-hidden` で伸縮します。
  畳むアニメーションを見せるためパネルは常時マウントし、`visibility` で出し入れします
  （閉じている間は accessibility tree からも外れます）。
- **Home ヒーロー** — `Typewriter` が eyebrow / h1 / mono行 / リード文を左から打ち込みます。遅延と速度は
  `lib/home.ts` が文字数から算出します（h1 は eyebrow に少し重ねて始まり、両方が終わってから
  mono行とリード文が同時に始まる）。完成テキストは `opacity-0` で重ねたまま DOM に残すため、
  高さが動かず SSG の HTML にも文言が載ります。
- **浮き上がり** — `opacity-0 translate-y-4` → `opacity-100 translate-y-0` を 0.5 秒の transition で
  同時に動かします（`lib/useRiseIn.ts` に集約）。ヒーローのボタン列は時間で始める `RiseIn`、
  カードは `GlassCard` の `reveal`（`IntersectionObserver` の初回交差で監視を打ち切るので、
  一度出たら戻りません）。`reveal` は `/`・`/works`・`/skills`・`/about` の一覧系カードが使い、
  `/works/brew` と `/contact` のフォームカードは即表示です。
- **遷移先の要素へのスクロール** — Home の Design カードは `/skills` の Design カードまで滑らかに
  スクロールして着地します。`GlassCard` の `href` に `#id` を付けるとクリック時に `lib/scrollTarget.ts` へ
  id を預け、Next の自動スクロールを切って遷移し、着地側の `ScrollToTarget` が
  `scrollIntoView({ behavior: "smooth" })` を呼びます。URL にハッシュは残しません。
  オフセットは着地側の `scroll-mt-28` が持ちます。
- **JS 無効時の保険** — 表示待ちの要素は `opacity-0` で伏せているため、`app/globals.css` の
  `@media (scripting: none)` が `[data-typewriter-target]` / `[data-rise-in]` を元に戻します。

## 背景の正多面体

各ページの背景に正多面体のワイヤーフレームを1つ置きます（`components/HeroGeometry.tsx` の
`PLACEMENTS` に対応表があり、描画は `commons/Wireframe.tsx`）。3D ライブラリは使いません。
**ビューポートに固定**（`fixed inset-0`）するのでスクロールしても位置が変わらず、カードやテキストが
その上を流れます（フロスト面のカードには裏から透けます）。図形は元素の対応で割り当て、いずれも
ビューポート右端で切れるように配置します。**`/contact` には置きません。**

| ページ | 図形 | 頂点 / 辺 | 元素 |
| --- | --- | --- | --- |
| `/` | 正二十面体 | 12 / 30 | 水 |
| `/works` | 正八面体 | 6 / 12 | 空気 |
| `/works/brew` | 正六面体 | 8 / 12 | 土 |
| `/skills` | 正四面体 | 4 / 6 | 火 |
| `/about` | 正十二面体 | 20 / 30 | 宇宙 |

- **座標** — `lib/polyhedra.ts` が5種の頂点を単位球上に持ち、**辺は頂点間の最小距離にあるペアから
  導出**します（正多面体では最短距離＝辺）。
- **自転は JS、組み上げは CSS** と役割を分けます。自転は `requestAnimationFrame` が回転行列と透視投影を
  計算して SVG の座標属性を直接書き換え（React の再レンダリングは通しません）、30fps に間引きます。
  手前の頂点ほど大きく・濃く描いて奥行きを出します。組み上げ（頂点のフェードインと辺の線引き）は
  `@theme` のアニメーションで、Home は h1 の打ち終わりに完成を合わせ、他ページは 0.7 秒程度の
  軽い出現に留めます。
- **線幅** — 辺は図形の大きさに関わらず 1px のヘアラインです。ResizeObserver で SVG の実サイズを測り、
  `stroke-width` を user unit で逆算します。
- **狭い画面** — md 未満では本文と重なるため、消さずに `opacity-45` で薄くします。位置と大きさは
  `PLACEMENTS` の `mobileFigure`（`max-md:` クラス）で上書きし、Home の図形は sm 未満で 1.5 倍にします。
- **JS 無効 / reduced motion** — SVG は SSR 時点で完成しているので、`app/globals.css` が組み上げを
  無効化して素の姿で表示します。`prefers-reduced-motion: reduce` では自転もしません。

## お問い合わせフォーム（/contact）

ページ自体は SSG で、送信だけが `POST /api/contact`（Route Handler）です。`components/ContactForm.tsx` が
入力（氏名 / 会社名（任意）/ メール / 本文）を JSON で POST し、Route Handler が
**Honeypot → Turnstile 検証 → Resend でメール送信**の順に処理します。

入力検証は **React Hook Form + Zod**。スキーマは `lib/contactSchema.ts` に置き、クライアントと
Route Handler の双方が同じルールを参照します（Route Handler 側は Honeypot と Turnstile トークンを
足した `contactPayloadSchema`）。検証は送信ボタン押下時に走り、エラーは各項目の直下に表示されます。

ボット対策は **Honeypot + Turnstile の2段**です。Honeypot に該当した送信は、検知を悟らせないため
`200 { ok: true }` を返してメール送信だけをスキップします。連投の抑止はホスティング基盤側の
レート制限が担当します（「[セキュリティ](#セキュリティ)」参照）。

> **送信元と宛先**: 独自ドメインを Resend で検証していないため、送信元は共有ドメインの
> `onboarding@resend.dev` です。この構成では Resend の sandbox 制限により、**宛先は Resend アカウントの
> 登録メールアドレスに限られます**。別のアドレスを `CONTACT_TO_EMAIL` に指定すると Resend が 403 を返し、
> `[contact] resend error:` がログに出て 500 になります。別アドレスで受け取るには独自ドメインの
> 取得と検証（MX / SPF / DKIM）が必要です。

> **ビルド時の環境変数**: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` は `NEXT_PUBLIC_` 接頭辞のとおり
> **ビルド時にバンドルへ埋め込まれます**。実行時にだけ環境変数を渡す構成では空文字のままになり、
> ウィジェットが出ず送信が 400 になります。`next build` を実行する環境（Vercel なら
> Environment Variables）に必ず設定してください。

> **Turnstile のホスト名**: FQDN のみでワイルドカードは使えず、登録したホスト名の配下の
> サブドメインだけが自動許可されます。Vercel のプレビューデプロイは
> `<project>-<hash>-<team>.vercel.app` という**兄弟サブドメイン**になるため、本番ホスト名を
> 登録してもプレビューでは Turnstile を通過できません。

## SEO とメタデータ

サイト URL・名前・説明文・ルート一覧は **`lib/site.ts` が単一ソース**で、metadata / sitemap / robots /
OGP 画像がここを参照します。URL は `SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL`（Vercel が自動で
入れる本番ホスト名）→ `http://localhost:3000` の順にフォールバックするので、`SITE_URL` を
設定しなくても本番ドメインを向きます。**いずれもビルド時に評価される**ため、値を変えたら再デプロイが要ります。

| 出力 | 実装 | 内容 |
| --- | --- | --- |
| 共通 metadata | `app/layout.tsx` | `metadataBase`・`title.template`（`fullTitle("%s")`）・description・OGP・`twitter:card`・`robots` |
| ページ別 metadata | `lib/metadata.ts` の `pageMetadata()` | title（短い側だけ）・description・canonical・OGP。各ページはこれを呼ぶだけ |
| OGP 画像 | `app/opengraph-image.tsx` | `next/og` の `ImageResponse` で 1200×630 を静的生成。`app/` 直下なので全ルートに継承される |
| サイトマップ | `app/sitemap.ts` | `lib/site.ts` の `sitePaths` を map |
| robots | `app/robots.ts` | 全許可 + `/api/` を除外、sitemap の場所を明示 |
| 構造化データ | `app/(pages)/page.tsx` | Home にだけ `Person` の JSON-LD |

- **ページを増やしたら `lib/site.ts` の `sitePaths` にも足します**（sitemap から漏れます）。
- **OGP 画像に日本語は書きません。** `ImageResponse` は同梱の欧文フォントしか持たず、日本語を出すには
  フォントファイルを抱える必要があるためです。文言は英字のみ、図はサイトと同じブループリント格子 +
  正六面体のワイヤーフレームです。
- **ページ側で `openGraph` を持つと、ルートの openGraph は継承されず丸ごと置き換わります。**
  `pageMetadata()` が `type` / `locale` / `siteName` / og:image まで書き直しているのはこのためで、
  減らすと該当のタグだけがトップ以外から消えます。
- タイトルの区切りは `lib/site.ts` の `fullTitle()` が持ちます（`<title>` の `title.template` と
  og:title の両方がこれを通るため、食い違いません）。
- サイトマップに `lastmod` は入れません（ビルド時刻を入れると無変更のデプロイでも全 URL が
  更新され、当てにならない値としてクローラに無視されます）。

## セキュリティ

`next.config.mjs` の `headers()` が全レスポンス（`source: "/:path*"`）に次を付けます。

| ヘッダー | 値 |
| --- | --- |
| `Content-Security-Policy` | 下記 |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` |
| `X-Frame-Options` | `DENY` |

### CSP

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: blob:;
connect-src 'self' https://challenges.cloudflare.com;
frame-src https://challenges.cloudflare.com;
frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';
upgrade-insecure-requests
```

外部の配信元は Turnstile（script / frame / connect）と Google Fonts（`globals.css` の `@import` で
読む CSS が `fonts.googleapis.com`、実フォントが `fonts.gstatic.com`）の2つだけです。
Vercel Toolbar（`vercel.live`）は含めていません。Toolbar 設定が Pre-Production / Production とも
`Default`（チームレベルで無効）で、プレビューデプロイをログイン状態で開いても CSP 違反が
出ないことを確認済みです。

**`script-src` に `'unsafe-inline'` が残っているのは意図的です。** Next はページごとに
インラインの `self.__next_f.push(...)` を吐き、Home には JSON-LD の `<script>` もあります。
これを nonce で許可するにはリクエストごとに値を変える必要があり `middleware.ts` が要りますが、
middleware を置くと全ページが dynamic レンダリングに落ちて SSG が効かなくなります。
このサイトはユーザー入力を描画する箇所を持たない（`dangerouslySetInnerHTML` は自前定数の
JSON-LD 1箇所のみ）ため、**インライン script の遮断より SSG を採り**、CSP の役割は
読み込み元オリジンの限定と、XSS を前提としない指示（`frame-ancestors` / `base-uri` /
`form-action` / `object-src`）に置いています。

開発時だけ `script-src` に `'unsafe-eval'`（React Refresh）と `https://va.vercel-scripts.com`
（Vercel Analytics のデバッグ用スクリプト）、`connect-src` に `ws:`（HMR）を足します。
**本番の CSP はアクセス解析の導入前後で変わりません** — Vercel Analytics はスクリプトも計測ビーコンも
同一オリジン（`/_vercel/insights/*`）なので `'self'` で足ります。

`lib/contactSchema.ts` の `z.config({ jitless: true })` はこの CSP とセットです。Zod は初回の parse で
`Function("")` を試して JIT の可否を判定するため、これを止めないと `/contact` で CSP 違反が1件記録されます
（Zod 自体は jitless にフォールバックするので動作は壊れません）。

**レート制限はアプリ側に持ちません。** Serverless では実行インスタンスをまたげず、モジュールスコープの
カウンタが当てにならないためです。正規の Turnstile トークンを取ったうえでの連投は、ホスティング基盤側
（Vercel Firewall）の Custom Rule で止めます。ルールの内容は「デプロイ」を参照してください。

## デプロイ

**Vercel** でホストします。GitHub リポジトリと連携しているので、`main` への push がそのまま本番
デプロイになります。ビルドは `next build`（型チェック込み）で、出力は SSG のページ群 +
`/api/contact` の Function です。

### 環境変数（Vercel の Environment Variables）

セットアップ節の6つのうち、`SITE_URL` 以外の5つを Production に設定します。`SITE_URL` は
`VERCEL_PROJECT_PRODUCTION_URL` へのフォールバックが効くため、独自ドメインを当てるときに設定します。
**`NEXT_PUBLIC_TURNSTILE_SITE_KEY` はビルド時にバンドルへ埋め込まれる**ので、値を追加・変更したら
再デプロイが必要です。

### Turnstile のホスト名

Cloudflare Turnstile のウィジェット設定に、本番ホスト名（`megumi-ayuha-v2.vercel.app`）を FQDN で
登録します。プレビューデプロイは兄弟サブドメインになり自動許可の対象外なので、`/contact` の送信まで
確認するのは本番デプロイで行います。

### レート制限（Vercel Firewall）

Project → Firewall → Custom Rules に `/api/contact` 宛のルールを1つ置きます。

| 項目 | 値 |
| --- | --- |
| If | `Request Path` equals `/api/contact` |
| Then | Rate Limit — 5 requests / 60 seconds |
| Keyed by | IP Address |
| 超過時 | Deny（429） |

ルールは **Save のあと Publish** して初めて反映されます。`Challenge` ではなく `Deny` を選ぶのは、
`fetch` で叩く API にチャレンジ画面を返しても JSON にならないためです。

### アクセス解析（Vercel Web Analytics）

`app/layout.tsx` が `@vercel/analytics/next` の `<Analytics />` を置いています。**Project → Analytics
から Web Analytics を Enable しないとデータが入りません**（有効化前は `/_vercel/insights/script.js` が
404 を返します）。

計測スクリプトは同一オリジンの `/_vercel/insights/script.js`、ビーコンの送信先も同じ
`/_vercel/insights/` 配下（ページビューは `view`、`track()` のカスタムイベントは `event`）なので、
**CSP に外部の配信元を足さずに済みます**。これが GA4 や
Cloudflare Web Analytics ではなくこれを選んだ理由です。**cookie を使わない**ので同意バナーと
プライバシーポリシーページも置いていません。取れるのはページビュー・リファラー・国・デバイス程度です。

`<Analytics />` は client component ですが、`app/layout.tsx` 自体は Server Component のままなので
**全ページが SSG のまま**です（`next build` の出力が `○ (Static)` であることで確認できます）。
`make up`（`next dev`）ではデバッグ用スクリプト（`va.vercel-scripts.com`）が読まれるだけで、
データは送られません。一方、Docker を起動せずに `npx playwright test` を実行したときや CI では
`playwright.config.ts` の `webServer` が `npm run build && npm run start` で立ち上がるため、
**本番と同じ `/_vercel/insights/script.js` を要求して 404 になります**（Vercel の外なので当然で、
テストは落ちません）。ログに毎回この 404 が並ぶのはこの経路です。

### 公開後の確認

```bash
# セキュリティヘッダー
curl -sSI https://megumi-ayuha-v2.vercel.app/ | grep -iE 'content-security-policy|x-content-type-options|referrer-policy|permissions-policy|x-frame-options'

# レート制限（Honeypot 欄を埋めるとメール送信はスキップされる）
for i in $(seq 1 8); do curl -s -o /dev/null -w "%{http_code}\n" -X POST https://megumi-ayuha-v2.vercel.app/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"t","email":"t@example.com","message":"test","website":"bot"}'; done
```

OGP の見え方は Facebook Sharing Debugger（再取得ができます）や opengraph.xyz で確認します。
X の Card Validator は提供が終了しているため、投稿画面のプレビューで代用します。

## E2E テスト

**Playwright**（`@playwright/test`）で実装します。開発コンテナ（`node:24-alpine`）は Playwright の
ブラウザに対応しないため、**テストはホスト（macOS）で実行**し、Docker が配信する
`http://localhost:3000` を叩きます（`make up` → `make test-e2e`）。

```bash
make up            # Docker でアプリ起動（:3000）
make test-e2e      # = npx playwright test
npm run test:e2e:ui        # UI モード
npm run test:e2e:report    # 直近の HTML レポート
```

`playwright.config.ts` の `webServer` は `reuseExistingServer: true` で、:3000 が使われていれば
それを再利用し、Docker 未起動時や CI（Linux）では `npm run build && npm run start` で
フォールバック起動します。

プロジェクトは4つ。`chromium` / `webkit`（いずれも 1280px）はデスクトップ幅の期待値で書かれた spec を
走らせ、`testIgnore` で `responsive.spec.ts` を外します。`mobile-chrome`（Pixel 5）と
`mobile-safari`（iPhone 13）は `testMatch` で `responsive.spec.ts` だけを拾います。
`smoke.spec.ts` は表示に加えて **canonical / OGP / sitemap / robots / セキュリティヘッダー / CSP**も見ます
（CSP はヘッダーをディレクティブ単位に分解して、配信元が正しいディレクティブに載っているかまで見ます）
（画面に出ないため、抜けても目視では気づけないものです）。

`e2e/` と `playwright.config.ts` は `tsconfig.json` の `exclude` に入れて `next build` の型チェックから
外しています。

`.mcp.json` の Playwright MCP は探索的なブラウザ確認の補助で、リグレッション検知は
`@playwright/test` に一任します。

## lint / format

**Biome 2**（`biome.json`）と **ESLint**（`eslint.config.mjs`）を役割で分けています。
**Biome = 汎用 lint + format**、**ESLint = `@next/eslint-plugin-next` の Core Web Vitals ルール +
プロジェクト独自ルール**。react / a11y は Biome に一任し、整形も Biome が行います。
CSS / SVG / `tsconfig.json` / `.claude` は `biome.json` の `files.includes` で対象外にしています。

チェックは `npm run lint`（= `biome check && eslint . --max-warnings 0`）、自動修正は `npm run lint:fix`。
機械的に強制している規約は2つで、詳細は `CLAUDE.md` にあります。

- 波括弧を省略しない（Biome の `style/useBlockStatements`）
- 三項演算子で JSX を出し分けない（`eslint-rules/no-conditional-jsx.mjs`）

## コンテンツ方針

- バイリンガル・日本語主体。UI ラベル・固有名詞・モノスペース注釈のみ英語で、絵文字は使いません。
- トーンはプロフェッショナル／技術寄り。
- 受託案件は契約上キャプチャ不可のため、匿名化テキストのケーススタディとして掲載します。
  BREW ケーススタディのヒーロー（iPhone モック3枚）と「デザイン」の UI キャプチャは実画像です。
- 日本語の見出しフォントは再配布可能なライセンスであることを条件に選び、IBM Plex Sans JP を使います。
