import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PageHeading } from "./PageHeading";

type PageHeaderProps = ComponentProps<typeof PageHeading> & {
    /** header 要素に足すクラス（グリッドに乗せる場合の col-span 等） */
    className?: string;
    /** 見出しブロックの後ろに続けるコンテンツ */
    children?: ReactNode;
};

/** 一覧系ページ共通の見出しブロック（戻りリンクの下、カードグリッドの上） */
export function PageHeader({ className, children, ...heading }: PageHeaderProps) {
    return (
        <header className={cn("pt-10 pb-12", className)}>
            <PageHeading {...heading} />
            {children}
        </header>
    );
}
