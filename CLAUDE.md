# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

全体像・セットアップ手順・各種一覧表は `README.md` にある。このファイルは**コードを書くときに守る規約と、壊しやすい箇所**に絞る。

## 概要

フロントエンドエンジニア「Megumi Ayuha」の個人ポートフォリオサイト。デザインシステムは **Frost & Blueprint**（フロスト＝磨りガラス面＋ブループリント＝設計図の格子）。Next.js 16 (App Router) + Tailwind CSS v4 で実装し、**全ページ静的生成（SSG）**。唯一の動的ルートがお問い合わせの送信先 `app/api/contact/route.ts`（Route Handler）。

## 開発コマンド

主要な開発フローは Docker + Make（ホットリロード付き）。`make help` で全ターゲット。

```bash
make up       # docker compose up -d でコンテナ起動 → http://localhost:3000
make down     # 停止・削除
make logs     # ログ追跡
make sh       # app コンテナのシェルに入る
make rebuild  # キャッシュ無しで再ビルドして起動
make lint     # コンテナ内で npm run lint（Biome + ESLint）。make lint-fix で自動修正
make test-e2e # ホストで npx playwright test（事前に make up）
```

Docker を使わない場合は `npm run dev` / `npm run build` / `npm run start`。**型チェックは `npm run build`（`next build`）に含まれる**（型エラーはここで出る）。

- Docker Compose v1 環境では `make up COMPOSE=docker-compose` のように上書きする。
- ソースはコンテナへバインドマウントし、`node_modules` と `.next` は匿名ボリュームでコンテナ内のものを使う。ホスト（macOS）は musl 非対応なので**依存はコンテナ内でのみ解決する**。Node 要件は 20.9+（Next.js 16）で、イメージは `node:24-alpine`、`@types/node` もランタイムに合わせて 24 系。
- Next.js 16 は `next dev` / `next build` とも **Turbopack がデフォルト**。macOS の Docker Desktop（VirtioFS）はファイルイベントが透過するため、バインドマウント経由でも監視が効く。`compose.yaml` の `WATCHPACK_POLLING=true` は `next dev --webpack` に切り替えたとき用のフォールバック。
- **`globals.css` の `@theme` / `@utility` / `@custom-variant` を編集したときは、dev サーバーが古い CSS を配り続けることがある**（tsx の変更は反映されるのに新しいユーティリティだけ効かない、という出方をする）。コンテナ内の `.next` を消してから再起動すると直る: `docker compose exec app sh -c 'rm -rf .next/*'` → `docker compose restart app`。

## lint / format

**Biome 2**（`biome.json`）と **ESLint**（`eslint.config.mjs`）の併用で、役割は分けてある。**Biome = 汎用 lint + format**、**ESLint = `@next/eslint-plugin-next` の Core Web Vitals ルール（`no-img-element` 等の Next 固有チェック）+ プロジェクト独自ルール**。react / a11y は Biome に一任して重複させない。整形は Biome 一択で Prettier は使わない。`app/globals.css`（Tailwind v4 の `@theme` 記法）と `tsconfig.json`（`next build` が自動整形）は `biome.json` の `files.includes` で対象外。ESLint は TSX パース用に `@typescript-eslint/parser` を設定（型情報なしの軽量構成）。チェックは `npm run lint`（= `biome check && eslint . --max-warnings 0`）、自動修正は `npm run lint:fix`。

守る規約は2つ:

