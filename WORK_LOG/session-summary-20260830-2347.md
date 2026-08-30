# セッションサマリー: CSP を導入し、Codex レビューで E2E の検証粒度を上げる

- 日時: 2026-08-30 23:47
- プロジェクト: portfolio-site（/Users/meayu/development/portfolio-site）

## 目的

前セッションからの残タスクだった **CSP（Content-Security-Policy）の導入**。
「Turnstile・Google Fonts・Next のインラインスタイルを許可したうえで導入する」という宿題に対し、
まず**そもそも必要か**を評価したうえで方針を決め、実装・検証・ドキュメント化まで行う。

## 実施内容

### 1. 「必要か」の評価と方針の決定

このサイトの XSS 攻撃面は小さい。ユーザー入力を描画する箇所が無く、`dangerouslySetInnerHTML` は
`app/(pages)/page.tsx:42` の JSON-LD（自前定数の `JSON.stringify`）1箇所のみ。**必須ではない**ことを
先に共有したうえで、3案を提示してユーザーが B 案を選択した。

| 案 | 内容 | 判断 |
| --- | --- | --- |
| A | 導入しない | 不採用 |
| **B** | **SSG を維持する静的 CSP** | **採用** |
| C | nonce + `strict-dynamic` | 不採用（middleware が要り全ページ dynamic に落ちる） |

### 2. CSP の実装（`next.config.mjs`）

`contentSecurityPolicy()` を追加し、`securityHeaders` の先頭に置いた。ディレクティブは
配列の表として書き下している。

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

`headers()` は dev サーバーにも効くため、`process.env.NODE_ENV !== "production"` のときだけ
`script-src` に `'unsafe-eval'`（React Refresh）、`connect-src` に `ws:`（HMR）を足す分岐を入れた。

### 3. 本番ビルドでだけ出た CSP 違反への対処（`lib/contactSchema.ts`）

本番ビルドで `/contact` に **`script-src <- eval` の違反が1件**発生した。
`securitypolicyviolation` イベントの `sourceFile` / `columnNumber` からバンドルの該当箇所を切り出して
特定したところ、**Zod v4 の JIT 判定**（`try { Function(""); return true } catch { return false }`）だった。

Zod 自体は jitless にフォールバックするため動作は壊れないが、訪問者全員のコンソールに違反が
記録される。判定ごと止めるため `z.config({ jitless: true })` をモジュールトップに追加した。
4項目のフォームで JIT の速度差は問題にならない。

**dev では `'unsafe-eval'` があるため再現しない**。本番ビルドで確認しなければ見落としていた。

### 4. Codex によるセカンドオピニオンレビュー（`/codex-review`）

Codex（gpt-5.2-codex / read-only）に差分をレビューさせ、指摘を実コードで検証した。
指摘は2件、いずれも Low。Critical / High はなし。

| 指摘 | 検証結果 |
| --- | --- |
| `e2e/smoke.spec.ts` の CSP テストが退行を検知できない | **本物**。修正した |
| Vercel Preview の Toolbar（`vercel.live`）が `script-src` に無い | **false positive**（プレビューで実測し決着） |

Toolbar の指摘はコード上は成立するが、このプロジェクトでは Toolbar 自体が無効なため実害がない。
プレビューデプロイを Vercel にログインした状態で開き、Console に CSP 違反が出ないことで決着させた。

### 5. E2E テストの修正（`e2e/smoke.spec.ts`）

当初の実装はヘッダー文字列全体への `toContain` だけで、**配信元がどのディレクティブに載っているかを
見ていなかった**。`parseCsp()` を追加してヘッダーを「ディレクティブ名 → 配信元の配列」に均し、
ディレクティブ単位で検証する形へ書き換えた。

- `style-src` の `fonts.googleapis.com` / `font-src` の `fonts.gstatic.com` を個別に
- `script-src` / `connect-src` / `frame-src` の3つすべてに `challenges.cloudflare.com`
- **`script-src` と `style-src` の `'unsafe-inline'`**（当初アサーションが1つも無く、
  CLAUDE.md に「外すな」と書いた項目がテストで守られていなかった）
- `default-src` / `frame-ancestors` / `base-uri` / `form-action` / `object-src` は `toEqual` で完全一致
- `'unsafe-eval'` / `ws:` は dev だけで付くため有無を問わない

### 6. ドキュメントの更新

| ファイル | 内容 |
| --- | --- |
| `README.md`「セキュリティ」 | ヘッダー表に `Content-Security-Policy` を追加。CSP の全文、外部配信元が Turnstile と Google Fonts の2つだけであること、`'unsafe-inline'` を残した理由、dev 分岐、`z.config({ jitless: true })` がこの CSP とセットであることを記載 |
| `README.md`「公開後の確認」 | `curl` の `grep -iE` に `content-security-policy` を追加 |
| `README.md`「E2E」 | `smoke.spec.ts` の守備範囲に CSP を追記 |
| `CLAUDE.md`「変更時に壊しやすい箇所」 | 「CSP（`next.config.mjs`）」を新設。配信元を増やしたら足すこと、dev 側の `'unsafe-eval'` / `ws:` を消さないこと、`'unsafe-inline'` は外せないこと、`z.config({ jitless: true })` を消さないことの4点 |
| `README.md` / `CLAUDE.md`（プレビュー確認後） | `vercel.live` を入れていない理由（Toolbar がチームレベルで無効・実測で確認）を追記 |

