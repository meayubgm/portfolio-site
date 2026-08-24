import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Text, type TextVariant } from "./Text";

type BulletListProps = {
    children: ReactNode;
    /** 本文サイズ。既定はケーススタディのリード文と同じ lead */
    variant?: Extract<TextVariant, "lead" | "body">;
    className?: string;
};

/** 中黒付きの箇条書き。preflight でリスト記号が消えるため list-disc とインデントを明示する */
export function BulletList({ children, variant = "lead", className }: BulletListProps) {
    return (
        <Text as="ul" variant={variant} className={cn("list-disc pl-5", className)}>
            {children}
        </Text>
    );
}
