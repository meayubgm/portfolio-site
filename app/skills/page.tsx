import type { Metadata } from "next";
import { BackLink } from "@/commons/BackLink";
import { CardGrid } from "@/commons/CardGrid";
import { CardLabel } from "@/commons/CardLabel";
import { GlassCard } from "@/commons/GlassCard";
import { Text } from "@/commons/Text";
import { PageHeading } from "@/components/PageHeading";
import { SkillName } from "@/components/SkillName";
import type { SkillGroup, SkillSection } from "@/lib/skills";
import { skillGroups } from "@/lib/skills";

export const metadata: Metadata = {
    title: "スキル — Megumi Ayuha",
};

/** layout.columns が 2 のときは section.column（既定 1）で列に振り分ける */
function toColumns(g: SkillGroup): SkillSection[][] {
    if (g.layout.columns === 1) {
        return [g.sections];
    }
    return [
        g.sections.filter((s) => (s.column ?? 1) === 1),
        g.sections.filter((s) => s.column === 2),
    ];
}

export default function Skill() {
    return (
        <div>
            <BackLink href="/">home に戻る</BackLink>

            <header className="pt-10 pb-12">
                <PageHeading
                    size="list"
                    eyebrow="skills"
                    title="スキル"
                    lead="実務および個人開発で使用してきた技術を、実際の関わり方とあわせて記載しています。"
                />
            </header>

            <CardGrid>
                {skillGroups.map((g) => (
                    <GlassCard key={g.heading} span={g.layout.span} padding="lg">
                        <CardLabel>{`${g.label} — ${g.heading}`}</CardLabel>
                        <Text as="h2" variant="cardTitle" tone="strong" className="mb-2">
                            {g.heading}
                        </Text>
                        <Text variant="note" tone="muted" className="mb-2">
                            {g.skillsNote ?? g.note}
                        </Text>
                        <div
                            className={
                                g.layout.columns === 2
                                    ? "grid grid-cols-2 gap-x-8"
                                    : "flex flex-col"
                            }
                        >
                            {toColumns(g).map((sections, i) => (
                                <div
                                    // biome-ignore lint/suspicious/noArrayIndexKey: 列は固定数で並び替えが起きない
                                    key={i}
                                    className="flex flex-col"
                                >
                                    {sections.map((section, j) => (
                                        <div
                                            key={section.heading ?? `section-${j}`}
                                            className="flex flex-col"
                                        >
                                            {section.heading ? (
                                                <Text
                                                    as="h3"
                                                    variant="monoSm"
                                                    tone="strong"
                                                    className="mt-4 mb-1 uppercase tracking-label"
                                                >
                                                    {section.heading}
                                                </Text>
                                            ) : null}
                                            {section.items.map((s) => (
                                                <div
                                                    key={s.name}
                                                    className="border-t border-dashed border-indigo-600/15 py-4"
                                                >
                                                    <SkillName name={s.name} />
                                                    <Text variant="body" className="mt-2.5">
                                                        {s.description}
                                                    </Text>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                ))}
            </CardGrid>
        </div>
    );
}
