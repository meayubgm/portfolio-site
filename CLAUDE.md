# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

フロントエンドエンジニア「Megumi Ayuha」の個人ポートフォリオサイト。
Claude Design で作成したプロトタイプ（**Frost & Blueprint** デザインシステム）を、
Next.js 16 (App Router) + Tailwind CSS v4 で実装したもの。全ページ静的生成（SSG）。
唯一の例外がお問い合わせフォームの送信先 `app/api/contact/route.ts`（Route Handler = 動的）。

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
| `--tracking-label` | `tracking-label`（mono ラベル共通字間 0.06em） |

featured カード（BREW）のグラデーション面は `@theme` ではなく `@utility bg-featured` として定義している。

- **色は Tailwind の組み込みパレット（slate / sky / indigo）へ寄せている**。custom な `--color-*` トークンは廃止し、マークアップは組み込みユーティリティを直接使う（`text-slate-900`＝旧 navy、`text-slate-600`＝旧 slate、`text-slate-500`＝旧 slate-soft、`text-sky-700`＝旧 glow-c、`text-indigo-600`＝旧 indigo、`border-indigo-600/15`＝旧 indigo-soft、`bg-slate-200`＝旧 ice-2）。**新しい色は原則パレットから選ぶ**。ピクセル完全一致より Tailwind パレット準拠を優先する方針（過去の色トークン群は近似シフトで移行済み）。
- `tailwind.config.js` は存在しない（v4 の CSS ファースト設定）。設定はすべて `globals.css`。
- **文字サイズ・行間は Tailwind 標準スケールに揃えている**。かつてはプロトタイプ再現のため `text-[14.5px]` のような
  arbitrary value を使っていたが、サイズ16段階・行間8段階まで乱立したため `xs / sm / base / lg / xl / 2xl` と
  `leading-5 / 6 / 7 / 8`（`text-sm/6` 記法）へ丸めた。**カスタムのサイズ段は持たない**（`xs` = 12px が最小）。
  **本文・見出し・ラベルは直接クラスを書かず `commons/Text.tsx` の `Text` を使う**（後述）。
  h1 だけは `clamp()` によるレスポンシブ指定のため `PageHeading` 内に arbitrary value で残している。
- Tailwind の preflight が `*` に `margin: 0; padding: 0` を当てるため、**`p` / `h1`-`h6` / `ul` に `m-0` を書く必要はない**（かつて全要素に付いていた `m-0` は冗長だったので一括削除した）。リスト記号とインデントも preflight で消えるので、必要な箇所だけ `list-disc pl-[1.3em]` を明示する。
- 背景のブループリント格子（`--grid-cell` + `body` 直接適用）と、格子・面の淡い indigo は `color-mix(in srgb, var(--color-indigo-600) 6%, transparent)` のように Tailwind パレット変数から生成する。

### Client / Server の切り分け

- ページ本体（`app/**/page.tsx`）とほとんどのコンポーネントは Server Component。
- `"use client"` は **`commons/GlassCard.tsx`**（マウス追従グロー＋クリック遷移）・**`components/SiteNav.tsx`**（`usePathname` でナビの active 判定）・**`components/ContactForm.tsx`**（フォーム状態と Turnstile 操作）の3つだけ。
- カード全体をリンクにする場合は、ページを Server のまま保つため `GlassCard` に `href` を渡す（内部で `useRouter().push`）。カード内に `<a>`（`LinkRow` 等）が入るため `<a>` ネストは不可、という制約からこの設計になっている。
- `GlassCard` の `span` は占有カラム数、`start` は開始カラム（`grid-column` をインライン style で組み立てるため、`col-start-*` クラスでは上書きできない）。`hoverEffects={false}` で枠線の indigo 化・右上の「+」・カーソル追従グローを止める（`/contact` のフォームカードのように遷移しないカードで使う）。

### ディレクトリ

