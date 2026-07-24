/** featured（01）— BREW。Home / Works 一覧 / ケーススタディの3ページから参照する単一ソース */
export const brewCase = {
    no: "01",
    titleEn: "Coffee Brew Timer",
    titleJa: "抽出メソッドに合わせて湯を注ぐタイミングまで導くコーヒー抽出タイマー",
    period: "2026年7月",
    summary:
        "豆の量や人数を入力するだけで最適な湯量を自動計算し、4:6メソッド・浸漬式ドリッパーなど複数の抽出法にステップごとのアラームで対応するモバイルアプリ。企画・要件定義・UIデザイン・実装まで一人で担当。",
    tags: [
        "React Native",
        "TypeScript",
        "Tailwind CSS",
        "Expo",
        "Claude Code",
        "PlaywrightMCP",
        "GitHub",
    ],
};

export type OtherWork = {
    name: string;
    tech: string;
};

export const otherWorks: OtherWork[] = [
    {
        name: "求職者支援訓練 アジャストアカデミー Webデザイナー・ディレクター・マーケティング養成科",
        tech: "2022年12月〜2023年5月（6ヵ月）",
    },
];

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
        title: "卸売業向け基幹システム開発",
        period: "2025年5月〜2026年6月(約1年)",
        summary:
            "部分稼働中の基幹システム開発に途中参加。約20名規模のチームで、フロントエンド開発を中心に対応。",
        role: "フロントエンド(Blade)開発・修正／軽微なバックエンド修正／追加機能のモック作成／詳細設計／単体テスト",
        point: "仕様書が実態と乖離している状況で、既存コードから仕様を読み取り上長に確認の上で実装を進めました。またCladeCodeを活用してリファクタリングを計画的に進めました。",
        tags: [
            "JavaScript",
            "PHP",
            "Laravel",
            "Claude Code",
            "Codex",
            "MySQL",
            "Docker",
            "BackLog",
            "SourceTree",
        ],
    },
    {
        no: "03",
        title: "BtoBクラウドストレージサービス開発",
        period: "2023年5月〜2025年5月(2年)",
        summary:
            "クラウドストレージサービス開発案件に途中参加。主にデザイン・アイコン作成・フロントエンド開発を担当。メンバー8名。",
        role: "フロントエンド開発・修正／追加機能の要件定義・基本設計・詳細設計／TOPページのデザインカンプ作成・画像加工／アイコン制作・実装／単体テスト",
        point: "顧客打ち合わせを踏まえた仕様確定への関与、リーダーからの情報をもとにした設計資料作成を担当。",
        tags: [
            "React",
            "Next.js",
            "TypeScript",
            "Material UI",
            "Laravel",
            "MySQL",
            "Docker",
            "BackLog",
            "SourceTree",
            "Adobe XD",
            "Adobe Illustrator",
            "Adobe Photoshop",
            "PowerPoint",
        ],
    },
    {
        no: "04",
        title: "卸売業向けシステム間連携システム開発",
        period: "2024年7月〜2025年4月（10ヵ月）",
        summary:
            "システム間連携システム開発案件のスタートから参加。主にデザイン・フロントエンド開発を担当。メンバー5名。",
        role: "モック作成（React/Tailwind CSS）／詳細設計／フロントエンド・バックエンド開発・修正／単体テスト",
        point: "プロジェクトのスタートから参加し、モック作成から実装までを一貫して担当。",
        tags: [
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Laravel",
            "MySQL",
            "Docker",
            "BackLog",
            "SourceTree",
        ],
    },
    {
        no: "05",
        title: "運送会社ホームページ制作",
        period: "2024年5月〜8月（4ヵ月）",
        summary:
            "運送会社のホームページを制作（2ページ）。デザイン〜設計〜実装まで一貫して一人で担当。",
        role: "基本設計／詳細設計／デザインカンプ作成（Figma）／製造／テスト",
        point: "WordPressでTOPページ・問い合わせフォームを作成、テーマを作成（テキスト・画像カスタマイズ機能、記事投稿機能の実装）。",
        tags: ["PHP", "CSS", "JavaScript", "WordPress", "MySQL", "Figma", "BackLog"],
    },
    {
        no: "06",
        title: "社内向けワークフローシステム モック作成",
        period: "2023年10月",
        summary: "スマートフォンで利用する社内向けワークフローシステムのモックを作成（5ページ）。",
        role: "ログイン画面／ワークフロー一覧／申請内容詳細／新規申請フォーム／申請確認画面の作成",
        point: "ファイルアップロード機能を実装。",
        tags: ["HTML", "Tailwind CSS", "JavaScript"],
    },
    {
        no: "07",
        title: "建設業向け書類管理システム改修",
        period: "2023年10月",
        summary:
            "大手建設会社で運用中の書類管理システムのスマートフォン用デザインを考案・モックを作成（3ページ）、アイコン制作まで対応。メンバー3名。",
        role: "文書一覧／文書詳細／アンケートフォームの作成、アイコン制作",
        point: "スマートフォン用にレスポンシブ対応のデザインを考案し、モックを作成しました。",
        tags: ["HTML", "Tailwind CSS", "JavaScript", "Adobe Illustrator"],
    },
    {
        no: "08",
        title: "水産卸会社向け倉庫管理システム開発",
        period: "2023年7月〜10月（4ヵ月）",
        summary:
            "水産卸会社向けの倉庫管理システムの開発案件に途中参加。主にデザイン・アイコン作成・フロントエンド開発を担当。メンバー2名。",
        role: "フロントエンド開発・修正／詳細設計／アイコン制作・実装／単体テスト",
        point: "Figmaを用いて使用カラーの選定をしました。",
        tags: [
            "React",
            "Next.js",
            "TypeScript",
            "Tailwind CSS",
            "MySQL",
            "Figma",
            "Docker",
            "BackLog",
            "SourceTree",
        ],
    },
];