- **波括弧を省略しない**（Biome の `style/useBlockStatements`。`recommended` に足してある）。`if` / `for` / `while` などの本体は必ず `{}` で囲む（ブレース位置の K&R は Biome formatter が常に強制する）。このルールの自動修正は **unsafe fix** に分類されているため `npm run lint:fix` では直らない。手で足すか `npx biome check --write --unsafe` を個別に実行する。
- **三項演算子で JSX を出し分けない**（`eslint-rules/` の `local/no-conditional-jsx`。`**/*.{jsx,tsx}` に適用）。consequent / alternate のどちらかが JSX 要素・フラグメントなら違反（`cond ? <A/> : <B/>` も `cond ? <A/> : null` も、属性値の中の JSX も対象）。要素の出しわけは**早期 return・変数への切り出し・論理積 `&&`** で書く。文字列やクラス名・関数など**短い値の三項は対象外**（`sending ? "送信中..." : "送信する"`、`tone={optional ? "muted" : "accent"}` は使ってよい）。自動修正は付けていない。

## E2E テスト

**Playwright**（`@playwright/test`）。開発コンテナ（`node:24-alpine`）は Playwright のブラウザ非対応のため、**テストはホスト（macOS）で実行**し、`compose.yaml` が公開する `http://localhost:3000` を叩く（`make up` → `make test-e2e`）。spec は `e2e/`（Chromium / WebKit の2プロジェクト）で、`e2e` と `playwright.config.ts` は `tsconfig.json` の `exclude` に入れて `next build` の型チェックから外している。`.mcp.json` の Playwright MCP は探索的なブラウザ確認の補助で、リグレッション検知は `@playwright/test` に一任する。セットアップ手順は `README.md`。

## アーキテクチャ

### ディレクトリと依存の向き

依存は **`app/` → `components/` → `commons/` の一方向**。**`commons/` から `components/` を import しない**。import には `@/` エイリアスを使う（`tsconfig.json` の `paths` でリポジトリルートに解決）。

- `app/` — App Router。直下には `layout.tsx`（共通レイアウト＝ナビ・アンビエントグロー・最大幅コンテナ・フッター）・`globals.css`・`api/`・metadata ファイル（`icon.svg` / `icon.png` / `apple-icon.png`）だけを置く。**ページはすべて Route Group `app/(pages)/` 配下にまとめる**。括弧付きのディレクトリ名は URL セグメントにならないため `app/(pages)/about/page.tsx` が `/about` になる。**素の `app/pages/` にすると `/pages/about` になってしまうので括弧は外さないこと**。ルートは `/`, `/works`, `/works/brew`, `/skills`, `/about`, `/contact`。`app/api/contact/route.ts`（POST 専用・`runtime = "nodejs"`）はページではないので `(pages)` の外に置く。`(pages)` 専用の `layout.tsx` は持たない（レイアウトは API 以外の全ページで共通）。
- `commons/` — **ドメイン非依存の DS プリミティブ**（18種）。どのページ・どのコンポーネントからでも使う。
- `components/` — **このサイト固有のコンポーネント**（7種）。特定のデータ・特定のページに結びつくため再利用しない。
- `lib/` — データとユーティリティ（後述）。

各コンポーネントの役割一覧は `README.md` のディレクトリ構成を参照。

### デザイントークンは Tailwind テーマに統合されている

`app/globals.css` の `@theme` ブロックに DS 固有トークン（フォント・角丸・影・余白・字間・h1 のサイズ段・コンテナ幅）を CSS 変数として定義し、Tailwind v4 が自動でユーティリティを生成する。**新しいフォント・角丸・影・余白・字間はここに追加する**（変数名とユーティリティ名の対応表は `README.md`）。`@theme` に収まらない面・variant は `@utility` / `@custom-variant` で定義する（`bg-featured` / `bg-ambient-glow` / `hover-none:`）。`tailwind.config.js` は無い（v4 の CSS ファースト設定）。

