import type { Metadata } from "next";
import { CardLabel } from "@/components/CardLabel";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { GlassCard } from "@/components/GlassCard";
import { StatBlock } from "@/components/StatBlock";
import { Tag } from "@/components/Tag";
import { cases } from "@/lib/cases";

export const metadata: Metadata = {
  title: "実績一覧 — A.Y / frontend",
};

const otherWorks = [
  { name: "運送会社ホームページ制作（2ページ制作）", tech: "WordPress" },
  { name: "社内向けワークフローシステム モック作成", tech: "HTML / CSS" },
  {
    name: "求職者支援訓練 Webデザイナー・ディレクター・マーケティング養成科（学習内容）",
    tech: "training",
  },
];

export default function Works() {
  return (
    <div>
      <header className="pt-[72px] pb-12">
        <div className="mb-[18px]">
          <EyebrowLabel>works — 見せられる情報の質が高い順</EyebrowLabel>
        </div>
        <h1 className="m-0 mb-[18px] font-display text-[clamp(34px,4.5vw,52px)] font-semibold leading-[1.15] tracking-[-0.03em]">
          実績一覧
        </h1>
        <p className="m-0 max-w-[620px] text-[15.5px] leading-[1.8] text-slate">
          受託案件は契約上、画面キャプチャを掲載できないため、業務内容を匿名化したテキストベースのケーススタディとして掲載しています。
        </p>
      </header>

      <section className="grid grid-cols-6 gap-4 pb-[90px]">
        {/* 01 BREW — featured */}
        <GlassCard
          span={6}
          padding="lg"
          href="/works/brew"
          className="bg-[linear-gradient(160deg,rgba(107,174,219,0.14),rgba(255,255,255,0.55))]"
        >
          <div className="flex items-start justify-between">
            <CardLabel>個人開発 — code / design 全プロセス公開</CardLabel>
            <span className="font-mono text-[12px] text-slate-soft">01</span>
          </div>
          <h3 className="m-0 mb-[10px] mt-1.5 font-display text-[24px] font-semibold">
            BREW（仮） — 抽出メソッドに合わせて湯を注ぐタイミングまで導くコーヒータイマー
          </h3>
          <p className="m-0 max-w-[760px] text-[14.5px] leading-[1.75] text-slate">
            豆の量や人数を入力するだけで最適な湯量を自動計算し、4:6メソッド・浸漬式ドリッパーなど複数の抽出法にステップごとのアラームで対応するモバイルアプリ。企画・要件定義・UIデザイン・実装まで一人で担当。
          </p>
          <div className="my-[20px] mb-1 flex gap-[22px] border-y border-dashed border-indigo-soft py-[14px]">
            <StatBlock number="企画〜実装" label="担当範囲（全工程）" />
            <StatBlock number="4種" label="抽出メソッド対応" />
            <StatBlock number="実機検証済" label="Android / Expo Go" />
          </div>
          <div className="mt-[14px] flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Tag>React Native</Tag>
              <Tag>Expo</Tag>
              <Tag>TypeScript</Tag>
              <Tag>React + Vite（Web版）</Tag>
            </div>
            <span className="whitespace-nowrap font-mono text-[12.5px] text-indigo">
              ケーススタディを読む ↗
            </span>
          </div>
        </GlassCard>

        {/* 02–05 匿名化ケーススタディ */}
        {cases.map((c) => (
          <GlassCard key={c.no} span={3} className="flex flex-col">
            <div className="flex items-start justify-between">
              <CardLabel>case study — 業務内容は匿名化して掲載</CardLabel>
              <span className="font-mono text-[12px] text-slate-soft">{c.no}</span>
            </div>
            <h3 className="m-0 mb-1 mt-1.5 font-display text-[19px] font-semibold">{c.title}</h3>
            <p className="m-0 mb-3 font-mono text-[11.5px] text-slate-soft">{c.period}</p>
            <p className="m-0 text-[14px] leading-[1.7] text-slate">{c.summary}</p>
            <div className="mt-4 border-t border-dashed border-indigo-soft py-3">
              <p className="m-0 mb-1 font-mono text-[11px] text-indigo">{"// role"}</p>
              <p className="m-0 text-[13.5px] leading-[1.6] text-slate">{c.role}</p>
            </div>
            <div className="border-t border-dashed border-indigo-soft py-3">
              <p className="m-0 mb-1 font-mono text-[11px] text-indigo">{"// point"}</p>
              <p className="m-0 text-[13.5px] leading-[1.6] text-slate">{c.point}</p>
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-[14px]">
              {c.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </GlassCard>
        ))}

        {/* その他の案件 */}
        <GlassCard span={6}>
          <CardLabel>その他の案件</CardLabel>
          <div className="mt-2 flex flex-col">
            {otherWorks.map((w) => (
              <div
                key={w.name}
                className="flex justify-between gap-4 border-t border-frost-border py-3 text-[14px] text-slate"
              >
                <span>{w.name}</span>
                <span className="font-mono text-[11.5px] text-slate-soft">{w.tech}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
