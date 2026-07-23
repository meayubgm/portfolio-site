import { MonoHeading } from "portfolio-site";

export function Single() {
    return <MonoHeading>{"// 開発背景・課題設定"}</MonoHeading>;
}

export function WithBody() {
    return (
        <div style={{ maxWidth: 480 }}>
            <MonoHeading>{"// 技術選定"}</MonoHeading>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.9 }}>
                セクション見出しとして本文の上に置く。mono フォント + indigo
                がケーススタディの章立てを示す。
            </p>
        </div>
    );
}
