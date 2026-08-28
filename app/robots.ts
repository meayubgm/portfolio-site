import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // 唯一の動的ルート（お問い合わせ送信）はクロール対象にしない
            disallow: "/api/",
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