- **色は Tailwind の組み込みパレット（slate / sky / indigo）から選ぶ**。custom な `--color-*` トークンは持たず、マークアップは組み込みユーティリティを直接書く（`text-slate-900` / `text-slate-600` / `text-slate-500` / `text-sky-700` / `text-indigo-600` / `border-indigo-600/15` / `bg-slate-200`）。ピクセル単位の一致より **Tailwind パレット準拠を優先する**。
- **文字サイズ・行間は Tailwind 標準スケールのみ**（`xs` / `sm` / `base` / `lg` / `xl` / `2xl` と `leading-5` 〜 `leading-8`。`text-sm/6` 記法）。**カスタムのサイズ段は持たない**（`xs` = 12px が最小）。h1 だけ `clamp()` によるレスポンシブ指定が要るが、これも `@theme` の `--text-hero` / `--text-page` / `--text-detail` にトークン化してあり、`PageHeading` はユーティリティを当てるだけ。
- **本文・見出し・ラベルは直接クラスを書かず `commons/Text.tsx` の `Text` を使う**。`variant`（サイズ・行間・ウェイト・font-family の組み合わせ）と `tone`（`strong` / `default` / `muted` / `accent` / `danger`）を選び、`as` で要素を差し替える（既定 `p`）。残余 props は要素へ透過する。クラス文字列が要る箇所（`SiteNav` のリンク列など）向けに `textStyles` / `toneStyles` も export している。**新しいテキストはまず既存の variant で足りるか確認する**。足りなければ `textStyles` に1段追加し、ページ側に arbitrary value を書かない。段落用の `lead` / `body` には `text-justify` を含めてある（日本語の折り返しで右端がガタつくのを防ぐため）。
- Tailwind の preflight が `*` に `margin: 0; padding: 0` を当てるため、**`p` / `h1`-`h6` / `ul` に `m-0` は書かない**。リスト記号とインデントも preflight で消えるので、箇条書きは `commons/BulletList.tsx` を使う。
- 背景のブループリント格子（`--grid-cell` + `body` 直接適用）と、格子・面の淡い indigo は `color-mix(in srgb, var(--color-indigo-600) 6%, transparent)` のように Tailwind パレット変数から生成する。
- `lib/cn.ts` の `cn()`（clsx + tailwind-merge）で Tailwind の衝突を後勝ちで解決する。`@theme` のカスタム字間（`tracking-heading` / `tracking-label`）は `extendTailwindMerge` で classGroup に登録済み。

### Client / Server の切り分け

- ページ本体（`app/(pages)/**/page.tsx`）とほとんどのコンポーネントは Server Component。
- `"use client"` は **`commons/GlassCard.tsx`**（マウス追従グロー＋クリック遷移＋scroll reveal）・**`commons/Typewriter.tsx`**（タイピング演出）・**`commons/RiseIn.tsx`**（時間指定の浮き上がり）・**`components/SiteNav.tsx`**（`usePathname` での active 判定＋スクロール連動の出し入れ）・**`components/ContactForm.tsx`**（フォーム状態と Turnstile 操作）の5つだけ。
- カード全体をリンクにするときは、ページを Server のまま保つため `GlassCard` に `href` を渡す（内部で `useRouter().push`）。カード内に `<a>`（`LinkRow` 等）が入るため `<a>` のネストは不可。
- `GlassCard` の `span` は占有カラム数、`start` は開始カラム（`grid-column` をインライン style で組み立てるため `col-start-*` クラスでは上書きできない）。`hoverEffects={false}` で枠線の indigo 化・右上の「+」・カーソル追従グローを止める（`/contact` のフォームカードのように遷移しないカードで使う）。

### データは lib/ に集約する

