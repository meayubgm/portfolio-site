export type SkillItem = {
    name: string;
    /**
     * percent を持つ項目だけが Home のスキルカードに載り、その値が SkillBar の長さになる。
     * percent を省略した項目は Home に出ない。
     * /skills は percent の有無にかかわらず全項目を名前（SkillName）＋説明で表示する。
     */
    percent?: number;
    /** Home のバーでだけ使う表示名（例: React と Next.js をまとめて1本にする） */
    homeName?: string;
    /** description は /skills ページでのみ表示する */
    description: string;
};

/** カード内の分類。heading を省略すると見出し無しの単一セクションになる（Design / Tools） */
export type SkillSection = {
    heading?: string;
    /** layout.columns が 2 のとき、どちらの列に置くか（既定は 1） */
    column?: 1 | 2;
    items: SkillItem[];
};

export type SkillGroup = {
    /** /skills でカードに付けるアンカー用の slug（Home からのハッシュ遷移先） */
    id: string;
    /** CardLabel に表示する小文字ラベル */
    label: string;
    /** カード見出し */
    heading: string;
    /** 見出し下の補足文（Home のカード用。/skills は skillsNote があればそちらを使う） */
    note: string;
    /** /skills でだけ使う補足文。カードごとの守備範囲を明示したいときに指定する */
    skillsNote?: string;
    /** /skills でのカード幅（lg 以上の CardGrid は 6 カラム）とセクションの列数。
        span は GlassCard の GridColumn と同じレンジ（lib は commons を import しないので値で持つ） */
    layout: { span: 1 | 2 | 3 | 4 | 5 | 6; columns: 1 | 2 };
    sections: SkillSection[];
};

/** Home のスキルカードに載る項目（percent が確定しているもの） */
export type HomeSkillItem = SkillItem & { percent: number };

/** Home のスキルカード用のグループ（セクションを畳んだフラットな items を持つ） */
export type HomeSkillGroup = Omit<SkillGroup, "sections" | "layout"> & {
    items: HomeSkillItem[];
};

