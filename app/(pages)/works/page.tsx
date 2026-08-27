import type { Metadata } from "next";
import { BackLink } from "@/commons/BackLink";
import { CardGrid } from "@/commons/CardGrid";
import { CardLabel } from "@/commons/CardLabel";
import { GlassCard } from "@/commons/GlassCard";
import { LabeledField } from "@/commons/LabeledField";
import { LearnMoreCue } from "@/commons/LearnMoreCue";
import { StatBlock } from "@/commons/StatBlock";
import { TagList } from "@/commons/TagList";
import { Text } from "@/commons/Text";
import { PageHeader } from "@/components/PageHeader";
import { brewCase, cases, otherWorks } from "@/lib/cases";

export const metadata: Metadata = {
    title: "実績一覧 — Megumi Ayuha",
};

export default function Works() {
    return (
        <div className="pt-24">
            <PageHeader
                geometry="works"
                size="list"
                eyebrow="works"
                title="実績一覧"
                lead="受託案件は契約上、画面キャプチャを掲載できないため、業務内容を匿名化したテキストベースのケーススタディとして掲載しています。"
            />

            <CardGrid>
                {/* 01 BREW — featured */}
                <GlassCard span={6} padding="lg" href="/works/brew" className="bg-featured" reveal>
                    <CardLabel meta={brewCase.no}>
                        個人開発 — code / design 全プロセス公開
                    </CardLabel>
                    <Text as="h3" variant="featureTitle" tone="strong" className="mb-2.5 mt-1.5">
                        {`${brewCase.titleEn} — ${brewCase.titleJa}`}
                    </Text>
                    <Text variant="monoSm" tone="muted" className="mb-3">
                        {brewCase.period}
                    </Text>
                    <Text variant="body">{brewCase.summary}</Text>
                    <div className="my-5 mb-1 grid grid-cols-1 gap-3 border-y border-dashed border-indigo-600/15 py-3.5 sm:grid-cols-3 sm:gap-5.5">
                        <StatBlock number="企画〜実装" label="担当範囲（全工程）" />
                        <StatBlock number="4種" label="抽出メソッド対応" />
                        <StatBlock number="実機検証済" label="Android / Expo Go" />
                    </div>
                    <div className="mt-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <TagList tags={brewCase.tags} />
                        <LearnMoreCue inline />
                    </div>
                </GlassCard>

                {/* 02–05 匿名化ケーススタディ */}
                {cases.map((c) => (
                    <GlassCard key={c.no} span={3} className="flex flex-col" reveal>
                        <CardLabel meta={c.no}>受託開発案件 — 業務内容は匿名化して掲載</CardLabel>
                        <Text as="h3" variant="cardTitle" tone="strong" className="mb-1 mt-1.5">
                            {c.title}
                        </Text>
                        <Text variant="monoSm" tone="muted" className="mb-3">
                            {c.period}
                        </Text>
                        <Text variant="body">{c.summary}</Text>
                        <LabeledField label="// role" className="mt-4">
                            {c.role}
                        </LabeledField>
                        <LabeledField label="// point">{c.point}</LabeledField>
                        <TagList tags={c.tags} className="mt-auto pt-3.5" />
                    </GlassCard>
                ))}

                {/* その他の案件 */}
                <GlassCard span={6} reveal>
                    <CardLabel>その他</CardLabel>
                    <div className="mt-2 flex flex-col">
                        {otherWorks.map((w) => (
                            <Text
                                key={w.name}
                                as="div"
                                variant="body"
                                className="flex justify-between gap-4 border-t border-sky-700/15 py-3"
                            >
                                <span>{w.name}</span>
                                <Text as="span" variant="monoSm" tone="muted">
                                    {w.tech}
                                </Text>
                            </Text>
                        ))}
                    </div>
                </GlassCard>
            </CardGrid>

            <BackLink href="/">back to home</BackLink>
        </div>
    );
}
