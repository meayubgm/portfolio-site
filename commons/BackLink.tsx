import Link from "next/link";
import type { ReactNode } from "react";
import { Text } from "./Text";

type BackLinkProps = {
    /** 戻り先のパス */
    href: string;
    /** 「← 」に続くラベル（例: back to home） */
    children: ReactNode;
};

/**
 * ページ末尾の左下に置く戻りリンク。
 * 画面上部にいる間は SiteNav のロゴから home へ戻れるので、こちらは読み終えた位置で次の行き先を示す。
 */
export function BackLink({ href, children }: BackLinkProps) {
    return (
        <div className="pt-12">
            <Text
                as={Link}
                href={href}
                variant="monoSm"
                tone="accent"
                className="group relative inline-block"
            >
                ← {children}
                {/* SiteNav のリンクと同じ導線サイン。ホバーでは色を変えず、末尾に「+」を出すだけ。
                    絶対配置でラベルを動かさない。aria-hidden でアクセシブルネームには載せない */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute -right-3.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
                >
                    +
                </span>
            </Text>
        </div>
    );
}
