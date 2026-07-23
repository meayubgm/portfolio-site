import { PageHeading } from "portfolio-site";

export function Hero() {
    return (
        <PageHeading
            size="hero"
            eyebrow="design × development"
            title="意図を汲みとって、かたちにする"
        />
    );
}

export function ListWithLead() {
    return (
        <PageHeading
            size="list"
            eyebrow="works — 見せられる情報の質が高い順"
            title="実績一覧"
            lead="受託案件は契約上、画面キャプチャを掲載できないため、業務内容を匿名化したテキストベースのケーススタディとして掲載しています。"
        />
    );
}

export function Detail() {
    return (
        <PageHeading
            size="detail"
            eyebrow="01 — 個人開発"
            title="Coffee Brew Timer"
            lead="抽出メソッドに合わせて湯を注ぐタイミングまで導くコーヒータイマー。"
        />
    );
}
