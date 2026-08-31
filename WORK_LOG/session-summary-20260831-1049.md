# セッションサマリー: 自動返信メールを不採用として閉じ、Vercel Web Analytics を導入する

- 日時: 2026-08-31 10:49
- プロジェクト: portfolio-site（/Users/meayu/development/portfolio-site）

## 目的

2件。

1. 残タスクだった **`/api/contact` の自動返信メール**について、そもそも必要かと工数を評価する。
2. **アクセス解析の導入**。Vercel Analytics / GA4 / Cloudflare Web Analytics の3候補から選定して実装する。

## 実施内容

### 1. 自動返信メールの評価 → 不採用

「あった方が良いが、今の構成では作れない」ことを先に共有した。

送信元が Resend の共有ドメイン `onboarding@resend.dev` のままなので、**sandbox 制限により宛先は
Resend アカウントの登録アドレスに限られる**（README.md:361-365）。自動返信は訪問者が入力した
任意のアドレスへ送るものなので、この構成では必ず 403 になる。実現には独自ドメインの取得と検証
（SPF / DKIM）が前提で、**順序を逆にはできない**。

工数の内訳も提示した。コード本体は `app/api/contact/route.ts` の1ファイルに収まり
30〜60分（既存の `toHeaderSafe()` が流用でき、E2E は API を叩かないので改修不要）。
重いのはドメイン取得のほう、という構図だった。

ユーザーが**独自ドメインを取得する予定はない**と判断したため、**自動返信メールと独自ドメイン取得の
両方を残タスクから外した**。コードの変更は行っていない。

方針をメモリに記録した。

| ファイル | 内容 |
| --- | --- |
| `memory/contact-auto-reply-not-planned.md`（新規） | 判断日・理由・「再提案しない」「Resend で宛先を増やす案は同じ制限に当たる」旨。`[[no-db-backend-policy]]` とリンク |
| `memory/MEMORY.md` | 上記へのポインタを1行追加 |

### 2. アクセス解析の選定

3候補をこのプロジェクトの制約（CSP を1箇所の表で管理し未検証の配信元を足さない・全ページ SSG・
依存ツリーを細く保つ）に当てて比較し、**Vercel Analytics** を採用した。

| | Vercel Analytics | Cloudflare Web Analytics | GA4 |
| --- | --- | --- | --- |
| CSP の変更 | **不要**（同一オリジン配信） | 必要（`static.cloudflareinsights.com`） | 必要（3ディレクティブ） |
| Cookie / 同意バナー | cookieless・不要 | cookieless・不要 | **Cookie あり。バナーと `/privacy` が連鎖** |
| 依存 | `@vercel/analytics` 1つ | なし | なし |
| E2E への波及 | なし | `e2e/smoke.spec.ts` の CSP 検証を更新 | 同左 + バナー |
| 工数 | 約20分 | 約40分 | 数時間 |

### 3. 実装

| ファイル | 変更 |
| --- | --- |
| `package.json` / `package-lock.json` | `@vercel/analytics@2.0.1` を追加。**コンテナとホストの両方**に導入 |
| `app/layout.tsx` | `@vercel/analytics/next` の `<Analytics />` を `<footer>` の後に配置。`"use client"` は付けない |
| `next.config.mjs` | 定数 `VERCEL_ANALYTICS_DEV` を追加し、`contentSecurityPolicy()` の **`isDev` 分岐**の `script-src` にだけ足す |

`@vercel/analytics` は **development のときだけ** `https://va.vercel-scripts.com/v1/script.debug.js` を
読む。dev のコンソールに CSP 違反が出続けるのを避けるため、`'unsafe-eval'` / `ws:` と同じ分岐に置いた。
**本番の CSP は導入前と1文字も変わらない。**

`e2e/` は無変更。`smoke.spec.ts` の `script-src` 検証は `toContain` なので dev 限定の追加では落ちず、
`toEqual` で完全一致を見ている5ディレクティブ（`default-src` / `frame-ancestors` / `base-uri` /
`form-action` / `object-src`）には触れていない。

### 4. `/code-review` の指摘と対応

指摘は2件、いずれも **low・ドキュメント / コメントの正確性**。動作に影響するバグはゼロ。両方修正した。

| 指摘 | 検証結果 |
| --- | --- |
| ビーコンの送信先を `/_vercel/insights/event` と書いているが、それはサーバー側 `track()` 用 | **本物**。dist を読み直して確認し、`/_vercel/insights/` 配下（ページビューは `view`、カスタムイベントは `event`）と書き換えた |
| 「ローカルではデータが送られない」が `next dev` 限定 | **本物**。`playwright.config.ts:54` の `webServer` は `npm run build && npm run start` なので、Docker 未起動時と CI では `NODE_ENV=production` になり `/_vercel/insights/script.js` が 404 になる。この経路を README に明記した |

レビューが「未検証」とした `○ (Static)` の確認は、レビュー起動前に実施済みだった（レビューは
このセッションの実行ログを持たないため未確認扱いになった）。

