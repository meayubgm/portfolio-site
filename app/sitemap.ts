import type { MetadataRoute } from "next";
import { sitePaths, siteUrl } from "@/lib/site";

/**
 * サイトマップ。ルートの一覧は lib/site.ts が単一ソースなので、
 * **ページを増やしたら `sitePaths` に足す**（ここは触らなくてよい）。
 */
export default function sitemap(): MetadataRoute.Sitemap {
    return sitePaths.map((path) => ({
        url: `${siteUrl}${path}`,
        // lastModified は持たない。ビルド時刻を入れると内容が変わらないデプロイでも
        // 全 URL の <lastmod> が更新され、当てにならない値としてクローラに無視される
        changeFrequency: "monthly",
        // トップだけ優先度を上げ、他は既定値
        priority: path === "/" ? 1 : 0.8,
    }));
}
