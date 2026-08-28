import type { ReactNode } from "react";
import { EyebrowLabel } from "@/commons/EyebrowLabel";
import { Text } from "@/commons/Text";
import { cn } from "@/lib/cn";

type PageHeadingProps = {
    /** hero: Home / list: Works 一覧 / detail: ケーススタディ */
    size: "hero" | "list" | "detail";
    eyebrow: ReactNode;
    title: ReactNode;
    period?: ReactNode;
    /** 見出し直下のリード文（Home は構造が異なるため省略可） */
    lead?: ReactNode;
};

// h1 はビューポート幅に応じて伸縮させるため、Text の variant ではなく
// globals.css の @theme に置いた clamp() 付きサイズトークン（text-hero 等）を使う
const styles = {
    hero: {
        eyebrow: "pb-5.5",
        h1: "text-hero",
    },
    list: {
        eyebrow: "mb-4.5",
        h1: "mb-4.5 text-page",
    },
    detail: {
        eyebrow: "mb-4.5",
        h1: "mb-5 text-detail",
    },
} as const;

/** detail だけリード文の下にタグ列が続くため余白を足す */
const leadSpacing = { hero: "", list: "", detail: "mb-6" } as const;

export function PageHeading({ size, eyebrow, title, period, lead }: PageHeadingProps) {
    const s = styles[size];
    return (
        <>
            <div className={s.eyebrow}>
                <EyebrowLabel>{eyebrow}</EyebrowLabel>
            </div>
            <h1 className={cn("font-display font-medium tracking-heading", s.h1)}>{title}</h1>
            {period && (
                <Text variant="monoLg" tone="muted" className="mb-3">
                    {period}
                </Text>
            )}
            {lead && (
                <Text variant="lead" className={cn("text-left", leadSpacing[size])}>
                    {lead}
                </Text>
            )}
        </>
    );
}
