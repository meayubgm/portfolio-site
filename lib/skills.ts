export type SkillGroup = {
    /** CardLabel に表示する小文字ラベル */
    label: string;
    /** カード見出し */
    heading: string;
    /** 見出し下の補足文 */
    note: string;
    /** description は /skill ページでのみ表示（Home の SkillBar は name / percent のみ使用） */
    items: { name: string; percent: number; description: string }[];
};

export const skillGroups: SkillGroup[] = [
    {
        label: "skills",
        heading: "Development",
        note: "実務での使用経験ベースで記載",
        items: [
            // TypeScript: brew(1)+03(24)+04(10)+08(4) = 39ヶ月
            {
                name: "TypeScript",
                percent: 100,
                description:
                    "受託開発3案件と個人開発で一貫して使用。型定義の設計からAPIレスポンスの整形まで、実装の土台として日常的に扱う。",
            },
            // React / Next.js: 03(24)+04(10)+08(4) = 38ヶ月
            {
                name: "React / Next.js",
                percent: 97,
                description:
                    "BtoBクラウドストレージ・システム間連携システムなどで、機能単位の設計から実装まで担当。当サイトもNext.js 16のApp Routerで構築。",
            },
            // Tailwind CSS: brew(1)+04(10)+06(1)+07(1)+08(4) = 17ヶ月 ×1.2補正 = 20ヶ月
            {
                name: "Tailwind CSS",
                percent: 51,
                description:
                    "モック作成から本番実装まで使用。デザイントークンをテーマ側へ集約し、ユーティリティの命名規則を揃えて運用する進め方をとる。",
            },
            // JavaScript: 02(12)+05(4)+06(1)+07(1) = 18ヶ月
            {
                name: "JavaScript",
                percent: 46,
                description:
                    "Laravel Bladeベースの基幹システムで、既存コードから仕様を読み解きながらフロントエンドの改修を担当。",
            },
            // Claude Code: brew(1)+02(12) = 13ヶ月 ×1.2補正 = 16ヶ月
            {
                name: "Claude Code",
                percent: 41,
                description:
                    "日々の実装・リファクタリング・ドキュメント整備に活用。計画を立ててから着手し、レビュー可能な粒度に分けて進める運用。",
            },
            // Laravel / PHP: 02(12)+03(24)+04(10)+05(4) = 50ヶ月 ×0.3補正 = 15ヶ月
            {
                name: "Laravel / PHP",
                percent: 38,
                description:
                    "フロントエンド担当としての軽微なバックエンド修正・単体テストが中心。画面からDBまでの流れを追える範囲。",
            },
        ],
    },
    {
        label: "skills",
        heading: "Design",
        note: "デザインカンプ・アイコン制作で実務使用",
        items: [
            // Figma: 05(1)+08(1) = 2ヶ月
            {
                name: "Figma",
                percent: 100,
                description:
                    "ホームページのデザインカンプ作成、システムの使用カラー選定に使用。実装を前提としたコンポーネント分解を意識する。",
            },
            // Adobe Illustrator: 03(2) = 2ヶ月
            {
                name: "Illustrator",
                percent: 100,
                description:
                    "業務システム向けのアイコン制作を担当。既存UIのトーンに合わせ、線幅・余白を統一することを重視。",
            },
            // Adobe XD: 03(1) = 1ヶ月
            {
                name: "Adobe XD",
                percent: 50,
                description:
                    "BtoBクラウドストレージサービスのTOPページのデザインカンプ作成に使用。",
            },
        ],
    },
];
