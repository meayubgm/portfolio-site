# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

全体像・セットアップ・各種一覧表は `README.md` にある。このファイルは**コードを書くときに守る規約と、
壊しやすい箇所**に絞る。

## コマンド

```bash
make up       # コンテナ起動 → http://localhost:3000（make down / logs / sh / rebuild）
make lint     # コンテナ内で npm run lint（Biome + ESLint）。make lint-fix で自動修正
make test-e2e # ホストで npx playwright test（事前に make up）
docker compose exec app npm run build   # 本番ビルド。**型チェックはここに含まれる**
```

- 依存はコンテナ内で入れる（`docker compose exec app npm install <pkg>`）。**ホストにも別の
  `node_modules` があり IDE の TypeScript サーバーはそちらを見る**ので、`npm install <pkg>
  --ignore-scripts` でホストにも入れる。
- **`globals.css` の `@theme` / `@utility` / `@custom-variant` を編集したとき**（tsx は反映されるのに
  新しいユーティリティだけ効かない出方をする）と、**dev サーバーの稼働中に `npm run build` を
  走らせたとき**は `.next` が古い／壊れた状態になる。
  `docker compose exec app sh -c 'rm -rf .next/*'` → `docker compose restart app` で直る。
- 本番は Vercel（`main` への push で自動デプロイ）。環境変数・Firewall のルールは `README.md` の
  「デプロイ」にある。

## コーディング規約

機械的に強制しているのは2つ。どちらも `npm run lint` で落ちる。

- **波括弧を省略しない**（Biome の `style/useBlockStatements`）。`if` / `for` / `while` の本体は必ず `{}`。
  このルールの自動修正は unsafe fix なので `npm run lint:fix` では直らない。手で足すか
  `npx biome check --write --unsafe` を個別に実行する。
- **三項演算子で JSX を出し分けない**（`eslint-rules/no-conditional-jsx.mjs`）。consequent / alternate の
  どちらかが JSX 要素・フラグメントなら違反（`cond ? <A/> : null` も属性値の中の JSX も対象）。出しわけは
  **早期 return・変数への切り出し・`&&`**。文字列など**短い値の三項は対象外**。

そのほか、レビューで見るもの:

- **テキストは `commons/Text.tsx` の `Text` 経由で描く**（`variant` + `tone`、`as` で要素を差し替え。
  クラス文字列が要る箇所向けに `textStyles` / `toneStyles` も export）。足りなければ `textStyles` に
  1段追加し、**ページ側に arbitrary value を書かない**。
- **色は Tailwind 組み込みパレット（slate / sky / indigo）、文字サイズ・行間は標準スケールのみ**。
  ピクセル単位の一致より**パレット準拠を優先**する。
- **Tailwind のクラス名をテンプレートリテラルで組み立てない**（ソースを文字列として走査するため
  生成されない）。`GlassCard` の `spanClasses` / `startClasses` のように表へ書き下す。
- preflight が `*` に `margin: 0; padding: 0` を当てるので **`p` / `h1`-`h6` / `ul` に `m-0` は書かない**。
  箇条書きは `commons/BulletList.tsx`。クラス結合は `lib/cn.ts` の `cn()`（clsx + tailwind-merge、
  衝突は後勝ち。カスタム字間は `extendTailwindMerge` に登録済み）。

## アーキテクチャの要点

### ディレクトリと依存の向き

依存は **`app/` → `components/` → `commons/` の一方向**。**`commons/` から `components/` を import しない**。
import は `@/` エイリアス。

- `app/` 直下には `layout.tsx` / `globals.css` / `api/` / metadata ファイルだけを置き、**ページはすべて
  Route Group `app/(pages)/` 配下**にまとめる（**括弧を外すと `/pages/about` になる**）。
  `app/api/contact/route.ts`（POST 専用・`runtime = "nodejs"`）は `(pages)` の外。
