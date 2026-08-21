# セッションサマリー: お問い合わせフォームへの React Hook Form + Zod バリデーション導入

- 日時: 2026-08-21 11:07
- プロジェクト: portfolio-site（/Users/meayu/development/portfolio-site）

## 目的

`/contact` のお問い合わせフォームに **React Hook Form + Zod** によるクライアント側バリデーションを導入する。

- 必須項目の入力有無とメールアドレスの妥当性をチェックする
- 「送信する」ボタン押下時にエラーがあれば、**各項目の直下に `text-red-500` でメッセージを表示**する

## 実施内容

### 第1部: 方針の確認（計画フェーズ）

既存実装を読み、以下2点をユーザーに確認して方針を決めた。

- **Zod スキーマの適用範囲** → 「クライアント / サーバー共有」を選択。
  `app/api/contact/route.ts` の手書き検証（`parsePayload` / `EMAIL_PATTERN` / `asString`）も
  同じスキーマに統一し、検証ルールを単一ソース化する。
- **再検証タイミング** → React Hook Form のデフォルト（`mode: "onSubmit"` / `reValidateMode: "onChange"`）。
  初回は送信押下時のみ検証し、以降エラー中の項目は入力に応じてリアルタイムに消える。

### 第2部: 依存追加

`react-hook-form@7.85.0` / `zod@4.4.3` / `@hookform/resolvers@5.9.1` を dependencies に追加。

Docker 環境のため、前回セッションの `resend` と同じ轍を踏まないよう2段構えで反映した。

1. `docker compose exec app npm install ...`（コンテナ内 `node_modules` へ即時反映）
2. ホストでも `npm install`（IDE / tsserver の型解決用）
3. `docker compose build app` でイメージにも焼き込み

### 第3部: `lib/contactSchema.ts`（新規）

検証ルールの単一ソース。`route.ts` にあった `LIMITS` と `EMAIL_PATTERN` をここへ移した。

- `CONTACT_LIMITS` — 各入力の最大文字数（name 100 / company 100 / email 254 / message 2000）。
  クライアントの `maxLength` と共用する。
- `contactSchema` — name / company / email / message の4項目。各項目 `.trim()` 済みで、
  必須・最大長・メール形式のメッセージを日本語で定義。
  メール形式は既存サーバー実装と同じ `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` を `.regex()` で使う
  （`z.email()` は RFC 寄りで既存挙動と差が出るため不採用）。
- `contactPayloadSchema` — 上記 + `website`（Honeypot）/ `token`（Turnstile）。
  `z.preprocess(normalizePayload, ...)` で任意の JSON を「全キー文字列」に均してから検証する。
  これにより非文字列が来ても英語の既定メッセージ（`Invalid input: expected string`）ではなく、
  未入力と同じ日本語メッセージを返せる（旧 `asString()` の挙動を踏襲）。

### 第4部: `components/FormField.tsx`

- `error?: string` prop を追加。渡されたときだけコントロール直下に
  `text-red-500` のメッセージ `<p>` を描画する。
- エラー要素の id を組み立てる `errorId(id)` を export（`input` 側の `aria-describedby` と揃えるため）。

### 第5部: `components/ContactForm.tsx`

- `useState(initialValues)` / `update()` を廃止し、
  `useForm<ContactInput>({ resolver: zodResolver(contactSchema), defaultValues })` に置換。
  各コントロールは `{...register("name")}` 等に変更（`name` 属性は register が供給する）。
- `<form onSubmit={handleSubmit(onSubmit)} noValidate>` に変更。
  **`noValidate` は必須** — 付けないとブラウザ標準の検証 UI が先に走り、Zod のメッセージに到達しない。
  `required` / `type="email"` 属性自体は支援技術向けに残した。
- 送信中判定は `formState.isSubmitting`（`status` state は success / error 表示に引き続き使用）。
- 各項目に `aria-invalid` / `aria-describedby` を付与。
- **Honeypot（`#contact-website`）と Turnstile のトークンは RHF 管理外のまま**、従来どおり `useState` で保持。

### 第6部: `app/api/contact/route.ts`

- `LIMITS` / `EMAIL_PATTERN` / `asString()` / `parsePayload()` を削除し、
  `contactPayloadSchema.safeParse(body)` に置き換え。失敗時は `issues[0].message` を
  `{ error }` として 400 で返す（レスポンス形状は現行のまま）。
- `ContactPayload` 型をスキーマ由来（`z.infer`）に差し替え。
- `looksLikeBot()` / `toHeaderSafe()` / Turnstile 検証 / Resend 送信の流れは無変更。

### 第7部: ドキュメント追従

- `README.md` — 技術スタック表に「フォーム | React Hook Form + Zod」の行を追加。
  「お問い合わせフォーム（/contact）」節に入力検証の説明を追記。
  ディレクトリツリーに `lib/contactSchema.ts` を追加し、`FormField.tsx` の説明を
  「＋エラー表示の行」に更新。
- `CLAUDE.md` — ディレクトリ節に `lib/contactSchema.ts` を追加、`FormField` の説明を更新
  （`formControlClass` に加え `errorId` も export）。
  「お問い合わせフォーム（/contact）」節に、RHF + Zod の構成・検証タイミング・
  **`noValidate` が必須である理由**・Honeypot / トークンが RHF 管理外である旨を追記。

### 第8部: コードレビュー（/code-review）とその対応

レビューで2件（いずれも低）の指摘。3点を適用した。

