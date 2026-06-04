import type { MetadataRoute } from "next"
import { getCanonicalUrl, getSiteUrl } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api", "/api/", "/profile", "/settings", "/signin"],
    },
    sitemap: getCanonicalUrl("/sitemap.xml"),
    host: getSiteUrl(),
  }
}
