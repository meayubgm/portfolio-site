import { StatBlock } from "portfolio-site";

export function Single() {
  return <StatBlock number="5+" label="years of experience" />;
}

export function Row() {
  return (
    <div style={{ display: "flex", gap: 40 }}>
      <StatBlock number="5+" label="years of experience" />
      <StatBlock number="20+" label="projects shipped" />
      <StatBlock number="10+" label="tech stack" />
    </div>
  );
}