- `lib/cases.ts` — 実績データ。featured の `brewCase`（3ページから参照する単一ソース）・匿名化ケーススタディの `cases`・`otherWorks`。`/works` はここを map して描画する。
- `lib/skills.ts` — スキルデータ（Development / Design / Tools）。Home のスキルカードと `/skills` の単一ソース。**`percent` は optional で、Home に載せるかどうかの分岐を兼ねる**（値はバーの長さ）。Home は `percent` を持つ項目だけを残した派生配列 `homeSkillGroups` を使い、**並べ替えはしない**（データの順序がバーの順序）。`homeName` を持つ項目は Home でだけその名前で表示する。`/skills` は `percent` の有無にかかわらず**全項目をバー無し**（`SkillName`）で表示する。構造の詳細は `README.md`。
- `lib/about.ts` — About のテキストデータ（挨拶文・強み・人となり／好きなもの・やってみたいこと・来歴）。
- `lib/home.ts` — Home ヒーローの文言（`heroCopy`）とタイピングの遅延・速度（`heroTyping`）。**遅延は文字数から静的に算出する**（実行時のコールバック連鎖を持たない）ので、文言を書き換えればスケジュールも自動で追従する。
- `lib/contactSchema.ts` — お問い合わせフォームの**検証ルールの単一ソース**（Zod）。
- `lib/useRiseIn.ts` — 浮き上がり表示を要素に当てるフック（`RiseIn` と `GlassCard` が共用）。
- `public/works/brew/` — BREW ケーススタディの画像。**元 PNG は表示幅に合わせて縮小済み**（hero 3枚は 1200x2037）。`next/image` には**必ず `sizes` を指定する**（未指定だと Next が `100vw` 扱いで `w=3840` の最適化を要求し、dev サーバーの image optimizer が詰まって画像が表示されなくなることがある）。

## お問い合わせフォーム（/contact）

ページ自体は SSG で、送信だけが `POST /api/contact`（Route Handler）。`components/ContactForm.tsx` が入力（氏名 / 会社名（任意） / メール / 本文）を JSON で POST し、Route Handler が **Honeypot → Turnstile 検証 → Resend でメール送信**の順に処理する。環境変数の一覧と Resend / Turnstile 側の制約は `README.md` を参照。

- クライアント側の検証は **React Hook Form + Zod**（`zodResolver`）。スキーマは `lib/contactSchema.ts` で、Route Handler は Honeypot と Turnstile トークンを足した `contactPayloadSchema` を使う。検証は送信ボタン押下時（`mode: "onSubmit"`）に走り、一度エラーが出た項目は以降の入力で再検証される（`reValidateMode: "onChange"`）。
- **`<form>` には `noValidate` が必須**（付けないとブラウザ標準の検証 UI が先に出て Zod のメッセージまで到達しない）。`required` / `type="email"` 属性は支援技術向けに残す。Honeypot と Turnstile のトークンは RHF の管理外なので `useState` で保持して送信時に足す。
- 環境変数が未設定でも**モジュールトップで throw しない**（`next build` を壊さないため）。ハンドラ内で検出して 500 を返す。サイトキー未設定時は、フォームが Turnstile ウィジェットの代わりに注記を表示する。
- **ボット対策は Honeypot + Turnstile の2段**。`ContactForm` の `#contact-website` は人間には見えない Honeypot 欄で、`display:none` を検出するボットを避けるため画面外に置いている（`aria-hidden` + `tabIndex={-1}`）。**この欄は削除も改名もしないこと**。Honeypot に該当した送信は、検知を悟らせないため `200 { ok: true }` を返してメール送信のみスキップする。
- **「送信までの経過時間が短すぎたら弾く」判定は入れない**。経過時間はクライアントが自由に値を作れるためフォームを介さない POST には無力な一方、オートフィル + 貼り付けで素早く送信した実在の訪問者のメールを、成功表示のまま黙って捨ててしまうため。

## モーション

アニメーションライブラリは入れない。**CSS transition + IntersectionObserver + 小さな client コンポーネント**で実装する。いずれも `prefers-reduced-motion: reduce` で即時表示に切り替わる（`window.matchMedia` での分岐、および `motion-reduce:transition-none`）。`useRiseIn` の `prefers-reduced-motion` 判定は hydration 不一致を避けるため `useEffect` 内で行う。

