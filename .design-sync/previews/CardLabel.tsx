import { CardLabel } from "portfolio-site";

export function Default() {
    return <CardLabel>Case Study</CardLabel>;
}

export function Section() {
    return <CardLabel>Profile</CardLabel>;
}

export function InContext() {
    return (
        <div style={{ maxWidth: 320 }}>
            <CardLabel>Selected Work</CardLabel>
            <p style={{ margin: 0, fontSize: 15, color: "#334155", lineHeight: 1.7 }}>
                受託案件のケーススタディを匿名化して掲載しています。
            </p>
        </div>
    );
}
