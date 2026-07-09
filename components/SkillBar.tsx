type SkillBarProps = {
  name: string;
  percent: number;
};

export function SkillBar({ name, percent }: SkillBarProps) {
  return (
    <div className="flex items-center gap-[10px]">
      <span className="w-[88px] shrink-0 text-[12.5px] text-slate">{name}</span>
      <div className="flex-1 h-[5px] overflow-hidden rounded bg-ice-2">
        <div
          className="h-full rounded bg-[linear-gradient(90deg,var(--color-glow-c),var(--color-glow-a))]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
