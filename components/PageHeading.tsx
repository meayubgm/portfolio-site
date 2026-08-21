import type { ReactNode } from "react";
import { EyebrowLabel } from "@/commons/EyebrowLabel";
import { Text } from "@/commons/Text";

type PageHeadingProps = {
    /** hero: Home / list: Works 一覧 / detail: ケーススタディ */
    size: "hero" | "list" | "detail";
    eyebrow: ReactNode;
    title: ReactNode;
    period?: ReactNode;
    /** 見出し直下のリード文（Home は構造が異なるため省略可） */
    lead?: ReactNode;
};

// h1 はビューポート幅に応じて伸縮させるため、Text の variant ではなく clamp() を直接指定する
const styles = {
    hero: {
        eyebrow: "pb-5.5",
        h1: "text-[clamp(38px,5.4vw,60px)] leading-[1.14]",
    },
    list: {
        eyebrow: "mb-4.5",
        h1: "mb-4.5 text-[clamp(34px,4.5vw,52px)] leading-[1.15]",
    },
    detail: {
        eyebrow: "mb-4.5",
        h1: "mb-5 text-[clamp(30px,4vw,44px)] leading-tight",
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
            <h1 className={`font-display font-medium tracking-heading ${s.h1}`}>{title}</h1>
            {period ? (
                <Text variant="monoLg" tone="muted" className="mb-3">
                    {period}
                </Text>
            ) : null}
            {lead ? (
                <Text variant="lead" className={leadSpacing[size]}>
                    {lead}
                </Text>
            ) : null}
        </>
    );
}
