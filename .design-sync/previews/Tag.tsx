import { Tag } from "portfolio-site";

export function Single() {
  return <Tag>TypeScript</Tag>;
}

export function Group() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 360 }}>
      <Tag>React</Tag>
      <Tag>Next.js</Tag>
      <Tag>TypeScript</Tag>
      <Tag>Tailwind CSS</Tag>
      <Tag>Figma</Tag>
    </div>
  );
}
