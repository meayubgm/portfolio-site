# Frost & Blueprint — 使い方の規約

フロントエンドエンジニア A.Y のポートフォリオ由来の DS。ライトで透明感のある
「フロスト（磨りガラス）＋ブループリント（設計図の格子）」の世界観。トーンは
プロフェッショナル／技術寄り、日本語主体のバイリンガル、**絵文字は使わない**。

## セットアップ / ラッパー

- **プロバイダは不要**。各コンポーネントは自己完結で、そのままレンダーできる。
- 元は Next.js アプリだが、`next/link`・`next/navigation` はビルド時にスタブへ
  差し替え済み。`GlassCard`（`href`）と `Button`（`href`）と `LinkRow` は
  **素の `<a>` として描画**される。ルーティング前提のコードは書かなくてよい。
- 見た目は `styles.css`（Tailwind をコンパイルした静的 CSS）が供給する。フォント
  （Space Grotesk / Inter / JetBrains Mono / IBM Plex Sans JP）は remote @import で
  ランタイム読込。追加設定は不要。

## スタイリングの流儀（重要）

これは **Tailwind v4 のユーティリティクラス方式**の DS。各コンポーネントは
クラスを内蔵しているので、**利用側は props を渡すだけ**でよい。DS 固有トークンが
生成するユーティリティ:

| ユーティリティ | 用途 |
| --- | --- |
| `font-display` / `font-body` / `font-mono` | 見出し / 本文・UI / モノ・ラベル |
| `rounded-card` / `rounded-btn` / `rounded-tag` | カード / ボタン / タグの角丸 |
| `shadow-card-hover` | カードのホバー影 |

色は Tailwind 組み込みパレットに準拠する（custom 色トークンは無い）:
`text-slate-900`＝主要文字、`text-slate-600` / `text-slate-500`＝弱い文字、
`text-sky-700`＝アクセント（ロゴの Y・リンク hover・SkillBar 端）、
`text-indigo-600`＝ラベル・ドット、`border-sky-700/15`＝ガラスの淡い境界、
`bg-slate-50`＝面の背景。

**注意**: 配布する `styles.css` には上記コンポーネントが使う分の
ユーティリティしか含まれない（デザインペインに Tailwind ランタイムは無い）。
利用側で新しいユーティリティクラスを増やしても解決されないので、独自レイアウトの
微調整は**インラインスタイル**か既存ユーティリティの範囲で行うこと。

## 真実のある場所

- `styles.css` … トークン・フォント・`_ds_bundle.css`（コンポーネント CSS）を束ねる入口。
- `components/general/<Name>/<Name>.prompt.md` … 各コンポーネントの使い方。
- `components/general/<Name>/<Name>.d.ts` … props の型契約。

## コンポーネント一覧

`GlassCard`（フロストな主面。中に他を組む）, `Button`（primary / ghost, `href` 可）,
`CardLabel`（indigo モノ大文字ラベル）, `EyebrowLabel`（ドット＋モノの見出し前ラベル）,
`Tag`（sky のピル）, `SkillBar`（勾配プログレス）, `StatBlock`（数値＋ラベル）,
`LinkRow`（↗ 付きリンク行）, `SiteNav`（全幅ナビ）。

## 代表的な組み立て例

```tsx
import { GlassCard, CardLabel, Tag } from "portfolio-site";

<GlassCard>
  <CardLabel>Case Study</CardLabel>
  <h3 style={{ margin: "0 0 10px", fontSize: 18, color: "#0f172b" }}>
    コーヒー抽出タイマー
  </h3>
  <p style={{ margin: "0 0 16px", fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
    レシピに沿って抽出をガイドする Web アプリ。
  </p>
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    <Tag>React</Tag>
    <Tag>TypeScript</Tag>
  </div>
</GlassCard>
```

`GlassCard` はフロスト効果（`bg-white/10` + backdrop-blur + 淡い境界）が本体なので、
**`bg-slate-50` などの淡い背景の上**に置くと境界と面が見えて映える。
