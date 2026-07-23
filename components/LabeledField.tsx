import type { ReactNode } from "react";

type LabeledFieldProps = {
    /** mono 表示のラベル（例: "// role"） */
    label: string;
    children: ReactNode;
    className?: string;
};

/** 破線区切り + mono ラベル + 本文のフィールド行（ケーススタディカードの role / point 等） */
export function LabeledField({ label, children, className = "" }: LabeledFieldProps) {
    return (
        <div className={`border-t border-dashed border-indigo-600/15 py-3 ${className}`}>
            <p className="m-0 mb-1 font-mono text-[11px] text-indigo-600">{label}</p>
            <p className="m-0 text-[13.5px] leading-[1.6] text-slate-600">{children}</p>
        </div>
    );
}
