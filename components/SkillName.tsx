/** /skills のスキル名（バー無し・mono / indigo） */
export function SkillName({ name }: { name: string }) {
    return <span className="font-mono text-[12.5px] text-indigo-600">{name}</span>;
}
