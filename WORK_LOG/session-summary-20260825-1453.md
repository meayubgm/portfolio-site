# セッションサマリー: サイトへのモーション追加（ナビの出し入れ・ヒーローのタイピング・カードの浮き上がり）

- 日時: 2026-08-25 14:53
- プロジェクト: portfolio-site（/Users/meayu/development/portfolio-site）

## 目的

ホバー時の `transition-*` 以外にモーションが無く静的だったサイトに、以下3つの動きを追加する。

1. SiteNav を、下スクロールで引っ込め・上スクロールで戻す
2. Home ヒーローの4テキスト（eyebrow / h1 / mono行 / リード文）を左からタイピング表示する
3. カードをスクロール到達時にふわっと浮き上げ、一度表示したら消さない

## 実施内容

### 0. 調査と計画（Plan モード）

Explore エージェントで `SiteNav` / Home / `commons` / `globals.css` / e2e / 依存を調査し、
`AskUserQuestion` で3点を確定してから着手した。計画は `/Users/meayu/.claude/plans/sitenav-wise-giraffe.md`。

- **実装手段** → アニメーションライブラリは入れず自前実装（IntersectionObserver + CSS transition）
- **タイピングの進み方** → eyebrow の打ち終わりを待たず少し後から h1 を開始、両方終わったら mono行と本文を同時開始（本文は速め）
- **scroll reveal の範囲** → 当初は Home のみ（後述のとおりセッション後半で works / skills / about へ拡大）

### 1. SiteNav の出し入れ（`components/SiteNav.tsx`）

`scroll` を購読し、下スクロールで `-translate-y-full`、上スクロールで復帰。
8px 未満の差分は無視（トラックパッドの微振動対策）、`scrollY` 80px 以内では隠さない。
`transition-transform duration-300 ease-out motion-reduce:transition-none`。

### 2. ヒーローのタイピング（新規 `commons/Typewriter.tsx` + `lib/home.ts`）

- 文言を `lib/home.ts` の `heroCopy` に移し、遅延・速度（`heroTyping`）を**文字数から静的に算出**。
  実行時のコールバック連鎖を持たないため、文言を変えればスケジュールも自動で追従する。
- 表示は **完成テキストを `opacity-0` で敷き、打ち込み中を `aria-hidden` でグリッド重ね**する2枚構成。
  これで (1) 行数が増えても高さが動かない (2) SSG の HTML とアクセシビリティツリーに完成テキストが載る。
  打ち終わったら重ねを解いて素の1枚に戻す。
- `app/globals.css` に `@media (scripting: none)` の保険を追加。

### 3. カードの浮き上がり（`commons/GlassCard.tsx` + `lib/useRiseIn.ts`）

`reveal` prop（既定 OFF）を追加し、`IntersectionObserver`（`rootMargin: "0px 0px -12% 0px"`）で
初回の交差を拾ったら `disconnect()`。一度出たら上に戻しても消えない。

浮き上がりの表現は**ユーザーのフィードバックで2回作り直した**。

| 版 | 内容 | 結果 |
| --- | --- | --- |
| 1 | `transition` で `opacity` + `translate-y-6` を 350ms | 「浮き上がって見えない」 |
| 2 | `@theme` の `--animate-rise-in` キーフレーム（先に姿を見せてから 32px 上へ、900ms） | 「大きく動きすぎて不自然」 |
| 3（採用） | `opacity-0 translate-y-4` → `opacity-100 translate-y-0` を `transition-[translate,opacity] duration-500 ease-out`（16px / 0.5秒、フェードと移動は同時） | 採用 |

- 3版目で `@keyframes rise-in` / `--animate-rise-in` は `globals.css` から削除した。
- 当て方は `lib/useRiseIn.ts`（新規フック）に集約し、`GlassCard` と `RiseIn` で共用。
- 終了判定は `transitionend`（`propertyName === "translate"`）でクラスを外す。
- `GlassCard` の transition 対象を `transform` → **`translate`** に修正（Tailwind v4 の
  `translate-y-*` は `transform` ではなく `translate` プロパティを使うため、それまで
  `hover:-translate-y-0.5` の浮き上がりに transition が効いていなかった）。
- **カードごとの時間差（`revealDelay`）は一度実装したが、ユーザー指示で撤廃**した。

### 4. ヒーローのボタン列（新規 `commons/RiseIn.tsx`）

