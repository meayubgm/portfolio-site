import type { ReactNode } from "react";
import { Text } from "./Text";

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
            <Text variant="monoSm" tone="accent" className="mb-1">
                {label}
            </Text>
            <Text variant="body">{children}</Text>
        </div>
    );
}
