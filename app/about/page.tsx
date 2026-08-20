import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { CardGrid } from "@/components/CardGrid";
import { CardLabel } from "@/components/CardLabel";
import { GlassCard } from "@/components/GlassCard";
import { MonoHeading } from "@/components/MonoHeading";
import { PageHeading } from "@/components/PageHeading";
import { favorites, intro, nextSteps, person, story, strengths } from "@/lib/about";

export const metadata: Metadata = {
    title: "私自身について — Megumi Ayuha",
};

export default function About() {
    return (
        <div>
            <BackLink href="/">home に戻る</BackLink>

            <header className="pt-10 pb-12">
                <PageHeading size="list" eyebrow="about" title="私自身について" lead={intro[0]} />
                <p className="m-0 mt-4 text-base leading-[1.8] text-slate-600">{intro[1]}</p>
            </header>

            <MonoHeading>{"// strength — エンジニアとしての強み"}</MonoHeading>
            <CardGrid>
                {strengths.map((s) => (
                    <GlassCard key={s.no} span={3}>
                        <CardLabel>{`strength ${s.no}`}</CardLabel>
                        <h2 className="m-0 mb-2.5 font-display text-[20px] font-semibold">
                            {s.title}
                        </h2>
                        <p className="m-0 text-[14.5px] leading-[1.75] text-slate-600">{s.body}</p>
                    </GlassCard>
                ))}
            </CardGrid>

            <MonoHeading>{"// person — 人となり"}</MonoHeading>
            <CardGrid>
                <GlassCard span={6} padding="lg">
                    <p className="m-0 mb-4 text-[14.5px] leading-[1.75] text-slate-600">
                        {person[0]}
                    </p>
                    <p className="m-0 text-[14.5px] leading-[1.75] text-slate-600">{person[1]}</p>
                </GlassCard>
            </CardGrid>

            <MonoHeading>{"// favorites — 好きなもの"}</MonoHeading>
            <CardGrid>
                {favorites.map((f) => (
                    <GlassCard key={f.name} span={3}>
                        <h3 className="m-0 mb-1.5 font-display text-[17px] font-semibold">
                            {f.name}
                        </h3>
                        <p className="m-0 text-[13.5px] leading-[1.7] text-slate-500">{f.note}</p>
                    </GlassCard>
                ))}
            </CardGrid>

            <MonoHeading>{"// next — これからやってみたいこと"}</MonoHeading>
            <CardGrid>
                <GlassCard span={6} padding="lg">
                    <p className="m-0 mb-4 text-[14.5px] leading-[1.75] text-slate-600">
                        {nextSteps[0]}
                    </p>
                    <p className="m-0 text-[14.5px] leading-[1.75] text-slate-600">
                        {nextSteps[1]}
                    </p>
                </GlassCard>
            </CardGrid>

            <MonoHeading>{"// story — 来歴"}</MonoHeading>
            <CardGrid>
                <GlassCard span={6} padding="lg">
                    <div className="flex flex-col">
                        {story.map((e, i) => (
                            <div
                                key={e.period}
                                className={`flex gap-6 py-3.5 ${
                                    i === 0 ? "" : "border-t border-dashed border-indigo-600/15"
                                }`}
                            >
                                <p className="m-0 w-20 shrink-0 font-mono text-[12.5px] leading-[1.7] text-indigo-600">
                                    {e.period}
                                </p>
                                <p className="m-0 text-sm leading-[1.7] text-slate-600">{e.body}</p>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </CardGrid>
        </div>
    );
}
