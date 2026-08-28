# セッションサマリー: .design-sync の設定を実態に合わせ、Claude Design へ再同期する

- 日時: 2026-08-29 01:00
- プロジェクト: portfolio-site（/Users/meayu/development/portfolio-site）

## 目的

前セッションの残タスクだった「`.design-sync/config.json` の `componentSrcMap` が古い
（`Button` などを `components/` として参照しているが実際は `commons/`）」を解消する。
その後、修正した設定で Claude Design の `Frost & Blueprint Design System` へ再同期する。

## 実施内容

### 1. ディレクトリ構成のずれの修正（3ファイル）

DS プリミティブ10件が `commons/` にあるのに、design-sync の入力3つが `components/` を
指したままだった。依頼は `config.json` のみだったので、まず1件を直し、残り2つは
「同じ原因で、直さないと再同期が実際に失敗・劣化する」ものとして報告のうえ承認を得て修正した。

| ファイル | 内容 |
| --- | --- |
| `.design-sync/config.json` | `componentSrcMap` の10件を `components/` → `commons/`。`PageHeading` / `SiteNav` / `SkillBar` の3件は実際に `components/` なので据え置き |
| `.design-sync/entry.ts` | 同じ10件の re-export 元を `../components/` → `../commons/`。これが直っていないと esbuild が解決できずビルドが落ちる |
| `.design-sync/compile-css.mjs` | `@source "./commons";` を追加。冒頭コメントの走査対象も更新 |

`compile-css.mjs` の欠落は**ビルドも検証も通るのに CSS だけが欠ける**出方をする。
再生成して確認したところ、35,169 → 54,313 バイト、クラスセレクタ 237 → 432 に増えた。
増えた195件は `commons/` 側にしか出てこないもの（`GlassCard` の `lg:col-span-1`〜`6`、
`Button` の `disabled:hover:translate-y-0` など）だった。

差分で消えた25セレクタ（`text-[13px]` / `leading-[1.6]` / `rounded-btn` / `pb-section` 等）は
現在のソースに1件も残っておらず、7月以降の「arbitrary value を廃して標準スケールに寄せる」
リファクタリングが反映されただけであることを grep で確認した。

### 2. design-sync スキルの所在についての誤り

`/design-sync` が読み込まれなかったため「スキルが入っていない」と報告したが**誤りだった**。
実体は Claude Code 本体に同梱されており、`DesignSync` ツールが claude.ai アカウントの
design-system 認可を必要としていただけだった。ユーザーが `/design-login` を実行して解決。

### 3. 再同期

`.design-sync/config.json` に `projectId` と `pkg` が揃っているため再同期扱い、
`projectId` が実行前から固定されているため**アトミックパス**（全件検証後に一括アップロード）。

1. スキル base から `.ds-sync/` へスクリプトを再ステージ（7月版には `resync.mjs` が無かった）
2. `resync.mjs --remote` でアンカー（`_ds_sync.json`）と突き合わせて差分を算出
3. 検証は 12件が verified-by-upload でスキップ、`LabeledField` 1件のみ再採点（2セルとも `good`）
4. レンダーチェック 13/13 成功、`bad` 0 / `thin` 0 / floor card 0

### 4. グループ分割（副作用）

`commons/` への修正の副作用で、グループが1つ（`general`）から2つに分かれた。
グループ名はソースのディレクトリ名から決まり、`components/` のような汎用名は除外されて
`general` に落ちる仕組みだった。ユーザー判断で**この2分割で確定**。

- `commons`（10件）… Button / CardGrid / CardLabel / EyebrowLabel / GlassCard /
  LabeledField / LinkRow / MonoHeading / StatBlock / Tag
- `general`（3件）… PageHeading / SiteNav / SkillBar

### 5. conventions.md のドリフト修正

`.design-sync/conventions.md` はデザインエージェントのシステムプロンプトに入るため、
実ビルドと突き合わせる検証を実施し、2件のずれを検出。ユーザー承認のうえ修正した。

- 27行目 `rounded-btn` / `rounded-tag` … **現ビルドに存在しない**。7月以降のリファクタリング由来の
  既存ドリフトで、今回の変更とは無関係。実際は `--radius-card` だけが残り、Button と Tag は
  標準の `rounded-lg` を使う
- 44-45行目 `components/general/<Name>/` … 13件中10件で不正確になるため `<group>` 表記へ

### 6. guidelines の除外

`guidelinesGlob` の既定（`docs/*.md` ほか）がリポジトリの `docs/`（CLAUDE.md でローカル資料と
されている場所）を拾い、作業メモ3件が新たにアップロードされるところだった。中身は読まずに
ユーザーへ提示し、`guidelinesGlob: []` を設定。結果として `index.md` も生成されなくなり
（guidelines が0件だと作られない仕様）、リモートの `guidelines/` は2件とも削除になった。

### 7. アップロード

書き込み73ファイル・削除42ファイル。順序は仕様どおり
センチネル → 本体 → 削除 → センチネル再武装 → `_ds_sync.json` 最後。

- 削除42 = 旧 `components/general/` の10コンポーネント分40 + `guidelines/` 2
- `ui_kits/portfolio/**`・`uploads/**`・`readme.md`（小文字）・`_ds_manifest.json` は
  削除対象から外し、`list_files` で残存を確認

