import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { LinkRow } from "@/components/LinkRow";
import { Tag } from "@/components/Tag";

export const metadata: Metadata = {
  title: "BREW — コーヒー抽出タイマー | A.Y / frontend",
};

function MonoHeading({ children }: { children: ReactNode }) {
  return <p className="m-0 mb-3 font-mono text-[12px] text-indigo">{children}</p>;
}

function Body({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p className="m-0 text-[15px] leading-[1.9] text-slate" style={style}>
      {children}
    </p>
  );
}

function MediaPlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-dashed border-indigo-soft bg-white/55 px-6 py-12 text-center">
      <p className="m-0 font-mono text-[12px] text-indigo">[ GIF差し込み：{label} ]</p>
    </div>
  );
}

export default function BrewCaseStudy() {
  return (
    <div>
      <div className="pt-10">
        <Link href="/works" className="font-mono text-[12.5px] text-indigo">
          ← works に戻る
        </Link>
      </div>

      <header className="border-b border-dashed border-indigo-soft py-10">
        <div className="mb-[18px]">
          <EyebrowLabel>01 — 個人開発</EyebrowLabel>
        </div>
        <h1 className="m-0 mb-5 max-w-[860px] font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.25] tracking-[-0.03em]">
          BREW（仮） — 抽出メソッドに合わせて
          <br />
          湯を注ぐタイミングまで導くコーヒータイマー
        </h1>
        <p className="m-0 mb-6 max-w-[680px] text-[15.5px] leading-[1.8] text-slate">
          豆の量や人数を入力するだけで最適な湯量を自動計算し、4:6メソッド・浸漬式ドリッパーなど複数の抽出法にステップごとのアラームで対応するモバイルアプリ。企画・要件定義・UIデザイン・実装まで一人で担当。
        </p>
        <div className="flex flex-wrap gap-2">
          <Tag>React Native</Tag>
          <Tag>Expo</Tag>
          <Tag>TypeScript</Tag>
          <Tag>React + Vite（Web版）</Tag>
        </div>
      </header>

      <div className="flex max-w-[760px] flex-col gap-12 pb-[90px] pt-12">
        <MediaPlaceholder label="タイマーが進行し、注湯タイミングでアラームが鳴る様子" />

        <section>
          <MonoHeading>{"// 開発背景・課題設定"}</MonoHeading>
          <Body style={{ marginBottom: "16px" }}>
            自分自身がスペシャルティコーヒーの抽出に関心があり、日常的に4:6メソッドや浸漬式ドリッパーなど複数の淹れ方を使い分けている中で、既存のコーヒータイマーアプリの多くが「単一の抽出法にしか対応していない」「湯量を自分で電卓を叩いて計算する必要がある」という不便さを感じたことが開発のきっかけです。
          </Body>
          <Body>
            「豆の量・人数を入力するだけで、注ぐタイミングと量を音で教えてくれる」体験を作ることを目標に、個人開発として企画から着手しました。
          </Body>
        </section>

        <section>
          <MonoHeading>{"// 要件定義"}</MonoHeading>
          <ul className="m-0 mb-4 list-disc pl-[1.3em] text-[15px] leading-[1.9] text-slate">
            <li>
              デフォルトで複数の抽出メソッド（4:6メソッド／浸漬式ドリッパー／エアロプレス／フレンチプレス）をプリセットとして用意
            </li>
            <li>人数または豆量の入力から、メソッドごとの比率に応じて湯量を自動計算</li>
            <li>タイマーはカウントアップ式とし、各ステップの注湯タイミングでアラーム通知</li>
            <li>
              ユーザー独自の抽出レシピを保存できるカスタムプリセット機能（フェーズ2として設計）
            </li>
          </ul>
          <Body>
            工程を通じて意識したのは、単なるタイマーではなく「抽出ガイド」として機能させること。アラーム時に「今回注ぐ量」「累計注湯量」「次のステップまでの待機時間」をまとめて提示する設計にしました。
          </Body>
        </section>

        <section>
          <MonoHeading>{"// デザイン"}</MonoHeading>
          <Body style={{ marginBottom: "16px" }}>
            ダークブラウン×アンバーを基調にした配色を設計しました。理由は2点：コーヒーの世界観との親和性（焙煎豆・ドリップの色味を想起させる配色）と、実利用シーンへの配慮です。抽出中は手が濡れている・キッチンが薄暗いことが多いため、暗い背景に高コントラストな数字表示で視認性を優先しました。
          </Body>
          <Body style={{ marginBottom: "24px" }}>
            HTML/CSSでインタラクティブなプロトタイプを先に作成し、タイマーの挙動・画面遷移をデザイン段階で検証してから実装に着手しました。
          </Body>
          <MediaPlaceholder label="ダークブラウン×アンバーのUI全体キャプチャ" />
        </section>

        <section>
          <MonoHeading>{"// 技術選定"}</MonoHeading>
          <div className="flex flex-col">
            <div className="border-t border-dashed border-indigo-soft py-3.5">
              <p className="m-0 mb-1 text-[14px] font-semibold text-navy">
                Web MVP — React + TypeScript + Vite
              </p>
              <p className="m-0 text-sm leading-[1.7] text-slate">
                型安全性を確保しつつ、開発中のビルド速度を優先。プロトタイプの検証速度を重視しVite採用。
              </p>
            </div>
            <div className="border-y border-dashed border-indigo-soft py-3.5">
              <p className="m-0 mb-1 text-[14px] font-semibold text-navy">
                モバイル — React Native + Expo
              </p>
              <p className="m-0 text-sm leading-[1.7] text-slate">
                実機での動作確認・配布のしやすさを優先。Expo&nbsp;Goで実機検証しながら開発を進める前提で採用。
              </p>
            </div>
          </div>
          <Body style={{ marginTop: "16px" }}>
            Web版とモバイル版でロジック（湯量計算・タイマー制御）を共通化できる設計を意識し、UIレイヤーのみをプラットフォームごとに分離する構成にしています。
          </Body>
        </section>

        <section>
          <MonoHeading>{"// 実装・実機検証"}</MonoHeading>
          <Body style={{ marginBottom: "24px" }}>
            Expo&nbsp;Goを使ってAndroid実機上で動作確認を実施。画面遷移・湯量自動計算・タイマー進行を実機で検証し、抽出ステップに合わせたアラーム通知が正しいタイミングで発火することを確認しました。
          </Body>
          <MediaPlaceholder label="実機でタイマーが動作している様子" />
        </section>

        <section>
          <MonoHeading>{"// 実装済み ／ 今後の実装予定"}</MonoHeading>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="m-0 mb-2 text-[14px] font-semibold">実装済み</p>
              <ul className="m-0 list-disc pl-[1.3em] text-sm leading-[1.8] text-slate">
                <li>複数抽出メソッドのプリセット選択</li>
                <li>人数・豆量に応じた湯量自動計算</li>
                <li>ステップタイマーとアラーム通知</li>
                <li>Android実機での動作確認</li>
              </ul>
            </div>
            <div>
              <p className="m-0 mb-2 text-[14px] font-semibold">今後の実装予定</p>
              <ul className="m-0 list-disc pl-[1.3em] text-sm leading-[1.8] text-slate">
                <li>ユーザーカスタムプリセット機能</li>
                <li>Web版（React + Vite）のリリース</li>
                <li>抽出ログの記録機能（次フェーズ候補）</li>
              </ul>
            </div>
          </div>
          <Body style={{ marginTop: "16px" }}>
            コア体験である「抽出ガイド」機能の安定動作を優先し、カスタマイズ機能は意図的に後回しにしています。
          </Body>
        </section>

        <section>
          <MonoHeading>{"// コード・デモ"}</MonoHeading>
          <div>
            <LinkRow first>デモ（Web / 実機） — [リンク]</LinkRow>
            <LinkRow>リポジトリ — [GitHubリンク]</LinkRow>
          </div>
        </section>
      </div>
    </div>
  );
}