スクロールではなく時間で始める版。`lib/home.ts` の `heroActionsDelay`（打ち終わり + 150ms ≒ 3.9秒）を渡す。

### 5. scroll reveal を一覧系ページへ拡大

`/works`（9枚）・`/skills`（3枚）・`/about`（13枚）の `GlassCard` に `reveal` を追加。
`/works/brew` はそもそも `GlassCard` を使っていないページで変更不要、
`/contact` のフォームカードは対象外（即表示のまま）。

### 6. `/code-review` の指摘反映

指摘7件を検証し、**実バグ5件を修正**、2件は根拠つきで見送りを報告した。

修正:

1. **`reveal` カードに `data-rise-in` が無い**（HIGH）— `@media (scripting: none)` の保険が
   `RiseIn` にしか効いておらず、JS 無効時に全カードが不可視になる。`GlassCard` の root に
   `data-rise-in={reveal || undefined}` を追加。
2. **表示前のカードをホバーすると reveal が打ち切られる**（MEDIUM）— `hover:-translate-y-0.5` も
   `translate` の `transitionend` を飛ばすため `finished` が立っていた。`useRiseIn` の判定に `started` を追加。
3. **`charCount` と `Typewriter` で改行の数え方が違う**（LOW）— `join("")` → `join("\n")` に統一。
4. **タイピング完了待ちが既定 5 秒タイムアウトに近い**（LOW）— `timeout: 15_000` を明示。
5. **隠れたナビのリンクがフォーカス可能なまま**（LOW）— `onFocus` でナビを出し直す。
   `inert` はキーボードから到達できなくなるため採らなかった。

見送り:

- **「ヒーローが JS 実行まで不可視」** — 仕様どおり。代案の「初期表示は見せて JS で隠す」は
  完成テキストが一瞬フラッシュするため採用しない。
- **「featured カードが画面外にある前提」** — false positive。Home のヘッダーは `h-screen` なので
  ビューポート高さに関わらずカードの上端は常に 100vh 以降にあり、`rootMargin -12%` の判定に届かない。

副作用として `data-rise-in` がカードにも付き `e2e/motion.spec.ts` のボタン列セレクタが
strict mode 違反になったため、`header [data-rise-in]` に絞った（失敗を確認してから修正）。

### 7. 変更ファイル

| ファイル | 内容 |
| --- | --- |
| `components/SiteNav.tsx` | スクロール連動の出し入れ、`onFocus` での復帰 |
| `commons/Typewriter.tsx` | 新規。2枚重ねのタイピング表示 |
| `commons/RiseIn.tsx` | 新規。時間指定で浮き上がるブロック |
| `lib/home.ts` | 新規。ヒーローの文言とタイピング・スケジュール |
| `lib/useRiseIn.ts` | 新規。浮き上がり表示を当てるフック |
| `commons/GlassCard.tsx` | `reveal` prop、IntersectionObserver、transition 対象を `translate` へ |
| `app/(pages)/page.tsx` | `Typewriter` / `RiseIn` への差し替え、カードへの `reveal` |
| `app/(pages)/works/page.tsx` / `skills/page.tsx` / `about/page.tsx` | カードへの `reveal` |
| `app/globals.css` | `@media (scripting: none)` の保険 |
| `e2e/motion.spec.ts` | 新規。5テスト（ナビ2 / カード1 / ボタン列1 / タイピング1） |
| `CLAUDE.md` / `README.md` | モーション節の追加ほか |

### 8. ドキュメント更新

- `CLAUDE.md`
  - `"use client"` を3つ → **4つ**（`Typewriter` 追加）、`commons/` 16種 → **18種**（`Typewriter` / `RiseIn`）
  - `lib/home.ts` / `lib/useRiseIn.ts` の説明を追加
  - **「モーション」節を新設**。ライブラリ非採用の方針、`prefers-reduced-motion` 対応、
    キーフレーム版を採らなかった理由、`transitionend` を `started` で弾く理由、
    `data-rise-in` の役割と e2e での絞り込み、`GlassCard` にラッパー div を被せてはいけない理由を記載
  - `GlassCard` の `reveal` の対象ページを明記
- `README.md`
  - ディレクトリ構成図に `RiseIn.tsx` / `Typewriter.tsx` / `lib/home.ts` / `lib/useRiseIn.ts` を追加、
    `GlassCard` / `SiteNav` / `e2e` の説明を更新
  - 「Client / Server の切り分け」に `Typewriter` / `RiseIn` を追加
  - **「モーション」節を新設**（SiteNav / ヒーロー / 浮き上がり / カード / ボタン列 / JS 無効時の保険）