### 8. NOTES.md の更新

`.design-sync/NOTES.md` に今回の経緯と次回への注意を追記した。

- 2026-08-29 の再同期ヘッダー（件数・削除内訳・検証スコープ）
- グループが `commons` / `general` の2つになったこと、1つに統一する場合の手段
- `guidelinesGlob` を空配列に固定した理由
- **`componentSrcMap` / `entry.ts` / `compile-css.mjs` の3箇所はディレクトリ構成に連動する**
- `conventions.md` はコードの変化から静かにずれるので毎回突き合わせること
- `DesignSync` は `/design-login` の認可が要ること
- `entry.ts` の再 export 数を 9 → 13 に修正（古い記述だった）

### 9. README・CLAUDE.md の整合性チェックと更新

`commons/` 21種・`components/` 8種の記述は現状と一致しており、更新は不要だった。
一方で `.design-sync/` の追跡対象の説明が両ファイルとも実態より短く、`git ls-files` で
確認したところ **8つ**（`config.json` / `entry.ts` / `sync-tsconfig.json` / `compile-css.mjs` /
`conventions.md` / `NOTES.md` / `stubs/` / `previews/`）あるのに
「config / entry / stubs / previews」の4つしか挙げていなかった。今回この記述漏れも修正した。

| ファイル | 内容 |
| --- | --- |
| `README.md`（120行目） | ディレクトリ構成の `.design-sync/` の注記を8つすべてに |
| `CLAUDE.md`（「触らない領域」） | 同じく8つを列挙し、各ファイルの役割を併記。gitignore 側に `.design-sync/.cache/` を追加。あわせて**`componentSrcMap` / `entry.ts` / `compile-css.mjs` の `@source` がディレクトリ構成に連動する**という、今回踏んだ落とし穴を明記 |

`conventions.md` については「デザインエージェントのシステムプロンプトに入る」ことを
CLAUDE.md に書き添えた。うかつに編集すると影響範囲が見えにくいファイルのため。

## 主な決定事項

- **グループは `commons`（10）/ `general`（3）の2分割で確定。** リポジトリの依存の向き
  （`commons/` ← `components/`）がそのままデザインペインに出る形を採った。1つに統一するには
  13件分の `docsMap` フロントマター stub が必要で、コンポーネントを足すたびに stub も要る。
- **`guidelinesGlob` は空配列に固定。** リポジトリの `docs/` はローカル作業メモなので送らない。
  ガイドラインを載せる場合は、送ってよい文書だけを明示的に glob で指す。
- **依頼スコープ外の修正は都度承認を取ってから実施した。** `entry.ts` / `compile-css.mjs` の修正、
  `conventions.md` のドリフト修正、`guidelines` の除外はいずれも提案 → 承認 → 実施の順で進めた。

## 未完了・残タスク

- **CSP**（前セッションからの継続）— Turnstile・Google Fonts・Next のインラインスタイルを
  許可したうえで導入する
- `/api/contact` の自動返信メールは未実装
- 独自ドメインの取得（Resend のドメイン検証が可能になり `CONTACT_TO_EMAIL` の宛先制限が外れる）
- `commons/` は21種あるが同期対象は13種のまま。`BackLink` / `BulletList` / `HoverCue` /
  `LearnMoreCue` / `TagList` / `Text` は DS プリミティブとして追加候補（previews の作成が要る）

## 動作確認の状況

- `package-build.mjs` … 13 components (13 src-matched)、previews 13件すべてコンパイル成功
- `package-validate.mjs` … `✓ bundle is complete`、レンダーチェック 13/13 成功
- 警告は `[FONT_REMOTE]`（4ファミリ）と `tokens: 3 missing, below threshold` の2件のみで、
  どちらも NOTES.md の「Known render warns」に登録済み。新規の警告なし
- コンタクトシート（`_screenshots/contact-sheet-1.png`）を目視。13枚すべてに ✓ が付き、
  `GlassCard` のカード表現・`Button` の variant・`Tag` のピル・`SkillBar` のバー・
  `PageHeading` の日本語見出しの文節改行まで正しく描画されることを確認
- `LabeledField` のスクリーンショットを目視して2セルとも `good` と採点
- `resync.mjs` の判定 … `ok: true` / `anchor: ok` / `learningsUnmerged: []` / `pendingGrade: []`
- `conventions.md` が名指しするユーティリティ・トークン・コンポーネント名13件をビルド成果物と
  突き合わせ（`rounded-btn` / `rounded-tag` の2件のみ NG、修正後は全件一致）
- アップロード後に `list_files` を実行し、`components/commons/` 10件・`components/general/` 3件・
  旧 `components/general/` の残骸なし・`guidelines/` 削除済み・ユーザーの制作物が残存することを確認
- ローカルレビュー用サーバー（`http-serve.mjs`）は停止済み、ポート 50556 の解放も確認
- `.design-sync/` の追跡対象は `git ls-files .design-sync/` と `.gitignore` の両方から確認し、
  README.md / CLAUDE.md の記述と一致することを確認（8つ）
