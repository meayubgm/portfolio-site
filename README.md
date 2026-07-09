# portfolio-site

**A.Y / frontend** のポートフォリオサイト。Claude Design で作成したプロトタイプ
（Frost & Blueprint デザインシステム）を **Next.js (App Router) + Tailwind CSS v4** で実装したもの。

## 開発

```bash
npm install
npm run dev      # 開発サーバー（http://localhost:3000）
npm run build    # 本番ビルド（型チェック込み）
npm run start    # 本番サーバー
```

## 構成

- `app/` — App Router。`layout.tsx`（共通レイアウト＋ナビ＋アンビエントグロー）、`page.tsx`（Home）、`works/page.tsx`（実績一覧）、`works/brew/page.tsx`（BREW ケーススタディ）。
- `app/globals.css` — Tailwind v4 の `@theme` に Frost & Blueprint のデザイントークンを統合。`bg-navy` `text-indigo` `font-display` `rounded-card` `shadow-card-hover` のようにユーティリティとして使える。
- `components/` — DS コンポーネント8種（Button / Tag / CardLabel / EyebrowLabel / GlassCard / SkillBar / StatBlock / LinkRow）＋ SiteNav。
- `lib/cases.ts` — 匿名化ケーススタディのデータ。

## デザイントークンの扱い

CSS 変数を Tailwind テーマに統合しています（`app/globals.css` の `@theme`）。
命名規則は Tailwind v4 の慣習どおり:

| 変数 | 生成されるユーティリティ |
| --- | --- |
| `--color-navy` | `bg-navy` / `text-navy` / `border-navy` |
| `--font-display` | `font-display` |
| `--radius-card` | `rounded-card` |
| `--shadow-card-hover` | `shadow-card-hover` |

背景のブループリント格子（`--grid-cell` / `--color-indigo-grid`）は `body` に直接適用しています。

## Client / Server の切り分け

- `GlassCard`（マウス追従グロー＋クリック遷移）と `SiteNav`（`usePathname`）は `"use client"`。
- ページ本体・その他のコンポーネントは Server Component。全ページが静的生成（SSG）されます。

## メモ

- 日本語見出しフォントは LINE Seed JP の代替として IBM Plex Sans JP を使用（再配布不可のため）。
- Home の「連絡する」ボタン、Email / GitHub / デモ / リポジトリのリンク先は未設定（`href="#"`）。公開前に差し替えること。
- ケーススタディ内の GIF はプレースホルダーのまま。
