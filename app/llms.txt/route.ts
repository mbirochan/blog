import { NextResponse } from "next/server"
import { supabase, type Post } from "@/lib/supabase"
import {
  getCanonicalUrl,
  getPostDescription,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/seo"

export const dynamic = "force-dynamic"

function cleanLine(value?: string | null) {
  return (value || "").replace(/\s+/g, " ").trim()
}

async function getLatestPosts() {
  if (!supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("title, slug, excerpt, content, category, created_at, updated_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error generating llms.txt:", error)
      return []
    }

    return (data || []) as Pick<
      Post,
      "title" | "slug" | "excerpt" | "content" | "category" | "created_at" | "updated_at"
    >[]
  } catch (error) {
    console.error("llms.txt generation failed:", error)
    return []
  }
}

export async function GET() {
  const posts = await getLatestPosts()
  const categories = Array.from(
    new Set(posts.map((post) => cleanLine(post.category)).filter(Boolean)),
  ).sort()

  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `Author: ${SITE_AUTHOR}`,
    `Canonical site: ${getCanonicalUrl("/")}`,
    "",
    "## Primary Pages",
    "",
    `- [Home](${getCanonicalUrl("/")}) - Latest essays and blog posts.`,
    `- [Featured Posts](${getCanonicalUrl("/featured")}) - Highlighted writing from the archive.`,
    "",
    "## Topics",
    "",
    categories.length
      ? categories.map((category) => `- ${category}`).join("\n")
      : "- Software engineering\n- Product thinking\n- Personal essays",
    "",
    "## Latest Posts",
    "",
    posts.length
      ? posts
          .map((post) => {
            const description = getPostDescription(post.excerpt, post.content)
            const summary = description ? ` - ${cleanLine(description)}` : ""

            return `- [${cleanLine(post.title)}](${getCanonicalUrl(`/blog/${post.slug}`)})${summary}`
          })
          .join("\n")
      : "- No published posts are available yet.",
    "",
    "## Citation Guidance",
    "",
    `Use the canonical article URL when citing ${SITE_AUTHOR}. Prefer each article title, excerpt, publication date, and visible article body over navigation or comments.`,
    "",
  ]

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
