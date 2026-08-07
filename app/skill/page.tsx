import type { Metadata } from "next";
import { CardGrid } from "@/components/CardGrid";
import { CardLabel } from "@/components/CardLabel";
import { GlassCard } from "@/components/GlassCard";
import { PageHeading } from "@/components/PageHeading";
import { SkillBar } from "@/components/SkillBar";
import { skillGroups } from "@/lib/skills";

export const metadata: Metadata = {
    title: "スキル — Megumi Ayuha",
};

export default function Skill() {
    return (
        <div>
            <header className="pt-24 pb-12">
                <PageHeading
                    size="list"
                    eyebrow="skill"
                    title="スキル"
                    lead="バーの長さは実務での使用経験月数を基準にした相対値です。習熟度そのものではなく、どれだけの期間その技術に向き合ってきたかの目安として掲載しています。"
                />
            </header>

            <CardGrid>
                {skillGroups.map((g) => (
                    <GlassCard key={g.heading} span={6} padding="lg">
                        <CardLabel>{`${g.label} — ${g.heading}`}</CardLabel>
                        <h2 className="m-0 mb-2 font-display text-[20px] font-semibold">
                            {g.heading}
                        </h2>
                        <p className="m-0 mb-2 text-[13px] leading-[1.6] text-slate-500">
                            {g.note}
                        </p>
                        <div className="flex flex-col">
                            {g.items.map((s) => (
                                <div
                                    key={s.name}
                                    className="border-t border-dashed border-indigo-600/15 py-4"
                                >
                                    <SkillBar name={s.name} percent={s.percent} />
                                    <p className="m-0 mt-2.5 text-[13.5px] leading-[1.7] text-slate-600">
                                        {s.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                ))}
            </CardGrid>
        </div>
    );
}
