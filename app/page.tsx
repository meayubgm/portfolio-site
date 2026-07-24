import { Button } from "@/components/Button";
import { CardGrid } from "@/components/CardGrid";
import { CardLabel } from "@/components/CardLabel";
import { GlassCard } from "@/components/GlassCard";
import { LinkRow } from "@/components/LinkRow";
import { PageHeading } from "@/components/PageHeading";
import { SkillBar } from "@/components/SkillBar";
import { Tag } from "@/components/Tag";
import { brewCase } from "@/lib/cases";
import { skillGroups } from "@/lib/skills";

export default function Home() {
    return (
        <div>
            <header className="pt-35 pb-20 h-screen flex flex-col justify-between">
                <div>
                    <PageHeading
                        size="hero"
                        eyebrow="design × development"
                        title="意図を汲みとって、かたちにする"
                    />
                </div>
                <div>
                    <p className="m-0 pb-4.5 font-mono text-[15px] text-slate-500">
                        Megumi Ayuha / Web Design × Frontend Development — Portfolio
                    </p>
                    <p className="m-0 pb-20 max-w-155 text-[16.5px] leading-[1.8] text-slate-600">
                        ご覧いただきありがとうございます。
                        <br />
                        デザイン理解を強みにしたフロントエンド実装、常にユーザビリティを意識したUI改善を大切にして開発に向き合っています。指示を受けた要件をそのまま実装するのではなく、指示の意図を汲み取ってより使いやすいUIを提案します。
                    </p>
                    <div className="flex gap-3.5">
                        <Button variant="primary" href="/works">
                            Works を見る
                        </Button>
                        <Button variant="ghost">連絡する</Button>
                    </div>
                </div>
            </header>

            <CardGrid>
                <GlassCard span={4} padding="lg">
                    <CardLabel>about</CardLabel>
                    <p className="m-0 mt-1.5 font-display text-[21px] font-medium leading-[1.55] text-slate-900">
                        「デザインの意図を汲んだ実装」と「実装を前提にしたデザイン」
                        <br />
                        <b className="font-semibold text-sky-700">その両方の立場で会話できる</b>
                        のが強みです
                    </p>
                    <p className="m-0 mt-5.5 text-[14.5px] leading-[1.7] text-slate-600">
                        Webアプリケーションの受託開発で React / Next.js / TypeScript
                        を中心に、主にフロントエンド開発を3年以上担当してきました。追加機能の
                        要件定義 / 基本設計 / 詳細設計 と、AdobeXD / Figma / Illustrator を用いた
                        デザインカンプ / アイコン制作 も担当しています。
                        <br />
                        丁寧な言語化とAIを活用した仕組み化を大切にしながら、着実にプロダクトの質を積み上げます。
                    </p>
                </GlassCard>

                <GlassCard span={2} href="/works/brew" className="bg-featured">
                    <CardLabel>featured work — 個人開発</CardLabel>
                    <h3 className="m-0 mb-2.5 font-display text-[20px] font-semibold">
                        コーヒー抽出タイマーアプリ「{brewCase.titleEn}」
                    </h3>
                    <p className="m-0 text-sm leading-[1.7] text-slate-600">
                        企画・要件定義・UIデザイン・実装まで一人で担当。ケーススタディを見る ↗
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {brewCase.tags.map((t) => (
                            <Tag key={t}>{t}</Tag>
                        ))}
                    </div>
                </GlassCard>

                {skillGroups.map((g) => (
                    <GlassCard key={g.heading} span={2}>
                        <CardLabel>{g.label}</CardLabel>
                        <h3 className="m-0 mb-2.5 font-display text-[20px] font-semibold">
                            {g.heading}
                        </h3>
                        <p className="m-0 mb-3 text-[13px] leading-[1.6] text-slate-500">
                            {g.note}
                        </p>
                        <div className="flex flex-col gap-2.5">
                            {g.items.map((s) => (
                                <SkillBar key={s.name} name={s.name} percent={s.percent} />
                            ))}
                        </div>
                    </GlassCard>
                ))}

                <GlassCard span={2} className="flex flex-col justify-between">
                    <div>
                        <CardLabel>contact</CardLabel>
                        <h3 className="m-0 mb-2.5 font-display text-[20px] font-semibold">
                            Let&apos;s talk
                        </h3>
                        <p className="m-0 text-[14.5px] leading-[1.7] text-slate-600">
                            お気軽にご連絡ください。
                        </p>
                    </div>
                    <div>
                        <LinkRow first external href="https://github.com/meayubgm">
                            GitHub
                        </LinkRow>
                        <LinkRow external href="https://x.com/yu_ha_design">
                            X
                        </LinkRow>
                        <LinkRow>Contact Form</LinkRow>
                    </div>
                </GlassCard>
            </CardGrid>
        </div>
    );
}