## 主な決定事項

- **アニメーションライブラリは入れない**。CSS transition + IntersectionObserver + 小さな client
  コンポーネントで足りる範囲であり、バンドルと client 境界を増やさずに済むため。
- **タイピングは完成テキストを敷いて重ねる**。ページ側に文字分割を持ち込まないので
  レイアウトシフトが起きず、SSG の HTML・アクセシビリティツリー・既存 e2e の
  `toContainText` がすべて無傷で通る。
- **浮き上がりはキーフレームではなく transition**。「先に姿を見せてから動かす」演出は
  動きが大きく不自然という判断で不採用。フェードと移動を同時に 0.5 秒・16px に落ち着けた。
- **浮き上がりのクラスは終わったら外す**。付けっぱなしだと `duration-500` がホバーの
  浮き上がりにも効き続けるため。
- **カードごとの時間差は付けない**。隣り合うカードが同時に出るほうが自然というユーザー判断。
- **`GlassCard` にラッパー div を被せない**。`e2e/navigation.spec.ts` が
  `page.locator("div.group")` で GlassCard のルートを直接掴んでいるため、
  reveal は prop として GlassCard 自身に持たせた。
- **タイピングのスケジュールは静的に算出する**。文言が静的なので、context によるランタイム
  オーケストレーションより文字数計算のほうが状態が減り、追従漏れも起きない。

## 未完了・残タスク

今回のモーション追加に関する残タスクはなし。前セッションから継続中のものは以下（このセッションでは未着手）:

- Vercel の環境変数設定（`NEXT_PUBLIC_TURNSTILE_SITE_KEY` はビルド時に埋め込まれるため設定後に再デプロイが必要）
- `/api/contact` のレート制限・自動返信メールは未実装
- `Button` の `href` + `disabled` の組み合わせで `disabled` が無視される（現在該当する呼び出しはない）
- `npm audit` の high 5件
- レスポンシブ対応
- （任意）`LabeledField` のような狭いカラムでの `text-justify` の見え方

## 動作確認の状況

- `npx biome check .`: クリーン。
- `npx eslint . --max-warnings 0`: クリーン（`local/no-conditional-jsx` を含む）。
- `npm run build`: 成功。TypeScript 型チェック込みで12ページの静的生成を確認。
- `npx playwright test`: **62件すべてパス**（既存52件 + `motion.spec.ts` 5件 × Chromium / WebKit）。
- ブラウザでの実測（Playwright スクリプトで `getComputedStyle` を直接読んだ）:

  ```
  ボタン列  t=3900  op 0.00 / translate 16px        ← 待機中
           t=4100  op 0.69 / translate 5.0px       ← フェードと移動が同時
           t=4700  op 1.00 / translate none, dur 0s ← クラス除去済み
  カード    +150ms  op 0.60 / translate 6.4px
           +750ms  op 1.00 / translate 0px, dur 0.35s
  ホバー            translate -2px, dur 0.35s        ← 元の速度に復帰
  リード文  打ち込み中も高さ 132px で不変（レイアウトシフト無し）
  reduced motion    ボタン・カードとも op 1.00 / 即時表示
  ```

- 指摘2（表示前のホバーで reveal が打ち切られる）は再現条件を作って修正前後を実測。
  修正後は `ホバー+720ms op=0.00 translate=-2px`（伏せたまま維持）。
- 指摘7（隠れたナビのフォーカス）はスクロールで隠した状態から `skills` リンクに
  `focus()` して `hidden=false` に戻ることを確認。
- ビルド出力の HTML を検査し、完成テキストが含まれること（SEO 退行なし）と
  `data-rise-in` の数（index 6 / works 9 / about 13 / skills 3 / brew 0）を確認。
- `/works` `/skills` `/about` の全カードが「初期 op 0.00・translate 16px → 表示後 op 1.00・translate 0」に
  なること、`/works/brew` に `GlassCard` が無いこと、`/contact` のカードが `op 1.00` で即表示であることを実測。
- `@theme` を編集したため dev サーバーの CSS キャッシュを疑い、ブラウザ上で
  新しいユーティリティが実際に生成されていることを確認した（`docker compose exec` は権限で
  実行できなかったため、生成 CSS を直接検査する方法で代替）。
