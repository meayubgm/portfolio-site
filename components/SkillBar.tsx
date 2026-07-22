type SkillBarProps = {
  name: string;
  percent: number;
};

export function SkillBar({ name, percent }: SkillBarProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-22 shrink-0 text-[12.5px] text-slate">{name}</span>
      <div className="flex-1 h-1.25 overflow-hidden rounded bg-ice-2">
        <div
          className="h-full rounded bg-[linear-gradient(90deg,var(--color-glow-c),var(--color-glow-a))]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