- `app/` — App Router。`layout.tsx` に共通レイアウト（ナビ・アンビエントグロー・最大幅コンテナ）。ルートは `/`, `/works`, `/works/brew`, `/skills`, `/about`, `/contact`。加えて `app/api/contact/route.ts`（POST 専用の Route Handler。`runtime = "nodejs"`）。
- `commons/` — **ドメイン非依存の DS プリミティブ**（13種）。どのページ・どのコンポーネントからでも使え、**`commons/` から `components/` を import してはいけない**（依存の向きは `app/` → `components/` → `commons/` の一方向）。プロトタイプの `_ds_bundle.js` 由来（Button / CardLabel / EyebrowLabel / GlassCard / LinkRow / StatBlock / Tag）と、ページ間の同型マークアップを集約したレイアウト系（CardGrid / LabeledField / MonoHeading / HoverCue / BackLink）、テキストの共通入口 `Text`。`HoverCue` はカード内の導線テキストで、`GlassCard` の `group` に乗って親カードのホバー時のみフェードインする（ホバー非対応環境では常時表示）。`BackLink` はページ左上の戻りリンクで、`/works`・`/skills`・`/about`・`/contact` は Home へ、`/works/brew` は `/works` へ戻る。
  **`commons/Text.tsx` の `Text` がサイト内テキストの唯一の入口**で、`variant`（サイズ・行間・ウェイト・font-family の組み合わせ）と `tone`（`strong` / `default` / `muted` / `accent` / `danger` の文字色）を選ぶ。`as` で要素を差し替えられ（既定 `p`。`h2` / `span` / `ul` / `figcaption` / `Link` など）、残余 props は要素へ透過する。クラス文字列が必要な箇所（`SiteNav` のリンク列など）向けに `textStyles` / `toneStyles` も export している。**新しいテキストを足すときは、まず既存の variant で足りるか確認する**。足りなければ `textStyles` に1段追加し、ページ側に arbitrary value を書かない。
- `components/` — **このサイト固有のコンポーネント**（6種）。特定のデータ・特定のページに結びつくため再利用しない。`SiteNav`（ナビのリンク定義を内包）/ `PageHeading`（hero / list / detail の3サイズはこのサイトのページ構成そのもの）/ `ContactForm` + `FormField`（`/contact` 専用）/ `SkillBar`（**Home 専用**。バー表示で `percent` 必須）/ `SkillName`（**`/skills` 専用**。バーを出さず mono / indigo の名前だけ）。`FormField` はラベル + 必須（indigo）／任意（slate）の注記 + 入力コントロール + 検証エラー（`tone="danger"`）の行で、`input` / `textarea` に当てる共通クラスを `formControlClass`、エラー要素の id を組み立てる `errorId` として export する。
- `lib/cn.ts` — `clsx` + `tailwind-merge` の `cn()`。Tailwind の衝突を後勝ちで解決するため、`Text` の `className` から variant / tone のクラスを安全に上書きできる。`@theme` のカスタム字間（`tracking-heading` / `tracking-label`）は `extendTailwindMerge` で classGroup に登録済み。
- `lib/cases.ts` — 実績データ。featured の `brewCase`（3ページから参照する単一ソース）・匿名化ケーススタディの `cases`・`otherWorks`。Works ページはここを map して描画。
- `lib/contactSchema.ts` — お問い合わせフォームの検証ルール（Zod）。`contactSchema` を `ContactForm` が、Honeypot と Turnstile トークンを足した `contactPayloadSchema` を Route Handler が使う（**検証ルールの単一ソース**）。
- `lib/about.ts` — About ページのテキストデータ（挨拶文・強み4項目・人となり／好きなもの・これからやってみたいこと・年表形式の来歴）。
- `lib/skills.ts` — スキルデータ（Development / Design / Tools）。Home のスキルカードと `/skills` ページの単一ソース。各グループは `sections`（職能ベースの分類。`heading` 省略で見出し無しの単一セクション＝Design / Tools）と `layout`（`/skills` でのカード幅 `span` とセクションの列数 `columns`）を持つ。Development は span 6 / 2列（左＝フロントエンド、右＝バックエンド + AI活用。どちらの列に置くかは各 section の `column`）、Design と Tools は span 3 / 1列で横並びになる。`note` は Home のカード用で、`/skills` では `skillsNote`（あれば）を優先して表示する（Development と Tools の守備範囲を書き分けるため）。`description` は `/skills` でのみ表示する。`percent` は **optional** で、**Home に載せるかどうかの分岐を兼ねる**（値はバーの長さ）。Home は `sections` を flatMap して `percent` を持つ項目だけを残した派生配列 `homeSkillGroups` を使う（**並べ替えはしない**＝データの順序がそのままバーの順序）。`homeName` を持つ項目は Home でだけその名前で表示する（React が `homeName: "React / Next.js"` を持ち、Next.js 側は `percent` を持たないことで Home の1本のバーにまとまる。PHP も同様に `percent` 無しで Home からは外している）。`/skills` は `percent` の有無にかかわらず**全項目をバー無し**（`SkillName`）で表示する。

### お問い合わせフォーム（/contact）

`/contact` ページ自体は SSG。送信だけが `POST /api/contact`（Route Handler）で処理される。
`components/ContactForm.tsx` が入力（氏名 / 会社名（任意） / メール / 本文）を JSON で POST し、
Route Handler が **Honeypot → Turnstile 検証 → Resend でメール送信** の順に処理する。

