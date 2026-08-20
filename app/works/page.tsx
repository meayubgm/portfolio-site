import type { Metadata } from "next";
import { CardGrid } from "@/components/CardGrid";
import { CardLabel } from "@/components/CardLabel";
import { GlassCard } from "@/components/GlassCard";
import { HoverCue } from "@/components/HoverCue";
import { LabeledField } from "@/components/LabeledField";
import { PageHeading } from "@/components/PageHeading";
import { StatBlock } from "@/components/StatBlock";
import { Tag } from "@/components/Tag";
import { brewCase, cases, otherWorks } from "@/lib/cases";

export const metadata: Metadata = {
    title: "実績一覧 — Megumi Ayuha",
};

export default function Works() {
    return (
        <div>
            <header className="pt-24 pb-12">
                <PageHeading
                    size="list"
                    eyebrow="works"
                    title="実績一覧"
                    lead="受託案件は契約上、画面キャプチャを掲載できないため、業務内容を匿名化したテキストベースのケーススタディとして掲載しています。"
                />
            </header>

            <CardGrid>
                {/* 01 BREW — featured */}
                <GlassCard span={6} padding="lg" href="/works/brew" className="bg-featured">
                    <div className="flex items-start justify-between">
                        <CardLabel>個人開発 — code / design 全プロセス公開</CardLabel>
                        <span className="font-mono text-[12px] text-slate-500">{brewCase.no}</span>
                    </div>
                    <h3 className="m-0 mb-2.5 mt-1.5 font-display text-[24px] font-semibold">
                        {`${brewCase.titleEn} — ${brewCase.titleJa}`}
                    </h3>
                    <p className="m-0 mb-3 font-mono text-[11.5px] text-slate-500">
                        {brewCase.period}
                    </p>
                    <p className="m-0 text-[14.5px] leading-[1.75] text-slate-600">
                        {brewCase.summary}
                    </p>
                    <div className="my-5 mb-1 flex gap-5.5 border-y border-dashed border-indigo-600/15 py-3.5">
                        <StatBlock number="企画〜実装" label="担当範囲（全工程）" />
                        <StatBlock number="4種" label="抽出メソッド対応" />
                        <StatBlock number="実機検証済" label="Android / Expo Go" />
                    </div>
                    <div className="mt-3.5 flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            {brewCase.tags.map((t) => (
                                <Tag key={t}>{t}</Tag>
                            ))}
                        </div>
                        <HoverCue className="whitespace-nowrap">詳細を見る ↗</HoverCue>
                    </div>
                </GlassCard>

                {/* 02–05 匿名化ケーススタディ */}
                {cases.map((c) => (
                    <GlassCard key={c.no} span={3} className="flex flex-col">
                        <div className="flex items-start justify-between">
                            <CardLabel>受託開発案件 — 業務内容は匿名化して掲載</CardLabel>
                            <span className="font-mono text-[12px] text-slate-500">{c.no}</span>
                        </div>
                        <h3 className="m-0 mb-1 mt-1.5 font-display text-[19px] font-semibold">
                            {c.title}
                        </h3>
                        <p className="m-0 mb-3 font-mono text-[11.5px] text-slate-500">
                            {c.period}
                        </p>
                        <p className="m-0 text-sm leading-[1.7] text-slate-600">{c.summary}</p>
                        <LabeledField label="// role" className="mt-4">
                            {c.role}
                        </LabeledField>
                        <LabeledField label="// point">{c.point}</LabeledField>
                        <div className="mt-auto flex flex-wrap gap-2 pt-3.5">
                            {c.tags.map((t) => (
                                <Tag key={t}>{t}</Tag>
                            ))}
                        </div>
                    </GlassCard>
                ))}

                {/* その他の案件 */}
                <GlassCard span={6}>
                    <CardLabel>その他</CardLabel>
                    <div className="mt-2 flex flex-col">
                        {otherWorks.map((w) => (
                            <div
                                key={w.name}
                                className="flex justify-between gap-4 border-t border-sky-700/15 py-3 text-[14px] text-slate-600"
                            >
                                <span>{w.name}</span>
                                <span className="font-mono text-[11.5px] text-slate-500">
                                    {w.tech}
                                </span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </CardGrid>
        </div>
    );
}
