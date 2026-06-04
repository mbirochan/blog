import type { MetadataRoute } from "next"
import { supabase } from "@/lib/supabase"
import { getCanonicalUrl } from "@/lib/seo"

type SitemapPost = {
  slug: string
  created_at: string
  updated_at?: string | null
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: getCanonicalUrl("/featured"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]

  if (!supabase) {
    return routes
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("slug, created_at, updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false, nullsFirst: false })

    if (error) {
      console.error("Error generating sitemap:", error)
      return routes
    }

    const posts = (data || []) as SitemapPost[]

    return [
      ...routes,
      ...posts.map((post) => ({
        url: getCanonicalUrl(`/blog/${post.slug}`),
        lastModified: post.updated_at || post.created_at,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ]
  } catch (error) {
    console.error("Sitemap generation failed:", error)
    return routes
  }
}
