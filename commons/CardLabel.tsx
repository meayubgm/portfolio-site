import type { ReactNode } from "react";
import { Text } from "./Text";

type CardLabelProps = {
    children: ReactNode;
    /** 右端に添える補足（ケーススタディの通し番号など）。渡すと1行の両端揃えになる */
    meta?: ReactNode;
};

export function CardLabel({ children, meta }: CardLabelProps) {
    const label = (
        <Text
            as="span"
            variant="monoSm"
            tone="accent"
            className="block mb-3.5 uppercase tracking-label"
        >
            {children}
        </Text>
    );

    if (!meta) {
        return label;
    }

    return (
        <div className="flex items-start justify-between">
            {label}
            <Text as="span" variant="monoSm" tone="muted">
                {meta}
            </Text>
        </div>
    );
}
