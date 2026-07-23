export type CaseStudy = {
    no: string;
    title: string;
    period: string;
    summary: string;
    role: string;
    point: string;
    tags: string[];
};

export const cases: CaseStudy[] = [
    {
        no: "02",
        title: "BtoBクラウドストレージサービス開発",
        period: "士業向けBtoBサービス／2023年〜継続中",
        summary:
            "既存サービスのUI改善案件に途中参加。トップページのデザインカンプをAdobe XDで作成し、自らReact/Next.jsで実装まで担当。チーム8名規模。",
        role: "デザインカンプ作成／アイコン制作／詳細設計／フロントエンド実装",
        point: "デザイン制作から実装までを一人で一貫して担当した実績。",
        tags: ["React", "Next.js", "TypeScript", "Material UI", "Laravel"],
    },
    {
        no: "03",
        title: "卸売業向け基幹システム開発",
        period: "卸売業向け基幹システム／2025年〜継続中",
        summary:
            "稼働中の基幹システム開発に途中参加。約20名規模のチームで、フロントエンドのUI改善を中心に対応。",
        role: "フロントエンド／バックエンド開発・修正、追加機能のモック作成",
        point: "大規模チーム（20名）での開発経験、既存システムへの途中参加という難易度の高い状況に対応した実績。",
        tags: ["PHP", "Laravel (Blade)", "Docker", "MySQL"],
    },
    {
        no: "04",
        title: "卸売業向けシステム間連携開発",
        period: "2024年7月〜2025年4月（10ヶ月）",
        summary: "システム間連携機能の開発を担当。モック作成から実装までを一貫して対応。",
        role: "モック作成、フロントエンド／バックエンド開発・修正",
        point: "モック作成から実装までを一貫して担当。",
        tags: ["React", "Tailwind CSS", "Laravel", "MySQL"],
    },
    {
        no: "05",
        title: "建設業向け書類管理システム改修",
        period: "大手建設会社向け／2023年",
        summary:
            "書類管理システムのスマートフォン対応を担当。スマートフォン用デザインの考案からレスポンシブ対応モックの作成、アイコン制作まで対応。",
        role: "スマートフォン用デザイン考案、レスポンシブ対応モック作成、アイコン制作",
        point: "レスポンシブデザインの設計力とUI提案力を示せる案件。",
        tags: ["HTML", "CSS (Tailwind)", "JavaScript", "Illustrator"],
    },
];