1. **エラーメッセージがスクリーンリーダーに通知されない**（`components/FormField.tsx`）
   条件付きレンダリングの `<p>` に `role` / `aria-live` がなく、RHF の `shouldFocusError`（既定 true）で
   フォーカスが当たる1件目しか読み上げられない。全項目空で送信すると2件目以降が無通知になる。
   → `role="alert"` を付与。
2. **空白のみの Honeypot がすり抜ける**（`lib/contactSchema.ts`）
   `website` に `.trim()` が掛かっており、空白だけを入れるボットが
   `looksLikeBot()` の `data.website !== ""` を通過していた。
   旧実装の `asString()` も trim していたため**今回の退行ではない**が、判定用フィールドを
   新ファイルへ移した機会に `z.string()`（trim なし）へ変更。
3. **エラー色の不統一**（`components/ContactForm.tsx`）
   送信ボタン横のサーバー由来エラーが `text-indigo-600` のままだったため `text-red-500` に統一。

レビューが false positive として除外した点も確認した。二重送信ガード（旧 `if (status === "sending") return;`）の
削除は、`Button` が `disabled={sending}` になり **HTML の implicit submission 仕様上、default button が
disabled ならフォーム送信自体が起きない**ため実害なし。

### 変更ファイル

- 新規: `lib/contactSchema.ts`
- 変更: `components/ContactForm.tsx` / `components/FormField.tsx` / `app/api/contact/route.ts`
- 変更: `package.json` / `package-lock.json`（依存3つ追加）
- 変更: `README.md` / `CLAUDE.md`

## 主な決定事項

- **Zod スキーマはクライアント / サーバーで共有する**。Route Handler の手書き検証を廃止し、
  `lib/contactSchema.ts` を検証ルールの単一ソースとする。
- **メール形式は `z.email()` を使わず、既存の `EMAIL_PATTERN` を `.regex()` で流用する**。
  `z.email()` は RFC 寄りで、稼働中のサーバー実装と受理範囲が変わるため。
- **`z.preprocess` で任意 JSON を全キー文字列に均す**。旧 `asString()` の「非文字列は空文字扱い」を保ち、
  型不一致時に英語の既定メッセージが露出するのを防ぐ。
- **`<form>` の `noValidate` は必須**。ブラウザ標準の検証 UI が Zod のメッセージを覆い隠すため。
  `required` / `type="email"` 属性は支援技術向けに残す。
- **Honeypot と Turnstile トークンは RHF 管理外のまま**にする。`#contact-website` は
  CLAUDE.md で改名・削除が禁じられており、既存の `useState` 実装をそのまま維持した。
- **Honeypot の `website` は trim しない**。空白のみを入れるボットも検知するため。

## 未完了・残タスク

- **Vercel の環境変数設定**（前セッションからの継続）。
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` はビルド時にバンドルへ埋め込まれるため、設定後の再デプロイが必要。
- `/works/brew` の E2E が **WebKit の並列実行時のみ flake する**（`page.goto` が `load` を待って 30s タイムアウト）。
  単体実行では 1.3s で成功し、変更を stash した元コードでも同じく失敗するため**今回の変更とは無関係の既存問題**。
  原因は未調査。
- `/api/contact` のレート制限は未実装。自動返信メールも未実装。
- `onboarding@resend.dev` は共有ドメインのため、Gmail の迷惑メールフォルダに入る可能性がある。
- `Button` の `href` + `disabled` の組み合わせで `disabled` が無視される（現在該当する呼び出しはない）。
- `npm audit` の high 5件。
- `/skills` の各スキル説明文はユーザーによる最終確認・差し替えが必要。
- BREW ケーススタディの実機タイマー GIF は `MediaPlaceholder` のまま。
- レスポンシブ対応は別途。

## 動作確認の状況

- `npm run lint`（Biome + ESLint、コンテナ内）: 59ファイルでクリーン。
- `npm run build`（コンテナ内）: 成功（型チェック込み）。ルート一覧で `/contact` が `○ (Static)`、
  `/api/contact` が `ƒ (Dynamic)` のままであることを確認。
- **Zod スキーマの単体検証**（コンテナ内 `node` で `.ts` を直接実行）:
  - trim 適用・必須／形式メッセージ・エラー順序（name → email → message）を確認。
  - 非文字列（`name: 123`）が日本語メッセージで 400 になることを確認。
  - レビュー対応後、`website: "   "` → bot 判定 `true`、未指定 → `""` で `false` になることを確認。
- **ブラウザ実機確認**（Playwright MCP / `http://localhost:3000/contact`）:
  - 全項目空で送信 → お名前 / メールアドレス / お問い合わせ内容の直下に赤いメッセージが出て、
    会社名（任意）には出ない。
  - メールに `abc` を入力 → 「メールアドレスの形式が正しくありません。」に切り替わる。
  - 正しいアドレスを入れると即座にエラーが消える（`reValidateMode: "onChange"` の動作を確認）。
  - コンソールのエラーは Cloudflare Turnstile 自身のスクリプト由来のみ。
- `npx playwright test`（ホスト）: レビュー対応後の `e2e/navigation.spec.ts` は 40/40 パス。
  全件実行時に `/works/brew` の WebKit 2件が落ちるが、変更前のコードでも同様に落ちる既存 flake。
- レビューエージェント側でも `tsc --noEmit` / `biome check` / `next build` を実行し、
  `@hookform/resolvers` の dist を読んで「`onSubmit` に渡る値は Zod が trim 済み」というコメントの
  正しさと、`z.preprocess` が旧 `parsePayload` と同挙動であることを確認済み。
