import { CardGrid, CardLabel, GlassCard } from "portfolio-site";

export function TwoCards() {
    return (
        <CardGrid>
            <GlassCard span={4} padding="lg">
                <CardLabel>about</CardLabel>
                <p style={{ margin: 0 }}>span 4 のワイドカード。6 カラムグリッドに配置される。</p>
            </GlassCard>
            <GlassCard span={2}>
                <CardLabel>featured</CardLabel>
                <p style={{ margin: 0 }}>span 2 のカード。</p>
            </GlassCard>
        </CardGrid>
    );
}

export function ThreeColumns() {
    return (
        <CardGrid>
            <GlassCard span={2}>
                <CardLabel>development</CardLabel>
                <p style={{ margin: 0 }}>span 2</p>
            </GlassCard>
            <GlassCard span={2}>
                <CardLabel>design</CardLabel>
                <p style={{ margin: 0 }}>span 2</p>
            </GlassCard>
            <GlassCard span={2}>
                <CardLabel>contact</CardLabel>
                <p style={{ margin: 0 }}>span 2</p>
            </GlassCard>
        </CardGrid>
    );
}
