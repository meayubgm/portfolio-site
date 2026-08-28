# セッションサマリー: 公開前レビューの指摘対応（依存更新 / Memory Leak / SEO / セキュリティ）

- 日時: 2026-08-28 19:03
- プロジェクト: portfolio-site（/Users/meayu/development/portfolio-site）

## 目的

Codex による公開前レビュー（`docs/公開前レビュー_20260828.md`）の指摘に対応し、サイトを公開できる
状態にする。ユーザーからの観点指定は「Memory Leak」「SEO（OGP）」「セキュリティ」「`npm audit` の
High 4件」の4つ。Vercel の環境変数設定と design-sync は今回のスコープ外。

## 実施内容

Plan モードで調査・計画（`~/.claude/plans/docs-20260828-md-codex-memory-replicated-crown.md`）し、
承認後に実装した。実装中に4件、`/code-review high` で5件の追加修正が発生している。

### 1. 依存の High 4件を解消

`next` を **16.2.10 → 16.3.3**（`latest`。`^16.2.0` の範囲内）に更新。`postcss` / `sharp` / `nanoid` は
いずれも `next` 経由の transitive 依存だったため、これ1つで4件とも解消した。あわせて dev 側に残って
いた `brace-expansion`（eslint → minimatch 経由）の High 1件も `npm audit fix` で解消し、
**prod / 全体とも 0 vulnerabilities** になった。

作業中、稼働中の dev サーバーの裏で `docker compose exec app npm install` を実行したためコンテナの
`node_modules` が壊れた。ホスト側で更新 → `docker compose down -v` → イメージ再ビルドで復旧している。

### 2. Turnstile ウィジェットの破棄（Memory Leak）

| ファイル | 内容 |
| --- | --- |
| `components/ContactForm.tsx` | `removeWidget` を追加。ウィジェットの寿命を effect が持つ形にし（`renderWidget()` を呼んで cleanup で `removeWidget` を返す）、送信成功時にも `removeWidget()` を呼ぶ |
| `e2e/navigation.spec.ts` | `/contact` の出入りでウィジェットが増えないことを見る回帰テストを追加 |

### 3. SEO の公開情報

| ファイル | 内容 |
| --- | --- |
| `lib/site.ts`（新規） | サイト URL・名前・説明文・著者情報・OGP 画像のパス / alt・ルート一覧（`sitePaths`）・`fullTitle()` |
| `lib/metadata.ts`（新規） | ページ別 metadata を組み立てる `pageMetadata()` |
| `app/layout.tsx` | `metadataBase` / `title.template` / description / OGP / `twitter:card` / canonical / robots |
| `app/(pages)/` 全6ページ | `pageMetadata()` に置き換え、**全ページに description を追加**。Home に `Person` の JSON-LD |
| `app/opengraph-image.tsx`（新規） | `next/og` の `ImageResponse` で 1200×630 を静的生成 |
| `app/sitemap.ts` / `app/robots.ts`（新規） | サイトマップと robots |
| `components/SiteNav.tsx` | ロゴの `alt="icon"` → `alt="Megumi Ayuha"` |
| `.env.example` | `SITE_URL` を追加 |

### 4. セキュリティヘッダー

`next.config.mjs` に `headers()` を追加し、全パス（`source: "/:path*"`）へ
`X-Content-Type-Options: nosniff` / `Referrer-Policy: strict-origin-when-cross-origin` /
`Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()` /
`X-Frame-Options: DENY` を付与した。CSP は対象外。

### 5. `/code-review high` の指摘への対応（5件）

| # | ファイル | 内容 |
| --- | --- | --- |
| 1 | `lib/metadata.ts` | ページ側の `openGraph` がルートを丸ごと置き換えるため、`og:type` / `og:locale` / `og:site_name` が Home 以外の5ページから消えていた。`pageMetadata()` で書き直すよう修正（**本物のバグ**） |
| 2 | `lib/site.ts` / `app/layout.tsx` / `lib/metadata.ts` | タイトルの区切りが `title.template` と og:title の2箇所にあったので、`fullTitle()` に集約 |
| 3 | `e2e/navigation.spec.ts` | console の収集条件が「Turnstile を含む出力すべて」と広すぎたため、`Cannot find Widget` に限定 |
| 4 | `lib/site.ts` | スキームなしの `SITE_URL`（`example.com`）で `new URL()` が投げてビルドが落ちる問題。`https://` を補い末尾スラッシュも除去 |
| 5 | `app/sitemap.ts` | `lastModified: new Date()` を**削除**（ユーザー判断） |

