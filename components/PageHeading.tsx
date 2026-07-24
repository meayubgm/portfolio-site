import type { ReactNode } from "react";
import { EyebrowLabel } from "./EyebrowLabel";

type PageHeadingProps = {
    /** hero: Home / list: Works 一覧 / detail: ケーススタディ */
    size: "hero" | "list" | "detail";
    eyebrow: ReactNode;
    title: ReactNode;
    period?: ReactNode;
    /** 見出し直下のリード文（Home は構造が異なるため省略可） */
    lead?: ReactNode;
};

const styles = {
    hero: {
        eyebrow: "pb-5.5",
        h1: "text-[clamp(38px,5.4vw,60px)] leading-[1.14]",
        lead: "",
    },
    list: {
        eyebrow: "mb-4.5",
        h1: "mb-4.5 text-[clamp(34px,4.5vw,52px)] leading-[1.15]",
        lead: "text-base",
    },
    detail: {
        eyebrow: "mb-4.5",
        h1: "mb-5 text-[clamp(30px,4vw,44px)] leading-tight",
        lead: "mb-6 text-base",
    },
} as const;

export function PageHeading({ size, eyebrow, title, period, lead }: PageHeadingProps) {
    const s = styles[size];
    return (
        <>
            <div className={s.eyebrow}>
                <EyebrowLabel>{eyebrow}</EyebrowLabel>
            </div>
            <h1 className={`m-0 font-display font-medium tracking-heading ${s.h1}`}>{title}</h1>
            {period ? (
                <p className="m-0 mb-3 font-mono text-base text-slate-500">{period}</p>
            ) : null}
            {lead ? <p className={`m-0 leading-[1.8] text-slate-600 ${s.lead}`}>{lead}</p> : null}
        </>
    );
}
