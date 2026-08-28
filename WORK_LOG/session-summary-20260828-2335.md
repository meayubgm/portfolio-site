# セッションサマリー: Vercel への初回デプロイと公開確認・ドキュメントの全面書き直し

- 日時: 2026-08-28 23:35
- プロジェクト: portfolio-site（/Users/meayu/development/portfolio-site）

## 目的

サイトを Vercel へデプロイして公開し、公開後の確認（OGP・セキュリティヘッダー・レート制限）まで
終わらせる。あわせて README.md と CLAUDE.md を最終形として書き直す。

## 実施内容

### 1. デプロイの段取り

コード側は前セッションで完了していたため（作業ツリーはクリーン、`main` は origin と同期済み）、
環境変数がビルド時に埋め込まれる点を踏まえて「Turnstile のホスト名登録 → Vercel の環境変数 →
初回デプロイ」の順に進める手順を提示した。ユーザーの判断は次の2点。

- **独自ドメインは後回しにし、まず `*.vercel.app` で公開する**
- **プロジェクトは Vercel のダッシュボードから GitHub リポジトリを Import して作成する**

Turnstile の Hostnames に登録する値は FQDN（`megumi-ayuha-v2.vercel.app`）であることを確認した。

### 2. デプロイ（ユーザーが実施）

- Vercel プロジェクト名 `megumi-ayuha-v2` / 本番 URL `https://megumi-ayuha-v2.vercel.app`
- 環境変数は `SITE_URL` を除く5つを設定（`SITE_URL` は `VERCEL_PROJECT_PRODUCTION_URL` への
  フォールバックが効くため未設定）
- `/contact` で Turnstile ウィジェットが表示され、実際の送信でメールの受信まで確認
- `sitemap.xml` の `<loc>` が本番ドメインを指すことを確認
- OGP を Facebook Sharing Debugger と X のプレビューで確認（X の Card Validator は提供終了のため
  投稿画面のプレビューで代用）

### 3. 公開後の実測

| 確認 | 方法 | 結果 |
| --- | --- | --- |
| セキュリティヘッダー | `curl -sSI` で Home | 4本とも期待値どおり |
| 同（全ページ） | 5ページをループして件数を数える | すべて 4 |
| レート制限 | `/api/contact` へ 8 連続 POST | 5回まで `200`、6回目以降 `429` |

レート制限の確認は Honeypot 欄（`website`）を埋めた POST で行い、メール送信を発生させずに検証した。

### 4. Vercel Firewall のレート制限（ユーザーが実施）

Project → Firewall → Custom Rules に次のルールを1つ追加した。

- If: `Request Path` equals `/api/contact`
- Then: Rate Limit — 5 requests / 60 seconds、キーは IP Address、超過時は Deny（429）
- Save のあと **Publish** して反映

`Challenge` ではなく `Deny` を選んだのは、`fetch` で叩く API にチャレンジ画面を返しても JSON に
ならないため。

### 5. ドキュメントの全面書き直し（/docs-rewrite）

| ファイル | 内容 |
| --- | --- |
| `README.md` | 467 → 518行。**「デプロイ」節を新設**（Vercel 連携・環境変数・Turnstile のホスト名・Firewall のルール表・公開後の確認コマンド）。「セキュリティヘッダー」を「セキュリティ」に統合し、CSP 非導入とレート制限の所在をここにまとめた。レート制限の記述を実際に設定したルールに差し替え、フォーム節からはセキュリティ節への参照に変更。概要と技術スタックにホスティング（Vercel・本番 URL）を追加 |
| `CLAUDE.md` | 239 → 213行。本番が Vercel であること（`main` への push で自動デプロイ、詳細は README）をコマンド節に追記。`lib/` のデータ・BudouX・Wireframe・SEO・フォーム・E2E の各項目を圧縮し、README と重複する説明（Turnstile の `scale` など）を落とした |

経緯を前提とした表現（「〜に変更した」「別途入れます」等）を現在形の記述に置き換え、
「LINE Seed JP の代替として IBM Plex Sans JP」も選定条件（再配布可能なライセンス）の記述に改めた。

### 6. メモリ

`production-deployment.md` を追加し、本番 URL・プロジェクト名・`SITE_URL` 未設定でのフォールバック
運用・Turnstile のホスト名登録・未完了項目を記録した（リポジトリに残らない情報のため）。

## 主な決定事項

- **独自ドメインは取らず、まず `*.vercel.app` で公開する。** `SITE_URL` は未設定のままとし、
  `VERCEL_PROJECT_PRODUCTION_URL` へのフォールバックで canonical / OGP / sitemap を本番ドメインに
  向ける。独自ドメインへ移すときは `SITE_URL` の設定＋再デプロイと Turnstile の Hostnames 追加の
  2箇所を直す。
- **レート制限は 5 requests / 60 秒・IP キー・Deny。** Honeypot と Turnstile で守られている前提で、
  入力ミスによる数回の送り直しを妨げない範囲に置いた。
- **プレビューデプロイでは `/contact` の送信を確認しない。** Turnstile の自動許可は登録ホスト名の
  配下のサブドメインだけで、プレビューは兄弟サブドメインになるため。

## 未完了・残タスク

- **CSP** — Turnstile（`challenges.cloudflare.com` の script / frame / connect）・Google Fonts・
  Next のインラインスタイルを許可したうえで導入する
- `/api/contact` の自動返信メールは未実装
- 独自ドメインの取得（取得すれば Resend のドメイン検証も可能になり、`CONTACT_TO_EMAIL` の
  宛先制限が外れる）
- `.design-sync/config.json` の `componentSrcMap` が古い（`Button` などを `components/` として参照して
  いるが実際は `commons/`）

## 動作確認の状況

- 本番 `https://megumi-ayuha-v2.vercel.app` で、セキュリティヘッダー4本を全6ページで確認
- `/api/contact` へ 8 連続 POST し、6回目から `429` に変わることを確認
- `/contact` からの実送信でメール受信を確認（ユーザー）
- `sitemap.xml` の `<loc>`・OGP の見え方を確認（ユーザー）
- ドキュメントの記述は実装から確認して書いた（`package.json` / `Makefile` / `Dockerfile` /
  `compose.yaml` / `next.config.mjs` / `lib/site.ts`、および `commons/` 21種・`components/` 8種・
  `lib/` 12ファイル・`app/` のファイル構成）。書き直しにコードの変更は含まない
