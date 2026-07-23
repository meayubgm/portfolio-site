export type SkillGroup = {
    /** CardLabel に表示する小文字ラベル */
    label: string;
    /** カード見出し */
    heading: string;
    /** 見出し下の補足文 */
    note: string;
    items: { name: string; percent: number }[];
};

export const skillGroups: SkillGroup[] = [
    {
        label: "development",
        heading: "Development",
        note: "実務での使用経験ベースで記載",
        items: [
            { name: "React / Next.js — 2023年〜", percent: 88 },
            { name: "TypeScript", percent: 82 },
            { name: "Laravel / PHP", percent: 70 },
        ],
    },
    {
        label: "design",
        heading: "Design",
        note: "デザインカンプ・アイコン制作で実務使用",
        items: [
            { name: "Figma", percent: 85 },
            { name: "Adobe XD", percent: 80 },
            { name: "Illustrator", percent: 72 },
        ],
    },
];