- `commons/` はドメイン非依存の DS プリミティブ（21種）、`components/` はサイト固有（8種）。
- ページに出すデータは `lib/` に集約し、ページは map して描画する。`skills.ts` の **`percent` は
  optional で、Home に載せるかどうかの分岐を兼ねる**（Home は `percent` を持つ項目だけの派生配列
  `homeSkillGroups` を使い、**並べ替えはしない**）。`home.ts` のタイピングの**遅延は文字数から静的に
  算出する**ので文言を書き換えれば追従する。`phrase.ts` は**サーバー専用**。
- `public/works/brew/` の PNG は表示幅に合わせて縮小済み。`next/image` には**必ず `sizes` を指定する**
  （未指定だと `100vw` 扱いで `w=3840` の最適化を要求し、dev の image optimizer が詰まる）。

### Client / Server

- ページ本体とほとんどのコンポーネントは Server Component。`"use client"` は7つだけ
  （`GlassCard` / `Typewriter` / `RiseIn` / `Wireframe` / `ScrollToTarget` / `SiteNav` / `ContactForm`）。
- カード全体をリンクにするときはページを Server に保つため `GlassCard` に `href` を渡す
  （内部で `useRouter().push`。カード内に `<a>` が入るので `<a>` のネストは不可）。
- `GlassCard` の `span` / `start` は `lg:col-span-*` / `lg:col-start-*` なので **lg 以上でだけ効く**。
  `hoverEffects={false}` でホバー演出を止める（遷移しないカード向け）。

### 日本語の文節改行（BudouX）

BudouX でビルド時に文節境界を求め、`<wbr>` として HTML に埋め込む。面は `commons/Text.tsx` の
**`phraseWrap`（`break-keep wrap-break-word`）**で、`keep-all` が日本語の任意改行を止め `<wbr>` の位置
だけ改行を許す。`wrap-break-word` は1文節が行幅を超えたときの保険。**`wrap-anywhere` は使わない**
（min-content 幅にも効いて列幅を変える）。

- **overflow-wrap 側に旧名の `break-words` を書かない**。tailwind-merge は `break-normal` /
  `break-words` / `break-all` / `break-keep` を**1つの衝突グループ**として扱うため、`cn()` を通すと
  `break-keep` が落ちて `word-break: normal`（＝任意位置で折り返す）になる。`wrap-break-word` は別グループ。
- 入口は **`commons/Phrase.tsx`（サーバー専用）**。**クライアントコンポーネントから `Phrase` /
  `lib/phrase.ts` を import しない**（BudouX のモデルがクライアントバンドルに載る。`ContactForm` の
  見出しを対象外にしているのはこのため）。`Typewriter` はパース済みの「行 × 文節」を props で受け取る。
- **完成テキストの層と打ち込み中の層は両方とも文節改行にし、打ち込み中の層は未入力ぶんの場所も
  `visibility:hidden` で確保する**（`withPhraseBreaks(lines, typedCount)`）。素直に切り出すと行末の
  文節が跳ねる。**ただし1文字も打つ前（＝SSG が出す HTML）は空にする** — 静的 HTML にテキストが
  2回入り `h1` の `textContent` が二重になる（`e2e/motion.spec.ts` が見張っている）。
- **切り間違える語は `lib/phrase.ts` の `NO_BREAK_WORDS` に登録する**（語の内部の区切りを消し、語の
  前後に区切りを作る）。登録するのは**「切ってよい単位」の語**（長すぎる語を1文節にすると
  `wrap-break-word` の任意位置改行に落ちる）。**語同士が重なるものは登録しない**（後から処理した語が
  境界を足し直し、先の語の内部に改行位置が戻る）。
- `<Phrase>` をまたぐと文節境界が失われる（`</b>` の直後など）。必要なら手で `<wbr />` を置く。
  適用範囲は **h1・Home ヒーローの本文・各ページの lead 文・カード内の見出し**で、英字だけのテキスト
  （`eyebrow` / `mono` / `CardLabel` / `MonoHeading` / `Tag`）には当てない。
