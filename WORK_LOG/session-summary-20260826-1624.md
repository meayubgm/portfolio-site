# セッションサマリー: 各ページの背景に正多面体ワイヤーフレームを追加

- 日時: 2026-08-26 16:24
- プロジェクト: portfolio-site（/Users/meayu/development/portfolio-site）

## 目的

Home のヒーローが `h-screen` の中にテキストだけを置いた構成で右側が丸ごと空いており、
「余白が多くて物足りない」印象だった。`docs/hero-geometry-implementation-memo.md` の方針に沿って
正多面体の線画ワイヤーフレームを各ページに配置し、動きで印象付ける。

## 実施内容

### 0. 調査と計画（Plan モード）

Explore エージェントでヒーロー領域・既存モーション・`globals.css`・e2e の依存セレクタを調査。
`AskUserQuestion` で3点を確定してから着手した。計画は
`/Users/meayu/.claude/plans/home-docs-hero-geometry-implementation-fuzzy-cocoa.md`。

- **動きの種類** → 常時ゆっくり自転（3D 座標を rAF で毎フレーム投影）
- **Home の組み上げ完了** → h1「かたちにする」の打ち終わりに合わせる
- **サブページ** → 右端クロップ・中サイズ

### 1. 図形データ（`lib/polyhedra.ts` 新規）

5種の正多面体の頂点を単位球上に正規化して保持。
**辺はデータで持たず「頂点間の最小距離にあるペア」から導出**する（正多面体では最短距離＝辺）。
30本の辺リストを手で書き下すより取り違えが起きない。

| ページ | 図形 | 頂点 / 辺 | 元素 |
| --- | --- | --- | --- |
| `/` | 正二十面体 | 12 / 30 | 水 |
| `/works` | 正八面体 | 6 / 12 | 空気 |
| `/works/brew` | 正六面体 | 8 / 12 | 土 |
| `/skills` | 正四面体 | 4 / 6 | 火 |
| `/about` | 正十二面体 | 20 / 30 | 宇宙 |

`/contact` には置かない（実装メモの指示どおり）。

### 2. 描画（`commons/Wireframe.tsx` 新規・`"use client"`）

3D ライブラリは入れず、回転行列＋透視投影を自前で計算する。

- **組み上げは CSS、自転は JS** と役割を分けた。触るプロパティ（`opacity` / `stroke-dashoffset` と
  座標属性）が重ならないので競合しない。
- 自転は `requestAnimationFrame` が SVG の属性を直接書き換える（React の再レンダリングは通さない）。
- 手前の頂点ほど大きく・濃く描いて奥行きを出す。

### 3. 配置（`components/HeroGeometry.tsx` 新規）

ページ→図形・傾き・配置・回転速度の対応表（`PLACEMENTS`）だけを持つ薄いラッパー。
ページ側の差し込みは `app/(pages)/page.tsx`（Home）・`components/PageHeader.tsx`（works / skills / about）・
`app/(pages)/works/brew/page.tsx`。

### 4. スケジュール（`lib/home.ts`）

`heroGeometryBuild = { delay: 0, duration: titleEnd }` を export。
既存のタイピングと同じく**文字数から静的に算出**するので、文言を変えれば尺も追従する。

### 5. ユーザーフィードバックによる作り直し

| 回 | 指摘 | 対応 |
| --- | --- | --- |
| 1 | 図形が最初から出来上がって見える／Home を1.5倍に／背景に固定したい | 起点の同期・拡大・`fixed inset-0` 化 |
| 2 | まだ最初から出来上がって見える | `vector-effect` が線引きを無効化していた（後述） |
| 3 | 図形の周りの薄い点は何か。非表示にしたい | グレイン（`GRAIN`）を削除 |

### 6. 発見した実バグと修正

実装・レビューを通じて見つけたもの。いずれも計測・再現で確認してから直した。

1. **WebKit での hydration mismatch** — `Math.cos` / `Math.sin` が Node と WebKit で最下位ビット単位で
   食い違い、SSR の属性値と一致せず React がエラーを出していた（Next の dev エラーオーバーレイが出て、
   `page.locator("nav")` を使う既存 e2e が strict mode 違反で落ちる）。投影結果を小数4桁に丸めて解消。
