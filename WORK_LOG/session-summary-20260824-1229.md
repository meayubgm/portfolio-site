# セッションサマリー: JSX の要素出しわけで三項演算子を禁止する lint ルールの追加

- 日時: 2026-08-24 12:29
- プロジェクト: portfolio-site（/Users/meayu/development/portfolio-site）

## 目的

グローバルのコーディング規約「JSX で要素を出しわける場合は三項演算子を避け、早期 return や変数への
切り出しを優先する（文字列など短い値の出しわけには三項演算子を使ってよい）」を、
人間・エージェントの注意力に頼らずリンターで機械的に強制できるようにする。

## 実施内容

### 1. 実装方式の検討

既製ルールにこの規約に相当するものは無い（Biome の `noNestedTernary` は入れ子のみ、
ESLint の `no-ternary` は文字列の三項まで全部落ちる）。以下を比較し **ESLint のローカル自作ルール**を採用した。

- Biome 2 の GritQL プラグイン → JSX ノードのマッチングが実験的で診断メッセージの表現も限られるため不採用。
- ESLint のローカル自作ルール → 既に導入済み・flat config 済みで**追加依存ゼロ**。採用。

`AskUserQuestion` で検出範囲と既存コードの扱いを確認し、
「JSX を含む三項すべて（最も厳格）」「error + 既存 8 箇所も修正」を選択してもらった。

### 2. ルールの追加

**`eslint-rules/no-conditional-jsx.mjs`（新規）**

`ConditionalExpression` を訪問し、consequent / alternate のどちらかが `JSXElement` / `JSXFragment` なら報告する。

- `cond ? <A/> : <B/>` も `cond ? <A/> : null` も、JSX 属性値の中の三項も対象。
- 文字列・クラス名・関数・`undefined` だけを出しわける三項は対象外。
- ESTree は括弧のノードを作らないため `cond ? (<Text />) : null` もそのまま当たる。
- `fixable` は付けていない（安全な自動修正が一意に決まらないため。`--fix` では直らない）。

**`eslint.config.mjs`**

先頭コメントを実態（Next 固有ルール + プロジェクト独自ルール）に更新し、
末尾にインラインの `local` プラグインとして `**/*.{jsx,tsx}` に `local/no-conditional-jsx: "error"` を適用するブロックを追加。
`package.json` の `lint` / `lint:fix` は `eslint .` が拾うため変更不要。

### 3. 既存の該当 8 箇所を書き換え

ルール導入直後に**期待どおり 8 件**が検出されたので、すべて対応した。

| ファイル | 対応 |
| --- | --- |
| `components/PageHeading.tsx:42,47` | `{period ? … : null}` / `{lead ? … : null}` → `&&` |
| `commons/GlassCard.tsx:62` | `{hoverEffects ? <>…</> : null}` → `&&` |
| `components/FormField.tsx:44` | `{error ? … : null}` → `&&` |
| `components/ContactForm.tsx:131` | `{siteKey ? <Script/> : null}` → `&&` |
| `components/ContactForm.tsx:238` | `{status === "error" ? <span/> : null}` → `&&` |
| `components/FormField.tsx:33` | 「// 任意」「// 必須」の `<Text>` 2 本を 1 本に統合し、`tone={optional ? "muted" : "accent"}` と本文の**文字列三項**に |
| `components/ContactForm.tsx:225` | Turnstile ウィジェット／未設定注記の 2 分岐を `return` 前の変数 `turnstileArea` へ切り出し、JSX 側は `{turnstileArea}` のみに |

`GlassCard` の `onClick` / `onMouseEnter` / `onMouseMove` / `gridColumn` / className の三項、
`ContactForm` の `aria-invalid` などの文字列・関数の三項は対象外なので変更していない。

### 4. ドキュメント更新

- **`CLAUDE.md:52`** — 「ESLint = Core Web Vitals ルールのみ」→「Core Web Vitals ルール + プロジェクト独自ルール」。
  続けて `eslint-rules/` の置き場・適用範囲・ルールの判定基準・許容される三項の例・自動修正なしを段落で追記（L54-60）。
- **`README.md:14`** — 技術スタック表の Lint / Format を「ESLint（Next core-web-vitals + 独自ルール）」に。
- **`README.md:33`** — `make lint` の説明を「Biome + ESLint(Next / 独自ルール)」に。
- **`README.md:161-162`** — ディレクトリ表の `eslint.config.mjs` の説明を更新し、`eslint-rules/` の行を追加。

