import type { ReactNode } from "react";
import { EyebrowLabel } from "./EyebrowLabel";

type PageHeadingProps = {
    /** hero: Home / list: Works 一覧 / detail: ケーススタディ */
    size: "hero" | "list" | "detail";
    eyebrow: ReactNode;
    title: ReactNode;
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
        lead: "max-w-155 text-[15.5px]",
    },
    detail: {
        eyebrow: "mb-4.5",
        h1: "mb-5 max-w-215 text-[clamp(30px,4vw,44px)] leading-tight",
        lead: "mb-6 max-w-170 text-[15.5px]",
    },
} as const;

export function PageHeading({ size, eyebrow, title, lead }: PageHeadingProps) {
    const s = styles[size];
    return (
        <>
            <div className={s.eyebrow}>
                <EyebrowLabel>{eyebrow}</EyebrowLabel>
            </div>
            <h1 className={`m-0 font-display font-medium tracking-heading ${s.h1}`}>{title}</h1>
            {lead ? <p className={`m-0 leading-[1.8] text-slate-600 ${s.lead}`}>{lead}</p> : null}
        </>
    );
}
