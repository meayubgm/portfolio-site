import type { Metadata } from "next";
import { fullTitle, OG_IMAGE_ALT, OG_IMAGE_PATH, siteName, siteUrl } from "@/lib/site";

type PageMetadataInput = {
    /** サイト内のパス（先頭スラッシュ付き）。canonical と og:url に使う */
    path: string;
    /**
     * ページ固有のタイトル。ルートレイアウトの `title.template` に載るので、
     * 「実績一覧」のように**短い側だけ**を渡す（区切り文字はテンプレートが持つ）。
     */
    title: string;
    description: string;
};

/**
 * ページの metadata を組み立てる。
 *
 * title / description / canonical / OGP をまとめて返し、各ページはこれを呼ぶだけにする
 * （書き漏らしと表記ゆれを防ぐ）。
 *
 * **`openGraph` は「足す」ではなく「丸ごと置き換え」になる。** ページ側で持った時点で
 * `app/layout.tsx` の openGraph は1つも継承されないので、`type` / `locale` / `siteName` /
 * og:image まで**ここで全部書き直す**。減らすと該当のタグだけが5ページから静かに消える
 * （`e2e/smoke.spec.ts` が見張っている）。
 */
export function pageMetadata({ path, title, description }: PageMetadataInput): Metadata {
    return {
        title,
        description,
        alternates: { canonical: path },
        openGraph: {
            type: "website",
            locale: "ja_JP",
            siteName,
            title: fullTitle(title),
            description,
            url: `${siteUrl}${path}`,
            images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: OG_IMAGE_ALT }],
        },
    };
}