### 7. 依頼スコープ外の修正（承認済み）

`.design-sync/entry.ts` の export 並び順が Biome の organizeImports に違反しており、
**このセッションの変更前から `make lint` が落ちる状態**だった（前セッションで手編集した際の取りこぼし）。
lint を通さないと検証が進まないため `biome check --write` で2行を並べ替え、報告のうえ承認を得た。
整形のみで挙動の変化はない。

## 主な決定事項

- **`script-src` の `'unsafe-inline'` は残す。** Next のインライン `self.__next_f.push(...)` と
  Home の JSON-LD があり、nonce で許可するには `middleware.ts` が要る。middleware を置くと
  全ページが dynamic レンダリングに落ちて **SSG が効かなくなる**。
  **インライン script の遮断より SSG を採り**、CSP の役割は
  「読み込み元オリジンの限定」と「XSS を前提としない指示（`frame-ancestors` / `base-uri` /
  `form-action` / `object-src`）」に置く。
- **Vercel Toolbar（`vercel.live`）は CSP に足さない。** Codex が「プレビューで Toolbar が
  ブロックされる」と指摘したが、**プレビューデプロイを Vercel にログインした状態で開いて実測し、
  コンソールに CSP 違反が出ないことを確認した**ので不要と判断した。プロジェクトの Toolbar 設定は
  Pre-Production / Production とも `Default（controlled at the team level）`で、チーム側で
  無効になっているとみられる。**未検証の配信元を CSP に足さない**方針を採り、実測で決着させた。
  将来 Toolbar を有効化する場合は `process.env.VERCEL_ENV !== "production"` の分岐で足せば、
  本番の CSP は変えずに済む。
- **Zod は jitless に固定する。** グローバル設定だが、`lib/contactSchema.ts` は
  Route Handler と ContactForm の両方から import され、JIT 判定は初回 parse 時の遅延評価なので
  モジュールトップの設定が必ず先に効く。

## 未完了・残タスク

- `/api/contact` の自動返信メールは未実装
- 独自ドメインの取得（Resend のドメイン検証が可能になり `CONTACT_TO_EMAIL` の宛先制限が外れる）
- `commons/` は21種あるが design-sync の同期対象は13種のまま。`BackLink` / `BulletList` /
  `HoverCue` / `LearnMoreCue` / `TagList` / `Text` は追加候補（previews の作成が要る）

## 動作確認の状況

- `docker compose exec app npm run build` … 成功。**全ページが `○ (Static)`** のままで SSG を維持
- **本番ビルド（`next start`）で全6ページを Playwright で巡回** … `securitypolicyviolation` **0件**、
  コンソールエラー・失敗リクエストなし。Google Fonts 5ファミリすべて `loaded`、
  `h1` の `font-family` は `"Space Grotesk", "IBM Plex Sans JP", sans-serif`
- `/contact` の Turnstile … `challenges.cloudflare.com` の iframe が正常に生成され `frame-src` を通過。
  トークンが空なのはサイトキーの許可ホスト名に localhost が入っていないためで、CSP とは無関係
- ヘッダーの実値を dev / 本番の両方で確認（dev にのみ `'unsafe-eval'` と `ws:` が付く）
- **E2E テストが退行を検知することを実証** … `next.config.mjs` を一時的に壊し
  （`font-src` から `fonts.gstatic.com` を削除、`script-src` から `'unsafe-inline'` を削除）て実行し、
  期待どおり失敗することを確認したうえで設定を復元。修正前のテストはこの状態でも通っていた
- `make lint` … green
- `npx playwright test` … **121 passed / 1 skipped**。dev サーバー・本番ビルドの両方で実行。
  skip は `webkit` の Turnstile ウィジェットテスト1件で、既存のもの（`chromium` では pass）
- **本番デプロイ後にヘッダーを実測**（`curl -sSI https://megumi-ayuha-v2.vercel.app/`）…
  CSP を含む5ヘッダーがすべて期待どおり。`'unsafe-eval'` と `ws:` は入っておらず、
  ローカルの本番ビルドと完全に一致した（`NODE_ENV` の分岐が Vercel のビルド時・実行時とも正しく効いている）
- **プレビューデプロイを Vercel にログインした状態で開き、DevTools の Console に
  エラーが無いことを確認**。Toolbar が注入されていれば `vercel.live` のスクリプトが必ず
  ブロックされるため、Codex の指摘が false positive であることの決着となった
