/** Home のスキルカード用のバー行（/skills はバーを出さず SkillName を使う） */
type SkillBarProps = {
    name: string;
    percent: number;
};

export function SkillBar({ name, percent }: SkillBarProps) {
    return (
        <div className="flex items-center gap-2.5">
            <span className="w-30 shrink-0 text-[12.5px] text-slate-900">{name}</span>
            <div className="flex-1 h-1.25 overflow-hidden rounded bg-slate-200">
                <div
                    className="h-full rounded bg-linear-to-r from-sky-700 to-blue-300"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