`README.md` の他の記述（`GlassCard` / `ContactForm` / `FormField` / `PageHeading` の役割説明、
`Text` の variant / tone、`"use client"` の 3 コンポーネント）は今回の変更で不正確にならないため触っていない。

### 5. コードレビュー（`/code-review`）

**実バグ 0 件。** レビュアー側でも `npx eslint . --max-warnings 0` / `npx biome check` / `npx tsc --noEmit` を実行し、
使い捨ての `__ruletest.tsx` でルールの発火を実証（`cond ? <A/> : null` で発火、連鎖三項は両階層とも検出、
文字列三項は素通り）。

指摘は 1 件で、コード不具合ではなく**コミット時の注意**:
`eslint.config.mjs` が `./eslint-rules/no-conditional-jsx.mjs` をトップレベル import している一方
`eslint-rules/` が untracked のため、config の変更だけをコミットするとクローン先・CI・コンテナ内の
`make lint` が `ERR_MODULE_NOT_FOUND` で落ちる。同じコミットに含める必要がある。

レビュアーが誤検知として自ら却下した項目（`&&` の leaked render、`turnstileArea` の先行生成、
`FormField` のトーン統合、新しい ESLint ブロックの `languageOptions` 省略）は、いずれも問題なしと確認済み。

### 変更ファイル

- `eslint-rules/no-conditional-jsx.mjs`（新規）
- `eslint.config.mjs`
- `commons/GlassCard.tsx`
- `components/ContactForm.tsx`
- `components/FormField.tsx`
- `components/PageHeading.tsx`
- `CLAUDE.md`
- `README.md`

## 主な決定事項

- **Biome の GritQL プラグインではなく ESLint のローカル自作ルールを採用**。JSX マッチングの成熟度と、
  追加依存ゼロで既存 flat config に載せられる点を優先した。
  ESLint の役割は「Next 固有ルール専任」から「Next 固有ルール + プロジェクト独自ルール」へ広がった。
- **検出範囲は最も厳格な形**（片側 `null` も属性値の中の JSX も対象）。ユーザーの選択。
- **自動修正は実装しない**。`? … : null` → `&&`、両側要素 → 変数切り出し、と正解が状況で変わるため。
- **`&&` への置換は leaked render を個別に確認して採用**。`hoverEffects` / `status === "error"` は boolean、
  `error` は `string | undefined`、`siteKey` は `?? ""` 済みの string で、`""` は React が描画しない。
  `PageHeading` の `period` / `lead` は型が `ReactNode` だが全呼び出し元が文字列を渡している
  （`0` を渡す呼び出しが将来出たら変数切り出しに変える）。
- **`FormField` の必須／任意ラベルは「文字列の三項」に落とす形で解決**。要素を 2 本持つのをやめ、
  `tone` と本文だけを短い三項で出しわける＝規約が明示的に許容している形。

## 未完了・残タスク

今回のルール追加に関する残タスクはなし。前セッションから継続中のものは以下（このセッションでは未着手）:

- Vercel の環境変数設定（`NEXT_PUBLIC_TURNSTILE_SITE_KEY` はビルド時に埋め込まれるため設定後に再デプロイが必要）
- `/api/contact` のレート制限・自動返信メールは未実装
- `Button` の `href` + `disabled` の組み合わせで `disabled` が無視される（現在該当する呼び出しはない）
- `npm audit` の high 5件
- レスポンシブ対応

## 動作確認の状況

- **ルールの発火確認**: ルール追加直後の `npx eslint .` が**期待どおり 8 件**を検出
  （`GlassCard:62` / `ContactForm:131,225,238` / `FormField:33,44` / `PageHeading:42,47`）。
  書き換え後は `npx eslint . --max-warnings 0` が 0 件でクリーン。
- `npx biome check --write .`: 63 ファイル、1 ファイル整形（`ContactForm` の `status === "error" && …` が 1 行に収まった）。
- `docker compose exec app npm run build`（コンテナ内・型チェック込み）: 成功。
  全ルート `○ (Static)` のまま（`/api/contact` のみ `ƒ (Dynamic)`）。
- `npx playwright test`（ホスト）: **52 件全パス**。
- **ブラウザ実機確認**（Playwright MCP / `http://localhost:3000/contact`）:
  必須ラベルが indigo、任意が slate で従来どおり。Turnstile ウィジェットも表示。
  コンソールのエラーは Cloudflare の iframe 内部由来のみで、こちらのコード起因ではないことを確認。
  確認用スクリーンショットは削除済み。
