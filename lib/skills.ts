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
        label: "skills",
        heading: "Development",
        note: "実務での使用経験ベースで記載",
        items: [
            // TypeScript: brew(1)+03(24)+04(10)+08(4) = 39ヶ月
            { name: "TypeScript", percent: 100 },
            // React / Next.js: 03(24)+04(10)+08(4) = 38ヶ月
            { name: "React / Next.js", percent: 97 },
            // Tailwind CSS: brew(1)+04(10)+06(1)+07(1)+08(4) = 17ヶ月 ×1.2補正 = 20ヶ月
            { name: "Tailwind CSS", percent: 51 },
            // JavaScript: 02(12)+05(4)+06(1)+07(1) = 18ヶ月
            { name: "JavaScript", percent: 46 },
            // Claude Code: brew(1)+02(12) = 13ヶ月 ×1.2補正 = 16ヶ月
            { name: "Claude Code", percent: 41 },
            // Laravel / PHP: 02(12)+03(24)+04(10)+05(4) = 50ヶ月 ×0.3補正 = 15ヶ月
            { name: "Laravel / PHP", percent: 38 },
        ],
    },
    {
        label: "skills",
        heading: "Design",
        note: "デザインカンプ・アイコン制作で実務使用",
        items: [
            // Figma: 05(1)+08(1) = 2ヶ月
            { name: "Figma", percent: 100 },
            // Adobe Illustrator: 03(2) = 2ヶ月
            { name: "Illustrator", percent: 100 },
            // Adobe XD: 03(1) = 1ヶ月
            { name: "Adobe XD", percent: 50 },
        ],
    },
];