`e2e/smoke.spec.ts` に og:type / og:locale / og:site_name の検証を追加して #1 の再発を塞いだ。

### 6. E2E とドキュメント

- `e2e/smoke.spec.ts` — 既存の title 期待値を `|` 区切りに更新し、各ページの canonical / description /
  OGP、`robots.txt` / `sitemap.xml`、OGP 画像の Content-Type、セキュリティヘッダーの検証を追加
- `README.md` — 環境変数の表に `SITE_URL`、技術スタックを Next.js 16.3 に、ディレクトリ構成と `lib/`
  の表に新規ファイル、「SEO とメタデータ」「セキュリティヘッダー」節を新設、E2E 節に smoke の
  カバー範囲を追記、**レート制限の記述を「Vercel の WAF 側で設定する」方針に差し替え**
- `CLAUDE.md` — 「SEO / メタデータ」節を新設し、Turnstile の寿命管理を「お問い合わせフォーム」節に追記

コミット: `1dadf31 feat: SEO の公開情報とセキュリティヘッダーを追加`（22ファイル、+936 / -251）。
push 済み（`aeda1c8..1dadf31`）。

## 主な決定事項

- **本番 URL は環境変数で切り替える**（ユーザー判断）。`SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` →
  `http://localhost:3000` の順にフォールバックするので、**Vercel に環境変数を設定する前でも
  canonical / OGP / sitemap は本番ドメインを向く**。`NEXT_PUBLIC_` は付けない（サーバー専用のため）。
- **OGP 画像は `next/og` で動的生成**（ユーザー判断）。追加依存ゼロ。**日本語は描かない** —
  `ImageResponse` は同梱の欧文フォントしか持たず、日本語を出すにはフォントファイルをリポジトリに
  抱える必要があるため。文言は英字のみで、図はサイトと同じブループリント格子 + 正六面体の
  ワイヤーフレーム（等角投影）。
- **レート制限はアプリに入れず Vercel の WAF 側で設定する**（ユーザー判断）。Serverless では
  インスタンスをまたげずモジュールスコープのカウンタが当てにならないため。README に手順を記載した。
- **セキュリティヘッダーは CSP を除く基本セットまで**（ユーザー判断）。CSP は Turnstile・Google Fonts・
  Next のインラインスタイルの許可設定と動作確認が要るため別途。`X-Frame-Options: DENY` は4本目として
  追加した（Turnstile は「こちらが iframe を埋め込む」側なので影響しない）。
- **sitemap に `lastmod` を入れない**（ユーザー判断）。ビルド時刻を入れると無変更のデプロイでも全 URL が
  更新され、当てにならない値としてクローラに無視されるため。
- **`pageMetadata()` は `openGraph` を全部書き直す**。Next の metadata マージはページ側で `openGraph` を
  持った時点でルートのものを丸ごと置き換えるので、`type` / `locale` / `siteName` / `images` を
  減らすと該当タグだけが静かに消える。
- **タイトルの区切りは `fullTitle()` が一手に持つ**。`<title>` と og:title の両方がこれを通る。

## 実装中に見つかった、レビューに無かった問題

- **`onReady` だけではウィジェットが描き直されない** — `remove` を足した結果、`/contact` を離れて戻ると
  ウィジェットが出ずフォームが送信不能になった。`<Script>` の `onReady` はスクリプトを初めて読み込む
  ときにしか間に合わないため。ウィジェットの寿命を effect に持たせて解決した。
