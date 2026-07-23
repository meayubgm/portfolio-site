import { SkillBar } from "portfolio-site";

export function Single() {
    return (
        <div style={{ maxWidth: 320 }}>
            <SkillBar name="React" percent={92} />
        </div>
    );
}

export function SkillSet() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320 }}>
            <SkillBar name="React" percent={92} />
            <SkillBar name="TypeScript" percent={88} />
            <SkillBar name="Next.js" percent={80} />
            <SkillBar name="CSS / Tailwind" percent={85} />
            <SkillBar name="Node.js" percent={65} />
        </div>
    );
}
