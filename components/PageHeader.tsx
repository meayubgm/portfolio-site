import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { HeroGeometry, type HeroGeometryPage } from "./HeroGeometry";
import { PageHeading } from "./PageHeading";

type PageHeaderProps = ComponentProps<typeof PageHeading> & {
    /** header 要素に足すクラス（グリッドに乗せる場合の col-span 等） */
    className?: string;
    /** 見出しブロックの後ろに続けるコンテンツ */
    children?: ReactNode;
    /** 背後に置く正多面体のワイヤーフレーム。渡さないページ（/contact）には出ない */
    geometry?: HeroGeometryPage;
};

/** 一覧系ページ共通の見出しブロック（戻りリンクの下、カードグリッドの上） */
export function PageHeader({ className, children, geometry, ...heading }: PageHeaderProps) {
    return (
        <header className={cn("pt-10 pb-12", className)}>
            {geometry && <HeroGeometry page={geometry} />}
            <PageHeading {...heading} />
            {children}
        </header>
    );
}