- **サブページの og:image が消える** — ページ側で `openGraph` を持つとルートの `opengraph-image` の
  継承が切れる。`pageMetadata()` で `images` を明示して解決（後に #1 で `type` / `locale` /
  `siteName` も同じ理由で消えていたことが判明）。
- **Next 16.3.3 の dev サーバーが日本語を含むコードフレームでクラッシュする** — コンパイルエラーの
  表示中に `crates/next-code-frame/src/highlight.rs` で char boundary の panic が起きてプロセスごと
  落ちた。エラー表示側の問題で、コード自体の正しさとは無関係。

## 動作確認の状況

- `make lint`（Biome + ESLint）: クリーン
- `docker compose exec app npx tsc --noEmit`: クリーン
- `docker compose exec app npm run build`: 成功（15ルート。`/opengraph-image` `/robots.txt`
  `/sitemap.xml` がいずれも Static として生成される）
- `docker compose exec app npm audit` / `npm audit --omit=dev`: **0 vulnerabilities**
- `npx playwright test --workers=1`: **166件すべてパス**
- HTTP レスポンスでの実測:
  - セキュリティヘッダー4本が `/` に付く
  - `robots.txt` / `sitemap.xml`（6 URL・`lastmod` なし）
  - 全6ページで canonical・description・og:image・og:type・og:locale・og:site_name が出る
  - 全6ページで `<title>` と og:title が文字列として一致する
  - Home の `Person` JSON-LD
- OGP 画像を実際にダウンロードして目視確認（文字切れ・豆腐なし）
- Turnstile: 修正前は `/contact` の往復ごとに `Cannot find Widget ... consider using
  turnstile.remove()` が出ることを Playwright で再現。修正後は**4往復してウィジェット1つ・警告ゼロ**
- `SITE_URL=example.com/`（スキームなし・末尾スラッシュ）でビルドし、`https://example.com/works` が
  出力されることを確認（修正前は `TypeError: Invalid URL` でビルドが落ちる）
- `/codex-review`（実行者: Codex、read-only）: **指摘なし**。ただし返答が「指摘なし」の一語で分析が
  返らず、どこまで読んだか判断できないため、クロスチェックとしての確度は低いと判断した
- `/code-review high`: 5件の指摘。**false positive はゼロ**で、うち1件は実レスポンスで再現した本物のバグ

## 未完了・残タスク

- **Vercel の環境変数設定** — `NEXT_PUBLIC_TURNSTILE_SITE_KEY`（未設定だと `/contact` にウィジェットが
  出ず送信できない。ビルド時に埋め込まれるので設定後に再デプロイが必要）。`SITE_URL` は未設定でも
  `VERCEL_PROJECT_PRODUCTION_URL` にフォールバックするため任意
- **Vercel の Firewall → Rate Limiting** で `/api/contact` に制限を設定する
- **CSP** — Turnstile（`challenges.cloudflare.com` の script / frame / connect）と Google Fonts、
  Next のインラインスタイルを許可したうえで導入する
- `/api/contact` の自動返信メールは未実装
- `.design-sync/config.json` の `componentSrcMap` が古い（`Button` などを `components/` として参照して
  いるが実際は `commons/`）
- デプロイ後に本番 URL で OGP の見え方（Facebook Sharing Debugger / X）と `sitemap.xml` の `<loc>` を確認する

### 今回のセッションで解消したもの

- `npm audit` の High 4件（前セッションからの継続）
- Codex レビューの指摘（依存更新・Turnstile の破棄・SEO 4項目・セキュリティヘッダー・ロゴの alt）

### 調査の結果、対応不要だったもの

- `/contact` のコンソールに出る
  `Blocked script execution in 'about:blank' because the document's frame is sandboxed...` —
  発生元は Turnstile のウィジェット iframe（`normal?lang=auto`）で、自前のコードには `sandbox` /
  `<iframe>` の記述が1つも無い。ユーザーがシークレットウィンドウ（拡張機能オフ）で再現しないことを
  確認したため、Chrome 拡張（AdBlock）由来で確定。サイト側の対処は不要
- `public/.DS_Store` — git の追跡下に無いことを確認済み（レビューの指摘は誤り）
