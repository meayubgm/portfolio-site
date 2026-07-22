type StatBlockProps = {
  number: string;
  label: string;
};

export function StatBlock({ number, label }: StatBlockProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-display text-[17px] font-semibold text-slate-900">{number}</span>
      <span className="text-[11.5px] text-slate-500">{label}</span>
    </div>
  );
}
