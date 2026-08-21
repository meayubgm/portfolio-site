import type { Metadata } from "next";
import { BackLink } from "@/commons/BackLink";
import { CardGrid } from "@/commons/CardGrid";
import { CardLabel } from "@/commons/CardLabel";
import { GlassCard } from "@/commons/GlassCard";
import { MonoHeading } from "@/commons/MonoHeading";
import { Text } from "@/commons/Text";
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
                <Text variant="lead" className="mt-4">
                    {intro[1]}
                </Text>
            </header>

            <MonoHeading>{"// strength — エンジニアとしての強み"}</MonoHeading>
            <CardGrid>
                {strengths.map((s) => (
                    <GlassCard key={s.no} span={3}>
                        <CardLabel>{`strength ${s.no}`}</CardLabel>
                        <Text as="h2" variant="cardTitle" tone="strong" className="mb-2.5">
                            {s.title}
                        </Text>
                        <Text variant="body">{s.body}</Text>
                    </GlassCard>
                ))}
            </CardGrid>

            <MonoHeading>{"// person — 人となり"}</MonoHeading>
            <CardGrid>
                <GlassCard span={6} padding="lg">
                    <Text variant="body" className="mb-4">
                        {person[0]}
                    </Text>
                    <Text variant="body">{person[1]}</Text>
                </GlassCard>
            </CardGrid>

            <MonoHeading>{"// favorites — 好きなもの"}</MonoHeading>
            <CardGrid>
                {favorites.map((f) => (
                    <GlassCard key={f.name} span={3}>
                        <Text as="h3" variant="subTitle" tone="strong" className="mb-1.5">
                            {f.name}
                        </Text>
                        <Text variant="body" tone="muted">
                            {f.note}
                        </Text>
                    </GlassCard>
                ))}
            </CardGrid>

            <MonoHeading>{"// next — これからやってみたいこと"}</MonoHeading>
            <CardGrid>
                <GlassCard span={6} padding="lg">
                    <Text variant="body" className="mb-4">
                        {nextSteps[0]}
                    </Text>
                    <Text variant="body">{nextSteps[1]}</Text>
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
                                <Text
                                    variant="monoSm"
                                    tone="accent"
                                    className="w-20 shrink-0 leading-6"
                                >
                                    {e.period}
                                </Text>
                                <Text variant="body">{e.body}</Text>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </CardGrid>
        </div>
    );
}
