import type { Metadata } from "next";
import { BackLink } from "@/commons/BackLink";
import { CardGrid } from "@/commons/CardGrid";
import { CardLabel } from "@/commons/CardLabel";
import { GlassCard } from "@/commons/GlassCard";
import { Text } from "@/commons/Text";
import { PageHeader } from "@/components/PageHeader";
import { SkillName } from "@/components/SkillName";
import type { SkillGroup, SkillItem, SkillSection } from "@/lib/skills";
import { skillGroups } from "@/lib/skills";

export const metadata: Metadata = {
    title: "スキル — Megumi Ayuha",
};

type SkillColumnData = { key: string; sections: SkillSection[] };

/** layout.columns が 2 のときは section.column（既定 1）で列に振り分ける */
function toColumns(group: SkillGroup): SkillColumnData[] {
    if (group.layout.columns === 1) {
        return [{ key: "column-1", sections: group.sections }];
    }
    return [
        {
            key: "column-1",
            sections: group.sections.filter((s) => (s.column ?? 1) === 1),
        },
        {
            key: "column-2",
            sections: group.sections.filter((s) => s.column === 2),
        },
    ];
}

/** スキル項目1件（名前 + 説明） */
function SkillItemRow({ item }: { item: SkillItem }) {
    return (
        <div className="border-t border-dashed border-indigo-600/15 py-4">
            <SkillName name={item.name} />
            <Text variant="body" className="mt-2.5">
                {item.description}
            </Text>
        </div>
    );
}

/** heading があるときだけ mono の小見出しを出す */
function SectionHeading({ heading }: { heading?: string }) {
    if (!heading) {
        return null;
    }
    return (
        <Text as="h3" variant="monoSm" tone="strong" className="mt-4 mb-1 uppercase tracking-label">
            {heading}
        </Text>
    );
}

/** セクション見出し（あれば）と、その配下のスキル項目 */
function SkillSectionBlock({ section }: { section: SkillSection }) {
    return (
        <div className="flex flex-col">
            <SectionHeading heading={section.heading} />
            {section.items.map((item) => (
                <SkillItemRow key={item.name} item={item} />
            ))}
        </div>
    );
}

/** カード内の1列（セクションを縦に積む） */
function SkillColumn({ sections }: { sections: SkillSection[] }) {
    return (
        <div className="flex flex-col">
            {sections.map((section, index) => (
                <SkillSectionBlock key={section.heading ?? `section-${index}`} section={section} />
            ))}
        </div>
    );
}

/** スキルグループ1つ分のカード。列コンテナまでを組み立てる */
function SkillGroupCard({ group }: { group: SkillGroup }) {
    return (
        <GlassCard
            id={group.id}
            span={group.layout.span}
            padding="lg"
            className="scroll-mt-28"
            reveal
        >
            <CardLabel>{`${group.label} — ${group.heading}`}</CardLabel>
            <Text as="h2" variant="cardTitle" tone="strong" className="mb-2">
                {group.heading}
            </Text>
            <Text variant="note" tone="muted" className="mb-2">
                {group.skillsNote ?? group.note}
            </Text>
            <div
                className={
                    group.layout.columns === 2 ? "grid grid-cols-2 gap-x-8" : "flex flex-col"
                }
            >
                {toColumns(group).map((column) => (
                    <SkillColumn key={column.key} sections={column.sections} />
                ))}
            </div>
        </GlassCard>
    );
}

export default function Skill() {
    return (
        <div>
            <BackLink href="/">home に戻る</BackLink>

            <PageHeader
                geometry="skills"
                size="list"
                eyebrow="skills"
                title="スキル"
                lead="実務および個人開発で使用してきた技術を、実際の関わり方とあわせて記載しています。"
            />

            <CardGrid>
                {skillGroups.map((group) => (
                    <SkillGroupCard key={group.heading} group={group} />
                ))}
            </CardGrid>
        </div>
    );
}