レビューが誤検知として除外した項目: `<Analytics />` は内部で `Suspense fallback={null}` に
包まれているため SSG が落ちない / デバッグ用スクリプトはネットワーク送信をしないので
`connect-src` に足す必要がない / `isDev` の判定はパッケージ側と一致する / `2.0.1` は npm の
`latest` タグ。

### 5. ドキュメントの更新

| ファイル | 内容 |
| --- | --- |
| `README.md`「技術スタック」 | 「アクセス解析」の行を追加 |
| `README.md`「Client / Server の切り分け」 | `<Analytics />` は client だが `layout.tsx` は Server のままである旨を追記 |
| `README.md`「CSP」 | dev 分岐に `va.vercel-scripts.com` が入ること、**本番 CSP は導入前後で変わらない**理由を追記 |
| `README.md`「デプロイ」 | **「アクセス解析（Vercel Web Analytics）」小節を新設**。ダッシュボードでの有効化が要ること、CSP を足さずに済む理由、cookieless なので同意バナーと `/privacy` を置いていないこと、ローカル2経路の挙動の違い |
| `CLAUDE.md`「CSP（`next.config.mjs`）」 | dev 分岐の `va.vercel-scripts.com` を**本番側に足さない**旨を追記 |
| `CLAUDE.md`「Client / Server」 | `layout.tsx` に `"use client"` を付けると全ページが SSG から落ちる旨を追記 |

## 主な決定事項

- **`/api/contact` の自動返信メールは実装しない。独自ドメインの取得も行わない。** Resend の
  sandbox 制限が前提条件であり、その前提を満たす予定がないため、前提側の残タスクごと閉じた。
  自動返信が無くても送信完了は `ContactForm` の画面表示で伝わり、問い合わせ本体は
  `CONTACT_TO_EMAIL` に届くので機能上の欠落ではない。
- **アクセス解析は Vercel Analytics。** 決め手は **CSP をまったく触らずに済む唯一の選択肢**である
  こと。前セッションで立てた「未検証の配信元を CSP に足さない」方針（`vercel.live` を実測のうえ
  入れなかった経緯）と一貫する。副次的に cookieless なので同意バナーが不要、同一オリジン配信なので
  広告ブロッカーで落ちにくい。
- **GA4 は明確に不採用。** ポートフォリオの用途に対して過剰で、同意バナーが第一印象を損ない、
  改正電気通信事業法（外部送信規律）の告知のために現状ない `/privacy` の新設まで連鎖する。
- **Cloudflare Web Analytics は次点。** Turnstile ですでにアカウントがあり無料枠も無制限だが、
  CSP に配信元を2ディレクティブ足す必要があり、`e2e/smoke.spec.ts` の更新も伴う。
- **`va.vercel-scripts.com` は dev 分岐にだけ置く。** 本番は同一オリジンで完結するため。

## 未完了・残タスク

- `commons/` は21種あるが design-sync の同期対象は13種のまま。`BackLink` / `BulletList` /
  `HoverCue` / `LearnMoreCue` / `TagList` / `Text` は追加候補（previews の作成が要る）
- 本番デプロイ後の実測が未実施（下記「動作確認の状況」参照）

## 動作確認の状況

- **依存の確認** … `added 1 package`。`npm info @vercel/analytics dependencies` が空で
  **transitive 依存ゼロ**。`2.0.1` は npm の `latest` タグ。ホスト・コンテナの両方に導入済み
- **パッケージの実装を読んで配信元を実測** … dist 内の URL は
  `https://va.vercel-scripts.com/v1/script.debug.js`（dev のみ）/ `/_vercel/insights/script` /
  `/_vercel/insights/event`（`dist/server/index.mjs` のサーバー側 `track()` 用）の3つ
- **本番 CSP が導入前と完全に一致** … `NODE_ENV=production` で `next.config.mjs` の `headers()` を
  評価し、`va.vercel-scripts.com` / `'unsafe-eval'` / `ws:` のいずれも含まれないことを確認
- **dev サーバーで全6ページを Chromium で巡回** … `securitypolicyviolation` **0件**。
  読まれたアナリティクス関連リクエストは `script.debug.js` の1本のみ。検出されたコンソールエラー
  2件（`/contact`）は `sourceFile` が `challenges.cloudflare.com` で、**Turnstile 自身のスクリプト由来**
- `docker compose exec app npm run build` … 成功。`/api/contact` 以外の**全ルートが `○ (Static)`**
  のままで SSG を維持
- `make lint` … green
- `npx playwright test` … **121 passed / 1 skipped**（従来どおり。skip は `webkit` の Turnstile 1件）
- **Vercel ダッシュボードでの Web Analytics 有効化はユーザーが実施済み**
- 本番デプロイ後の実測（`curl` で CSP に `va.vercel-scripts.com` が入っていないこと、
  `/_vercel/insights/script.js` が 200 でビーコンが飛ぶこと、Analytics タブへの反映）は**未実施**