- **`budoux` は 0.7 系を使う。0.8 以降へ上げない**（`google-artifactregistry-auth` を `dependencies` に
  持ち、本番依存が約40パッケージ増える。パーサとモデルは同じ）。

## 変更時に壊しやすい箇所

### レイアウト

- **左右余白 22px は3箇所が連動**する。中央コンテナの `px-5.5 sm:px-8`、`SiteNav` の `max-sm:px-5.5`、
  メニューパネルのオフセット（`inset-x-2.75` + 枠線 1px + `p-2.5` = 22px）。狭い画面でロゴ・
  ハンバーガー・カード左端が一直線に並ぶので**どれか1つだけを動かさない**。
- **`GlassCard` の既定 padding（`p-4 sm:p-7` / `padding="lg"` は `p-5 sm:p-9`）はメニューパネルに
  波及しない**（`SiteNav` が `p-2.5 sm:p-7` に上書き）。パネル側を変えると上のオフセット計算をやり直す。
- **Home ヒーローの高さは `h-svh`**。`100vh` は URL バーが隠れたときの高さなので、`h-screen` /
  `h-dvh` にすると実機の初期表示で CTA 列がバーの下に潜る。**Playwright では `innerHeight` が `100vh` と
  一致するため e2e で検知できない。**
- **`/works/brew` の padding を変えたら `next/image` の `sizes` も直す**（hero モック
  `calc(100vw - 94px)` / ワイド画像 `calc(100vw - 46px)`）。

### メニューパネル（sm 未満）

- **閉じる契機は `pathname` の effect とパネル内リンクの `onClick` の2つ**（effect だけだと現在地の
  リンクで閉じず、`onClick` だけだとブラウザバックで閉じない）。
- **パネルの z（`z-40`）は nav（`z-50`）より下**（nav が stacking context を作るので、閉じるボタンに z を
  積んでも外側のパネルより手前には出せない）。透明な nav がパネル上端のリンクを遮らないよう
  `max-sm:pointer-events-none` を当て、ロゴとハンバーガーにだけ `pointer-events-auto` を戻す。
- 開いている間は nav 側のロゴを `max-sm:invisible` で伏せ、パネル側のロゴを同じ位置に出す。
  **グリッドの `pr-24` は消さない**（右上の × が `w-10`(40px) で、下回ると1行目のリンクと重なる）。
- 現在地の「+」は**絶対配置 + `aria-hidden`**（付けるとアクセシブルネームが「+works」になり、名前で
  引く e2e が落ちる）。SiteNav・`BackLink` のホバーの「+」も同じ。

### モーション

- `useRiseIn` は `transitionend`（`propertyName === "translate"`。transition 対象は `transform` ではなく
  **`translate`**）でクラスを外す。**開始前のホバーでも `hover:-translate-y-0.5` が同じイベントを飛ばす**
  ので `started` で弾く（弾かないと表示前のカードをホバーしただけで reveal が打ち切られる）。
- **`GlassCard` にラッパー div を被せない**（`e2e/navigation.spec.ts` が `page.locator("div.group")` で
  ルートを直接掴んでいる）。
- SiteNav の出し入れの無効化は `hidden && "sm:-translate-y-full"` のように **CSS の variant で行う**
  （JS で `matchMedia` を見て分岐すると hydration 不一致になる）。
- **遷移先スクロールの受け渡しに `window.location.hash` を使わない**（App Router はルートごとに
  ハッシュ込みの正規 URL を保持し、一度付けると以後の普通の遷移でも復活する）。`lib/scrollTarget.ts` の
  `sessionStorage` で一度きり読み捨て、**`ScrollToTarget` はルートレイアウトに1つだけ**置く。

### 背景の正多面体（`commons/Wireframe.tsx`）