export const skillGroups: SkillGroup[] = [
    {
        id: "development",
        label: "skills",
        heading: "Development",
        note: "実務/個人開発での使用経験月数を基準にした相対値",
        skillsNote: "実装に使う言語・フレームワーク／ライブラリと、開発を進めるうえでのAI活用",
        layout: { span: 6, columns: 2 },
        sections: [
            {
                heading: "frontend",
                column: 1,
                items: [
                    {
                        name: "HTML",
                        description:
                            "セマンティックなマークアップを意識し、見出し構造やフォームが支援技術から辿れる形を基本としています。",
                    },
                    {
                        name: "CSS",
                        description:
                            "レイアウト実装全般で使用。Flexbox / Gridでの組み方や、既存スタイルへの影響を抑えた修正を行っています。",
                    },
                    // JavaScript: TypeScript のバーに集約するため Home には出さない（percent 無し）
                    {
                        name: "JavaScript",
                        description:
                            "Laravel（Blade）の基幹システム開発で、既存コードから仕様を読み解きながらフロントエンドの改修を担当しました。",
                    },
                    // TypeScript: brew(1)+03(24)+04(10)+08(4) = 39ヶ月
                    {
                        name: "TypeScript",
                        percent: 100,
                        description:
                            "受託開発案件と個人開発で使用。型定義の設計からAPIレスポンスの整形まで、実装の土台として日常的に扱っています。",
                    },
                    // React: 03(24)+04(10)+08(4) = 38ヶ月
                    {
                        name: "React",
                        percent: 97,
                        // Home では Next.js と1本のバーにまとめる
                        homeName: "React / Next.js",
                        description:
                            "受託開発案件(システム間連携システム)等で、機能単位の設計から実装まで担当しました。",
                    },
                    // Next.js: React と同期間。Home では React のバーにまとめるため percent は持たせない
                    {
                        name: "Next.js",
                        description:
                            "受託開発案件(BtoBクラウドストレージ等)と個人開発で使用。当サイトもNext.js 16のApp Routerを用いて構築し、お問い合わせの送信以外は静的生成にしています。",
                    },
                    // Tailwind CSS: brew(1)+04(10)+06(1)+07(1)+08(4) = 17ヶ月 ×1.2補正 = 20ヶ月
                    {
                        name: "Tailwind CSS",
                        percent: 51,
                        description:
                            "受託開発案件(モック作成〜実装段階)と個人開発で使用。当サイトではデザイントークンをテーマ側へ集約し、ユーティリティの命名規則を揃えて運用しています。",
                    },
                    {
                        name: "Material UI",
                        description:
                            "受託開発案件の管理画面で使用。テーマ設定でトーンを揃えつつ、コンポーネントをカスタマイズしました。",
                    },
                ],
            },
            {
                heading: "backend",
                column: 2,
                items: [
                    // PHP: Laravel のバーに集約するため Home には出さない（percent 無し）
                    {
                        name: "PHP",
                        description: "WordPressテーマのカスタマイズなどで使用しました。",
                    },
                    // Laravel: PHP と同期間
                    {
                        name: "Laravel",
                        percent: 38,
                        description:
                            "基幹システム・業務システムの開発で使用。フロントエンド開発がメインとなりますが、軽微なバックエンド開発・修正（CRUDなど）を担当しました。",
                    },
                    {
                        name: "MySQL",
                        description:
                            "業務システムの開発で、テーブル定義の確認やSQLでのデータ調査に使用しました。画面からDBまでの流れを追うことはできます。",
                    },
                ],
            },
            {
                heading: "AI",
                column: 2,
                items: [
                    // Claude Code: brew(1)+02(12) = 13ヶ月 ×1.2補正 = 16ヶ月
                    {
                        name: "Claude Code",
                        percent: 41,
                        description:
                            "日々の実装・リファクタリング・ドキュメント整備に活用。計画を立ててから着手し、レビュー可能な粒度に分けて進める運用をとっています。",
                    },
                    {
                        name: "Codex",
                        description:
                            "3ヶ月ほどお試しで使用しました。今はClaude Codeをメインで使用しています。",
                    },
                ],
            },
        ],
    },
    {
        id: "design",
        label: "skills",
        heading: "Design",
        note: "デザインカンプ・アイコン制作で実務使用",
        layout: { span: 3, columns: 1 },
        sections: [
            {
                items: [
                    // Figma: 05(1)+08(1) = 2ヶ月
                    {
                        name: "Figma",
                        percent: 100,
                        description:
                            "ホームページのデザインカンプ作成、システムの使用カラー選定に使用。実装を前提としたコンポーネント分解を意識して制作しました。",
                    },
                    // Adobe XD: 03(1) = 1ヶ月
                    {
                        name: "Adobe XD",
                        percent: 50,
                        description:
                            "BtoBクラウドストレージサービスのTOPページのデザインカンプ作成に使用しました。",
                    },
                    // Adobe Illustrator: 03(2) = 2ヶ月
                    {
                        name: "Adobe Illustrator",
                        percent: 100,
                        description:
                            "業務システム向けのアイコン制作を担当。既存UIのトーンに合わせ、線幅・余白を統一することを重視して制作しました。",
                    },
                    // Photoshop: 1ヶ月
                    {
                        name: "Adobe Photoshop",
                        percent: 50,
                        description: "ホームページの画像補正・リサイズ等に使用しています。",
                    },
                ],
            },
        ],
    },
    {
        id: "tools",
        label: "skills",
        heading: "Tools",
        note: "開発を支えるツール・インフラ",
        skillsNote: "環境構築・バージョン管理・課題管理など、実装の周辺を支えるツール",
        layout: { span: 3, columns: 1 },
        sections: [
            {
                items: [
                    {
                        name: "Docker",
                        description:
                            "開発環境の構築に使用。当サイトもDocker Composeで環境を統一しています。",
                    },
                    {
                        name: "SourceTree",
                        description: "Git操作のGUIクライアントとして使用しました。",
                    },
                    {
                        name: "Git",
                        description:
                            "日常的なバージョン管理に使用。ブランチを切って作業し、コンフリクトの解消まで行います。",
                    },
                    {
                        name: "GitHub",
                        description:
                            "個人開発で使用。当サイトのリポジトリもGitHubで管理しています。",
                    },
                    {
                        name: "Backlog",
                        description:
                            "受託開発案件の課題管理・進捗共有に使用しました。プルリクエストベースのレビュー運用で使用。",
                    },
                    {
                        name: "WordPress",
                        description:
                            "ホームページの制作・運用で使用。テーマの調整や記事投稿まわりの改修を担当しました。",
                    },
                ],
            },
        ],
    },
];

/** Home のスキルカード用。セクションを畳み、percent を持つ項目だけを残す（並びはデータのまま） */
export const homeSkillGroups: HomeSkillGroup[] = skillGroups
    .map(({ sections, layout: _layout, ...g }) => ({
        ...g,
        items: sections
            .flatMap((s) => s.items)
            .filter((s): s is HomeSkillItem => s.percent !== undefined)
            .map((s) => ({ ...s, name: s.homeName ?? s.name })),
    }))
    .filter((g) => g.items.length > 0);
