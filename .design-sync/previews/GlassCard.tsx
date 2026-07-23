import { CardLabel, GlassCard, Tag } from "portfolio-site";

// GlassCard は frost（半透明 + backdrop-blur + 淡い境界）が本体なので、
// 実サイト同様に slate-50 の背景の上へ置いて見えるようにする。
function Stage({ children }: { children: React.ReactNode }) {
    return <div style={{ background: "#f8fafc", padding: 32, maxWidth: 480 }}>{children}</div>;
}

export function Default() {
    return (
        <Stage>
            <GlassCard>
                <CardLabel>Case Study</CardLabel>
                <h3 style={{ margin: "0 0 10px", fontSize: 18, color: "#0f172b" }}>
                    コーヒー抽出タイマー
                </h3>
                <p style={{ margin: "0 0 16px", fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
                    レシピに沿って抽出をガイドする Web アプリ。
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Tag>React</Tag>
                    <Tag>TypeScript</Tag>
                    <Tag>PWA</Tag>
                </div>
            </GlassCard>
        </Stage>
    );
}

export function LargePadding() {
    return (
        <Stage>
            <GlassCard padding="lg">
                <CardLabel>Profile</CardLabel>
                <p style={{ margin: 0, fontSize: 15, color: "#334155", lineHeight: 1.8 }}>
                    要件のヒアリングから、デザインと実装まで。フロントエンドを軸に、
                    プロダクトの体験全体を設計します。
                </p>
            </GlassCard>
        </Stage>
    );
}

export function AsLink() {
    return (
        <Stage>
            <GlassCard href="/works/brew">
                <CardLabel>Selected Work</CardLabel>
                <h3 style={{ margin: 0, fontSize: 17, color: "#0f172b" }}>
                    カード全体がリンク（href 指定）
                </h3>
            </GlassCard>
        </Stage>
    );
}