- **組み上げは CSS、自転は JS**と役割を分ける（触るプロパティが重ならない）。組み上げは**マウントする
  まで `animation-play-state: paused`** にして Typewriter と起点を揃える。**尺（260ms / 420ms）は
  `globals.css` と `Wireframe.tsx` の `VERTEX_MS` / `EDGE_MS` の2箇所にある**ので、片方だけ変えると
  最後の辺が引き終わらない。
- **辺には `pathLength="1"` を置く**（自転で実長が毎フレーム変わるため、正規化しないと線引きが破綻する）。
- **`vector-effect="non-scaling-stroke"` は使わない**（dash の単位まで画面ピクセルになり `pathLength` の
  正規化が無視され、**図形が最初から出来上がって見える**）。ヘアラインは ResizeObserver で実サイズを
  測り `stroke-width` を user unit で逆算して保つ（`e2e/geometry.spec.ts` が見張っている）。
- **投影結果は小数4桁に丸める**。`Math.cos` / `Math.sin` はエンジンで最下位ビットが食い違うため、
  丸めないと SSR の属性値と WebKit の計算値が一致せず **hydration mismatch** になる。
- **伏せた姿は presentation attribute で持つ**（`stroke-dashoffset="1"` / `opacity="0"`）。`globals.css`
  が素の値へ戻す場面があるため、**インライン style にするとこの上書きが効かなくなる**。
- **`display:none` でも rAF は回り続ける**ので、実幅 0 の間は自転を止める。effect の依存に入れるのは
  **幅そのものではなく真偽値**（幅だとリサイズのたびに回転が初期角度へ戻る）。

### SEO / メタデータ

- **サイト URL・名前・ルート一覧は `lib/site.ts` が単一ソース**。`SITE_URL` →
  `VERCEL_PROJECT_PRODUCTION_URL` → localhost の順にフォールバックし、**ビルド時に評価される**。
- **ページを増やしたら `lib/site.ts` の `sitePaths` にも足す**（sitemap から漏れる）。
- ページ別の metadata は `lib/metadata.ts` の `pageMetadata()` を通す。title は**短い側だけ**渡し、
  区切りは `lib/site.ts` の `fullTitle()` が一手に持つ（`title.template` と og:title の両方がここを
  通るので `<title>` と og:title が食い違わない）。
- **ページ側の `openGraph` はルートを継承せず丸ごと置き換わる**。`pageMetadata()` が
  `type` / `locale` / `siteName` / `images` まで全部書き直しているのはこのためで、**減らすと
  該当のタグだけが5ページから静かに消える**（`e2e/smoke.spec.ts` が見張っている）。
- **OGP 画像（`app/opengraph-image.tsx`）に日本語を書かない**（`ImageResponse` は同梱の欧文フォント
  しか持たず豆腐になる）。レイアウトエンジンは Flexbox のサブセットで **Tailwind のクラスは効かない**
  ため inline style で書く（`background-size` も解釈しないので格子は div を並べている）。

### CSP（`next.config.mjs`）

- **外部の配信元を増やしたら `contentSecurityPolicy()` にも足す**。CSP は `next.config.mjs` の1箇所に
  表として書き下してある。外すと本番でだけリソースが読めなくなる（`default-src 'self'` に落ちる）。
- **dev 側の `'unsafe-eval'` と `ws:` を消さない**。`headers()` は dev サーバーにも効くので、
  消すと React Refresh と HMR が動かなくなる（`make up` の画面が更新されなくなる）。
- **`script-src` の `'unsafe-inline'` は外せない**。Next のインライン `self.__next_f.push(...)` と
  Home の JSON-LD がある。nonce にすると `middleware.ts` が要り、全ページが dynamic に落ちて
  SSG が効かなくなる。
- **`lib/contactSchema.ts` の `z.config({ jitless: true })` を消さない**。Zod は初回 parse で
  `Function("")` を試して JIT の可否を判定するため、消すと /contact で CSP 違反が1件記録される
  （Zod 自体は jitless にフォールバックするので動作は壊れない）。