クライアント側の検証は **React Hook Form + Zod**（`zodResolver`）で、スキーマは `lib/contactSchema.ts`。
検証は送信ボタン押下時（RHF 既定の `mode: "onSubmit"`）に走り、エラーは各項目の直下に `text-red-500` で出る。
一度エラーが出た項目は以降の入力で再検証される（`reValidateMode: "onChange"`）。
`<form>` には **`noValidate` が必須**（付けないとブラウザ標準の検証 UI が先に出て Zod のメッセージまで到達しない）。
`required` / `type="email"` 属性は支援技術向けに残してある。Honeypot と Turnstile のトークンは
RHF の管理外で、従来どおり `useState` で保持して送信時に足す。

必要な環境変数は `.env.example` を `.env.local` にコピーして設定する（`.env` 系は git 管理外）。

| 変数 | 用途 |
| --- | --- |
| `RESEND_API_KEY` | Resend の API キー |
| `CONTACT_TO_EMAIL` | 送信先（自分の受信アドレス） |
| `CONTACT_FROM_EMAIL` | 送信元。ドメイン未検証のため `onboarding@resend.dev` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile のサイトキー（クライアント側） |
| `TURNSTILE_SECRET_KEY` | Turnstile のシークレット（サーバー側） |

- 環境変数が未設定でも **モジュールトップで throw しない**（`next build` を壊さないため）。ハンドラ内で検出して 500 を返す。
  サイトキー未設定時は、フォームが Turnstile ウィジェットの代わりに未設定の注記を表示する。
- ローカル確認には Turnstile の公式テストキー（`1x0000...`）を使う。常に検証が成功する。
- **独自ドメインは取得しない方針**のため、送信元は Resend の共有ドメイン `onboarding@resend.dev` のまま。
  この状態では Resend の sandbox 制限により、**宛先は Resend アカウントの登録メールアドレスにしか送れない**。
  `CONTACT_TO_EMAIL` に別のアドレスを入れると Resend が 403 を返し、`[contact] resend error:` がログに出て
  500 になる。別アドレスで受け取るには独自ドメインの取得と Resend でのドメイン検証（MX / SPF / DKIM）が必要。
- Turnstile のホスト名は **FQDN のみ・ワイルドカード不可**で、登録したホスト名の配下のサブドメインだけが
  自動許可される。Vercel のプレビューデプロイは `<project>-<hash>-<team>.vercel.app` という**兄弟サブドメイン**に
  なるため、本番ホスト名を登録してもプレビューでは Turnstile が通らない。
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` は**ビルド時にバンドルへ埋め込まれる**。実行時にだけ渡す構成では空文字になり、ウィジェットが出ず送信が必ず 400 になるため、`next build` を実行する環境にも設定すること。
- **ボット対策は Honeypot + Turnstile の2段**。`ContactForm` の `#contact-website` は
  人間には見えない Honeypot 欄で、`display:none` を検出するボットを避けるため画面外に置いている
  （`aria-hidden` + `tabIndex={-1}`）。**この欄は削除も改名もしないこと**。
  Honeypot に該当した送信は、検知を悟らせないため `200 { ok: true }` を返してメール送信のみスキップする。
- 「送信までの経過時間が短すぎたら弾く」判定は**入れない**（一度実装して削除した）。経過時間はクライアントが
  自由に値を作れるためフォームを介さない POST には無力な一方、オートフィル + 貼り付けで素早く送信した
  実在の訪問者のメールを、成功表示のまま黙って捨ててしまう副作用があるため。

## コンテンツ方針（デザインシステム由来）

- バイリンガル・日本語主体。UI ラベル・固有名詞・モノスペース注釈のみ英語。
- 絵文字は使わない。トーンはプロフェッショナル／技術寄り。
- 受託案件は契約上キャプチャ不可のため、匿名化テキストのケーススタディとして掲載する（既存の書き方を踏襲）。
- 日本語見出しは LINE Seed JP（再配布不可）の代替として IBM Plex Sans JP を使用。

## 未設定・注意点

- サイト内のリンクはすべて設定済み（Home の「連絡する」ボタン・Contact Form・ヘッダーの contact はいずれも `/contact` へ、GitHub / X と BREW のデモ / リポジトリは実 URL）。
- Resend / Turnstile とも実キーを取得済みで、ローカルからの送信・受信を確認済み。未着手なのはデプロイ先（Vercel）の環境変数設定で、`NEXT_PUBLIC_TURNSTILE_SITE_KEY` はビルド時に埋め込まれるため設定後に再デプロイが要る。
- `/api/contact` にレート制限は入れていない（永続ストアが必要なため）。Honeypot + Turnstile の2段で防いでいる。
- コミット author はこのリポジトリのローカル設定で `user.email = meayubgm@gmail.com`（`user.name` はグローバルの `ayuha` を継承）。リモートは `git@github.com:meayubgm/portfolio-site.git`。