2. **横スクロールが 7px 出る** — `w-screen`(100vw) がスクロールバー幅を含むため。
   → 後に `fixed inset-0` へ変更したことで枠がビューポートと同じ大きさになり、問題ごと消滅。
3. **組み上げとタイピングの起点がずれる** — CSS アニメーションは初回ペイント（384ms）から、
   タイピングは hydration 後（862ms）から始まり、**実測 478ms 先行**していた。
   マウントまで `animation-play-state: paused` にして起点を揃えた。
4. **完成形が最初の 250ms ちらつく** — CSS が届く前は SSR された SVG が素の姿＝完成形で描かれていた。
   「伏せた姿」を presentation attribute（`stroke-dashoffset="1"` / `opacity="0"`）側に置き、
   `animation-fill-mode` を `both` にして解決。
5. **`vector-effect="non-scaling-stroke"` が線引きを殺していた（最重要）** — これを付けると
   `stroke-dasharray` / `stroke-dashoffset` の単位まで画面ピクセルになり、`pathLength="1"` の
   正規化が無視される。`stroke-dasharray="1"` が「1px 刻みの点線」に化け、**線を引く演出が
   一度も効いていなかった**（mount+150ms で図形が完成していた）。
   `non-scaling-stroke` をやめ、ResizeObserver で SVG の実サイズを測って `stroke-width` を
   user unit で逆算する方式に変更。実測 1.00px のヘアラインを維持。
6. **モバイルで見えない図形の rAF が回り続ける**（`/code-review` 指摘）— `hidden md:block` は
   CSS で隠すだけなので、`display:none` の裏で 30fps の投影計算が全ページ・滞在中ずっと走っていた。
   実幅 0 のあいだ自転を止めるようにした。
7. **`prefers-reduced-motion` の変更を購読していない**（`/code-review` 指摘）— 閲覧中に設定を
   変えても自転が止まらず、CSS 側（組み上げ）と挙動が食い違っていた。`matchMedia` の `change` を購読。

### 7. 変更ファイル

| ファイル | 内容 |
| --- | --- |
| `lib/polyhedra.ts` | 新規。正多面体5種の頂点データと辺の導出 |
| `commons/Wireframe.tsx` | 新規。SVG 描画・自転・組み上げ・線幅の逆算 |
| `components/HeroGeometry.tsx` | 新規。ページ→図形・配置の対応表と固定枠 |
| `lib/home.ts` | `heroGeometryBuild` を追加 |
| `app/globals.css` | `--animate-wf-*` と `@keyframes`、アニメーション無効時の巻き戻し |
| `app/(pages)/page.tsx` | Home へ `HeroGeometry` を差し込み |
| `components/PageHeader.tsx` | `geometry` prop を追加 |
| `app/(pages)/works/page.tsx` / `skills/page.tsx` / `about/page.tsx` | `geometry` を渡す |
| `app/(pages)/works/brew/page.tsx` | 自前 header へ直接差し込み |
| `e2e/geometry.spec.ts` | 新規。12テスト |
| `e2e/motion.spec.ts` | `scrollUntilHidden`（hydration レース対策）を追加 |
| `CLAUDE.md` / `README.md` | 「背景の正多面体」節の追加ほか |

### 8. ドキュメント更新

- `CLAUDE.md`
  - `commons/` 18種 → **19種**、`components/` 7種 → **8種**、`"use client"` 5つ → **6つ**
  - `lib/polyhedra.ts` の説明を追加
  - **「背景の正多面体」節を新設**。`fixed inset-0` の意図、CSS と JS の役割分担、
    `paused` で起点を揃える理由、presentation attribute に伏せた姿を置く理由、
    `pathLength` と `non-scaling-stroke` の罠、投影の丸めと hydration mismatch、
    `hidden` だけでは rAF が止まらない点、依存に幅そのものを入れてはいけない理由を記載
  - 「E2E テスト」節に、hydration レースと `test.use({ reducedMotion })` が効かない件を追記
- `README.md`
  - ディレクトリ構成図に `Wireframe.tsx` / `HeroGeometry.tsx` / `lib/polyhedra.ts` を追加
  - 「Client / Server の切り分け」を6ファイルに更新
  - **「背景の正多面体」節を新設**
  - （wrap-up 時の整合性チェックで）e2e spec の一覧に `geometry` を追加、
    `HeroGeometry.tsx` の説明を「ヒーロー背後の」→「背景に固定する」へ修正

## 主な決定事項