### お問い合わせフォーム

- **`<form>` には `noValidate` が必須**（無いとブラウザ標準の検証 UI が先に出て Zod のメッセージまで
  到達しない）。`required` / `type="email"` は支援技術向けに残す。Honeypot と Turnstile のトークンは
  RHF の管理外なので `useState` で持って送信時に足す。
- **Turnstile ウィジェットの寿命は effect が持つ**（`renderWidget` を呼び cleanup で `removeWidget`）。
  `<Script>` の `onReady` は**初回読み込みのときしか間に合わない**ので、/contact を離れて戻ると
  effect 側が描き直す。破棄は**アンマウントと送信成功の両方**で要る（成功時は早期 return で
  cleanup が走らない）。漏らすと「Cannot find Widget ...」の警告が出る
  （`e2e/navigation.spec.ts` が見張っている）。
- **環境変数はモジュールトップで throw しない**（`next build` を壊さないため）。ハンドラ内で 500 を返す。
- **`#contact-website`（Honeypot 欄）は削除も改名もしない**。`display:none` を検出するボットを避けるため
  画面外に置いてある（`aria-hidden` + `tabIndex={-1}`）。該当した送信は検知を悟らせないため
  `200 { ok: true }` を返してメール送信だけスキップする。
- **「送信までの経過時間が短すぎたら弾く」判定は入れない**（クライアントが値を作れるので
  素通しされる一方、オートフィルで素早く送った訪問者のメールを捨てる）。連投の抑止は
  Vercel Firewall のレート制限が持つ。

### E2E

- **`goto` 直後に1回だけスクロールするテストは hydration とレースする**（リスナーが付く前に終わると
  以後 `scroll` が飛ばない）。`e2e/motion.spec.ts` の `scrollUntilHidden` のように反応するまでやり直す。
- **`test.use({ reducedMotion: "reduce" })` はこの構成では反映されない**。`goto` の前に
  `page.emulateMedia({ reducedMotion: "reduce" })` を呼ぶ。
- **モバイル向けの spec は `e2e/responsive.spec.ts` に閉じる**（他の spec は 1280px 前提）。
  デスクトップの2プロジェクトは `testIgnore`、モバイルの2プロジェクトは `testMatch`。
- 重ねた2層は blockify されるため外形では折り返しの違いが出ない。行位置は Range の矩形で比べる。

## 触らない領域

- `ds-bundle/` / `.ds-sync/` / `.design-sync/compiled-styles.css` / `.design-sync/.cache/` —
  claude.ai/design 連携の生成物（gitignore 済み）。`.design-sync/` の入力は追跡対象で、
  `config.json`（同期の設定）/ `entry.ts`（バンドルのエントリ）/ `sync-tsconfig.json`（next の
  stub への paths）/ `compile-css.mjs`（Tailwind を静的 CSS へ）/ `conventions.md`（生成 README の
  ヘッダー。**デザインエージェントのシステムプロンプトに入る**）/ `NOTES.md`（再同期時の注意）/
  `stubs/` / `previews/` の8つ。**`componentSrcMap`（config.json）・`entry.ts`・`compile-css.mjs` の
  `@source` はディレクトリ構成に連動する**ので、コンポーネントを別ディレクトリへ動かしたら3つとも直す
  （`@source` の漏れはビルドも検証も通るのに CSS だけが欠ける）。
- `WORK_LOG/` — 作業セッションのサマリー。過去分は書き換えない。
- `.next/` / `node_modules/` / `test-results/` / `playwright-report/` / `docs/` — 生成物とローカル資料。

コミット author はローカル設定の `user.email = meayubgm@gmail.com`（`user.name` はグローバルの
`ayuha` を継承）。リモートは `git@github.com:meayubgm/portfolio-site.git`。