- **SiteNav の出し入れ** — `scroll` を購読し、下スクロールで `-translate-y-full`、上スクロールで復帰。8px 未満の差分は無視（トラックパッドの微振動対策）、`scrollY` が 80px 以内なら隠さない。隠れている状態でナビのリンクにフォーカスが入ったら `onFocus` で出し直す。
- **Home ヒーローのタイピング** — `commons/Typewriter.tsx`。**完成テキストを `opacity-0` で敷き、打ち込み中のテキストを `aria-hidden` でグリッド重ねする**。これにより (1) 行数が増えても高さが動かない (2) SSG の HTML とアクセシビリティツリーには最初から完成テキストが載る（SEO と e2e の `toContainText` が壊れない）。打ち終わったら重ねを解いて素の1枚テキストに戻す。
- **浮き上がり** — `lib/useRiseIn.ts` に集約。`opacity-0 translate-y-4` → `opacity-100 translate-y-0` を `transition-[translate,opacity] duration-500` で動かす（**フェードと移動は同時**。16px / 0.5秒）。終わったら **`transitionend`（`propertyName === "translate"`）でクラスを外す**（付けっぱなしだと `duration-500` がホバーの浮き上がりにも効き続けるため）。ただし**開始前のホバー**でも `hover:-translate-y-0.5` が同じイベントを飛ばすので `started` で弾いている（弾かないと、表示前のカードをホバーしただけで reveal が打ち切られて一瞬で出てしまう）。なお `GlassCard` の transition 対象は `transform` ではなく **`translate`**（Tailwind v4 の `translate-y-*` は `transform` ではなく `translate` プロパティを使うため）。
- **カードの scroll reveal** — `GlassCard` の `reveal`（既定 OFF）。`/`・`/works`・`/skills`・`/about` の一覧系カードが渡し、ケーススタディ `/works/brew` と `/contact` のフォームカードは即表示のまま。`IntersectionObserver` で初回の交差を拾ったら `disconnect()` するので、**一度出たら上に戻しても消えない**。**カードごとの時間差は付けない**（隣り合うカードは同時に出る）。**`GlassCard` にラッパー div を被せてはいけない**（`e2e/navigation.spec.ts` が `page.locator("div.group")` で GlassCard のルートを直接掴んでいる）。
- **ヒーローのボタン列** — `commons/RiseIn.tsx`。スクロールではなく時間で始める版で、`lib/home.ts` の `heroActionsDelay`（打ち終わり + 150ms）を渡す。
- **JS 無効時の保険** — 表示待ちの要素は `opacity-0` で伏せているため、`app/globals.css` の `@media (scripting: none)` が `[data-typewriter-target]` / `[data-rise-in]` を元に戻す。reveal するカードは `GlassCard` が root に `data-rise-in` を出すので、この保険が効く。

## コンテンツ方針（デザインシステム由来）

- バイリンガル・日本語主体。UI ラベル・固有名詞・モノスペース注釈のみ英語。
- 絵文字は使わない。トーンはプロフェッショナル／技術寄り。
- 受託案件は契約上キャプチャ不可のため、匿名化テキストのケーススタディとして掲載する。
- 日本語見出しは LINE Seed JP（再配布不可）の代替として IBM Plex Sans JP を使用。

## 現状

- サイト内のリンクはすべて設定済み（Home の「連絡する」ボタン・Contact Form・ヘッダーの contact はいずれも `/contact` へ、GitHub / X と BREW のデモ / リポジトリは実 URL）。
- Resend / Turnstile とも実キーを取得済みで、ローカルからの送信・受信を確認済み。デプロイ先（Vercel）の環境変数は未設定。`NEXT_PUBLIC_TURNSTILE_SITE_KEY` はビルド時に埋め込まれるため、設定後に再デプロイが要る。
- `/api/contact` にレート制限は入れていない（永続ストアが必要なため）。Honeypot + Turnstile の2段で防ぐ。
- コミット author はこのリポジトリのローカル設定で `user.email = meayubgm@gmail.com`（`user.name` はグローバルの `ayuha` を継承）。リモートは `git@github.com:meayubgm/portfolio-site.git`。
