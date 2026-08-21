import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { CardGrid } from "@/components/CardGrid";
import { CardLabel } from "@/components/CardLabel";
import { GlassCard } from "@/components/GlassCard";
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
                        <h2 className="m-0 mb-2 font-display text-[20px] font-semibold">
                            {g.heading}
                        </h2>
                        <p className="m-0 mb-2 text-[13px] leading-[1.6] text-slate-500">
                            {g.skillsNote ?? g.note}
                        </p>
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
                                                <h3 className="m-0 mt-4 mb-1 font-mono text-[12.5px] uppercase tracking-[0.06em] text-slate-900">
                                                    {section.heading}
                                                </h3>
                                            ) : null}
                                            {section.items.map((s) => (
                                                <div
                                                    key={s.name}
                                                    className="border-t border-dashed border-indigo-600/15 py-4"
                                                >
                                                    <SkillName name={s.name} />
                                                    <p className="m-0 mt-2.5 text-[13.5px] leading-[1.7] text-slate-600">
                                                        {s.description}
                                                    </p>
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
