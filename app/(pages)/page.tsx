import { Button } from "@/commons/Button";
import { CardGrid } from "@/commons/CardGrid";
import { CardLabel } from "@/commons/CardLabel";
import { GlassCard } from "@/commons/GlassCard";
import { LearnMoreCue } from "@/commons/LearnMoreCue";
import { LinkRow } from "@/commons/LinkRow";
import { Phrase } from "@/commons/Phrase";
import { RiseIn } from "@/commons/RiseIn";
import { TagList } from "@/commons/TagList";
import { Text, withLineBreaks } from "@/commons/Text";
import { Typewriter } from "@/commons/Typewriter";
import { HeroGeometry } from "@/components/HeroGeometry";
import { PageHeading } from "@/components/PageHeading";
import { SkillBar } from "@/components/SkillBar";
import { introBody } from "@/lib/about";
import { brewCase } from "@/lib/cases";
import { heroActionsDelay, heroPhrases, heroTyping } from "@/lib/home";
import { homeSkillGroups } from "@/lib/skills";

export default function Home() {
    return (
        <div>
            <header className="h-svh pt-20 pb-10 sm:pt-35 sm:pb-20 flex flex-col justify-between">
                <HeroGeometry page="home" />
                <div>
                    <PageHeading
                        size="hero"
                        eyebrow={<Typewriter lines={heroPhrases.eyebrow} {...heroTyping.eyebrow} />}
                        title={<Typewriter lines={heroPhrases.title} {...heroTyping.title} />}
                    />
                </div>
                <div>
                    <Text variant="monoLg" tone="muted" className="pb-4.5">
                        <Typewriter lines={heroPhrases.mono} {...heroTyping.mono} />
                    </Text>
                    <Text variant="lead" className="pb-6 text-left sm:pb-12">
                        <Typewriter lines={heroPhrases.lead} {...heroTyping.lead} />
                    </Text>
                    <RiseIn delay={heroActionsDelay} className="flex flex-nowrap gap-3.5">
                        <Button variant="primary" href="/works">
                            Works を見る
                        </Button>
                        <Button variant="ghost" href="/contact">
                            連絡する
                        </Button>
                    </RiseIn>
                </div>
            </header>

            <CardGrid>
                <GlassCard span={4} padding="lg" href="/about" className="flex flex-col" reveal>
                    <CardLabel>about</CardLabel>
                    <Text variant="cardLead" tone="strong" className="mt-1.5">
                        <Phrase>
                            「デザインの意図を汲んだ実装」と「実装を前提にしたデザイン」
                        </Phrase>
                        <br />
                        <b className="font-semibold text-sky-700">
                            <Phrase>その両方の立場で会話できる</Phrase>
                        </b>
                        {/* Phrase をまたぐと文節境界が失われるので、この継ぎ目にだけ手で置く */}
                        <wbr />
                        <Phrase>のが強みです</Phrase>
                    </Text>
                    <Text variant="body" className="mt-5.5">
                        {withLineBreaks(introBody)}
                    </Text>
                    <LearnMoreCue />
                </GlassCard>

                <GlassCard span={2} href="/works/brew" className="flex flex-col bg-featured" reveal>
                    <CardLabel>featured work — 個人開発</CardLabel>
                    <Text as="h3" variant="cardTitle" tone="strong" className="mb-2.5">
                        <Phrase>{`コーヒー抽出タイマーアプリ「${brewCase.titleEn}」`}</Phrase>
                    </Text>
                    <Text variant="body">企画・要件定義・UIデザイン・実装まで一人で担当。</Text>
                    <TagList tags={brewCase.tags} className="mt-4" />
                    <LearnMoreCue />
                </GlassCard>

                {homeSkillGroups.map((g) => (
                    <GlassCard
                        key={g.heading}
                        span={2}
                        href={g.id === "design" ? `/skills#${g.id}` : "/skills"}
                        className="flex flex-col"
                        reveal
                    >
                        <CardLabel>{g.label}</CardLabel>
                        <Text as="h3" variant="cardTitle" tone="strong" className="mb-2.5">
                            {g.heading}
                        </Text>
                        <Text variant="note" tone="muted" className="mb-3">
                            {g.note}
                        </Text>
                        <div className="flex flex-col gap-2.5">
                            {g.items.map((s) => (
                                <SkillBar key={s.name} name={s.name} percent={s.percent} />
                            ))}
                        </div>
                        <LearnMoreCue />
                    </GlassCard>
                ))}

                <GlassCard span={2} className="flex flex-col justify-between" reveal>
                    <div>
                        <CardLabel>contact</CardLabel>
                        <Text as="h3" variant="cardTitle" tone="strong" className="mb-2.5">
                            Let&apos;s talk
                        </Text>
                        <Text variant="body">お気軽にご連絡ください。</Text>
                    </div>
                    <div>
                        <LinkRow first external href="https://github.com/meayubgm">
                            GitHub
                        </LinkRow>
                        <LinkRow external href="https://x.com/yu_ha_design">
                            X
                        </LinkRow>
                        <LinkRow href="/contact">Contact Form</LinkRow>
                    </div>
                </GlassCard>
            </CardGrid>
        </div>
    );
}
