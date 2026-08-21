import Link from "next/link";
import type { ReactNode } from "react";
import { Text } from "./Text";

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
            <Text
                as={Link}
                href={href}
                variant="monoSm"
                tone="accent"
                className="transition-colors hover:text-sky-700"
            >
                ← {children}
            </Text>
        </div>
    );
}
