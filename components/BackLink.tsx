import Link from "next/link";
import type { ReactNode } from "react";

type BackLinkProps = {
    /** 戻り先のパス */
    href: string;
    /** 「← 」に続くラベル（例: home に戻る） */
    children: ReactNode;
};

/** ページ左上に置く1つ上の階層への戻りリンク。 */
export function BackLink({ href, children }: BackLinkProps) {
    return (
        <div className="pt-24">
            <Link
                href={href}
                className="font-mono text-[12.5px] text-indigo-600 transition-colors hover:text-sky-700"
            >
                ← {children}
            </Link>
        </div>
    );
}