- **3D ライブラリは入れない**。頂点最大 20・辺最大 30 なので、回転行列＋透視投影を自前で書けば足りる。
  既存の「アニメーションライブラリを入れない」方針とも揃う。
- **辺は最小距離から導出する**。正多面体では最短の頂点間距離が辺と一致し、2番目に短い距離は
  1.41〜1.62 倍あるのでしきい値 1.05 で誤検出しない。手打ちのリストより安全。
- **枠は `fixed inset-0`**。スクロールしても図形が動かず、フロスト面のカードの裏に透けて見える。
  副次的に `w-screen` 由来の横スクロール問題も消え、各ヘッダーの `relative` も不要になった。
- **`vector-effect: non-scaling-stroke` は使わない**。ヘアラインには手軽だが線引きを殺す。
  ResizeObserver で実サイズを測って線幅を逆算する。
- **組み上げの「伏せた姿」は presentation attribute で持つ**。インライン style に置くと
  `@media (prefers-reduced-motion: reduce)` / `(scripting: none)` の巻き戻しが効かなくなる。
- **描き直しは 30fps に間引く**。1ページ単体では 60fps を維持できていた（p95 17.6ms、20ms 超 0）が、
  ゆっくりした回転なので見た目は変わらず描画回数を半分にできる。
- **グレイン（テクスチャの点）は載せない**。実装メモには記載があったが、ユーザー判断で削除。

## 未完了・残タスク

今回の図形追加に関する残タスクはなし。前セッションから継続中のものは以下（このセッションでは未着手）:

- Vercel の環境変数設定（`NEXT_PUBLIC_TURNSTILE_SITE_KEY` はビルド時に埋め込まれるため設定後に再デプロイが必要）
- `/api/contact` のレート制限・自動返信メールは未実装
- `Button` の `href` + `disabled` の組み合わせで `disabled` が無視される（現在該当する呼び出しはない）
- `npm audit` の high 5件
- レスポンシブ対応（図形は md 未満で非表示にしているが、サイト全体の対応は未着手）
- 実装メモの未決事項のうち**ダークモード対応**は今回対象外（サイトに元々ダークモードが無いため）

## 動作確認の状況

- `npx biome check .`: クリーン。
- `npx eslint . --max-warnings 0`: クリーン（`local/no-conditional-jsx` を含む）。
- `npm run build`（コンテナ内）: 成功。型チェック込みで12ページの静的生成を確認。
- `npx playwright test`: **88件すべてパス**（Chromium / WebKit）。
- ブラウザでの実測:

  ```
  組み上げとタイピングの同期（mount からの経過）
    200ms  頂点がぽつぽつ現れ始める
    500ms  頂点から辺が伸び始める（骨組みが組み上がる）
   1100ms  ほぼ完成、残りの辺が伸びている / h1 は「たちに」
   1350ms  完成 ＝「かたちにする」の打ち終わり

  線幅        Home(990px) / skills(400px) とも実測 1.00px
  フレーム    median 16.7ms / p95 17.6ms / 20ms 超 0（60fps 維持）
  固定表示    scrollY 800 で svgTop 不変、カードの裏に透けることを目視確認
  横スクロール 全ページ 0
  reduced-motion  回転中 → 停止 → 再開（閲覧中の切り替えに追従）
  JS 無効     5ページとも図形が表示、/contact は 0
  ```

- **バグ修正はいずれも再現を作ってから直し、修正後に再測した**。
  - `vector-effect` の件は mount+150ms のスクリーンショットで「完成済み」を目視確認してから修正し、
    修正後に 500ms 時点で「頂点から線が伸びている」ことを確認。
  - モバイルの rAF 停止は、**修正を一時的に戻すと新規テストが両ブラウザで落ちる**ことを確認した
    （テストが退行を実際に捕まえられることの確認）。
- `/code-review` の指摘3件はすべて検証し、実バグと判断して修正した（誤検知はゼロ）。
- e2e のパラレル実行時に散発的に落ちる件は、**変更前の状態でも同様に落ちる**ことを確認したため
  元からある dev サーバー由来の flakiness と判断（`--workers=1` なら安定）。
- `@theme` 編集後に dev サーバーが古い CSS を配る既知の問題を踏んだため、
  `.next` を消して再起動する手順で解消した（`CLAUDE.md` に記載済みの手順）。
