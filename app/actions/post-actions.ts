"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { randomUUID } from "crypto"

import { supabase } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/admin"
import { auth } from "@/lib/auth"

const ALLOWED_CONTENT_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "em",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "strong",
  "u",
  "ul",
])

const VOID_CONTENT_TAGS = new Set(["br"])

const STRIP_CONTENT_BLOCKS = /<\s*(script|style|iframe|object|embed|svg|math)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi
const HTML_TOKEN = /<!--[\s\S]*?-->|<\/?[^>]+>/g
const ATTRIBUTE_TOKEN = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

function escapeHtml(value: string) {
  return value
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]+|#\d+|#x[\da-fA-F]+);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function sanitizeHref(value: string) {
  const href = value.trim()
  const compact = href.replace(/[\u0000-\u001f\u007f\s]+/g, "").toLowerCase()

  if (
    (href.startsWith("/") && !href.startsWith("//")) ||
    href.startsWith("#") ||
    compact.startsWith("http://") ||
    compact.startsWith("https://") ||
    compact.startsWith("mailto:") ||
    compact.startsWith("tel:")
  ) {
    return href
  }

  return ""
}

function sanitizeContentTag(token: string) {
  const match = token.match(/^<\s*(\/)?\s*([a-zA-Z0-9-]+)([\s\S]*?)\/?\s*>$/)

  if (!match) {
    return ""
  }

  const [, closingSlash, rawTagName, rawAttributes] = match
  const tagName = rawTagName.toLowerCase()

  if (!ALLOWED_CONTENT_TAGS.has(tagName)) {
    return ""
  }

  if (closingSlash) {
    return VOID_CONTENT_TAGS.has(tagName) ? "" : `</${tagName}>`
  }

  if (VOID_CONTENT_TAGS.has(tagName)) {
    return `<${tagName} />`
  }

  const attributes: string[] = []

  if (tagName === "a") {
    ATTRIBUTE_TOKEN.lastIndex = 0
    let attributeMatch: RegExpExecArray | null

    while ((attributeMatch = ATTRIBUTE_TOKEN.exec(rawAttributes))) {
      const attributeName = attributeMatch[1].toLowerCase()
      const attributeValue =
        attributeMatch[2] ?? attributeMatch[3] ?? attributeMatch[4] ?? ""

      if (attributeName === "href") {
        const href = sanitizeHref(attributeValue)

        if (href) {
          attributes.push(`href="${escapeHtml(href)}"`)
        }
      }

      if (attributeName === "title" && attributeValue) {
        attributes.push(`title="${escapeHtml(attributeValue)}"`)
      }
    }

    if (attributes.some((attribute) => attribute.startsWith("href="))) {
      attributes.push('rel="noopener noreferrer"')
    }
  }

  return attributes.length > 0
    ? `<${tagName} ${attributes.join(" ")}>`
    : `<${tagName}>`
}

function sanitizePostContent(html: string) {
  const withoutBlockedContent = html.replace(STRIP_CONTENT_BLOCKS, "")
  let sanitized = ""
  let lastIndex = 0

  for (const match of withoutBlockedContent.matchAll(HTML_TOKEN)) {
    sanitized += escapeHtml(withoutBlockedContent.slice(lastIndex, match.index))
    sanitized += sanitizeContentTag(match[0])
    lastIndex = (match.index ?? 0) + match[0].length
  }

  sanitized += escapeHtml(withoutBlockedContent.slice(lastIndex))

  return sanitized
}

function normalizeSlug(input: string, fallback = "") {
  const base = (input || fallback || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return base || `post-${randomUUID()}`
}

function formatContent(raw: string): string {
  const base = raw.trim()

  if (!base) {
    return ""
  }

  if (/<[^>]+>/.test(base)) {
    return sanitizePostContent(base)
  }

  return base
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, "<br />")}</p>`)
    .join("")
}

export async function savePost(formData: FormData) {
  const session = await auth()

  if (!session?.user) {
    return { error: "You must be logged in" }
  }

  if (!(await verifyAdmin(session.user))) {
    return { error: "You do not have permission to manage posts" }
  }

  const id = ((formData.get("id") as string) || "").trim()
  const title = ((formData.get("title") as string) || "").trim()
  const rawSlug = ((formData.get("slug") as string) || "").trim()
  const excerpt = ((formData.get("excerpt") as string) || "").trim()
  const category = ((formData.get("category") as string) || "").trim()
  const imageUrl = ((formData.get("imageUrl") as string) || "").trim()
  const content = (formData.get("content") as string) || ""
  const published = formData.get("published") === "true"
  const featuredValue = formData.get("featured")
  const featured =
    featuredValue === "true" ||
    featuredValue === "on" ||
    featuredValue === "1"

  const slug = normalizeSlug(rawSlug, title)
  const normalizedContent = formatContent(content)

  if (!title || !slug || !normalizedContent || !excerpt) {
    return { error: "Missing required fields" }
  }

  if (!supabase) {
    return { error: "Supabase client not configured" }
  }

  try {
    const { data: conflict } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .neq("id", id || "")
      .maybeSingle()

    if (conflict) {
      return { error: "A post with this slug already exists" }
    }

    let previousSlug: string | null = null

    if (id) {
      const { data: existing } = await supabase
        .from("posts")
        .select("slug")
        .eq("id", id)
        .maybeSingle()

      if (!existing) {
        return { error: "Post not found" }
      }

      previousSlug = existing.slug
    }

    const payload = {
      title,
      slug,
      content: normalizedContent,
      excerpt,
      category: category || null,
      image_url: imageUrl || null,
      published,
      featured,
    }

    const result = id
      ? await supabase
          .from("posts")
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
      : await supabase
          .from("posts")
          .insert({
            ...payload,
            author_id: session.user.id,
            upvotes: 0,
          })
          .select()

    if (result.error) throw result.error

    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath("/featured")
    if (previousSlug && previousSlug !== slug) {
      revalidatePath(`/blog/${previousSlug}`)
    }
    revalidatePath(`/blog/${slug}`)

    return { success: true, post: result.data?.[0] }
  } catch (error) {
    console.error("Error saving post:", error)
    return { error: "Failed to save post" }
  }
}

export async function deletePost(id: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: "You must be logged in" }
  }

  if (!(await verifyAdmin(session.user))) {
    return { error: "You do not have permission to delete posts" }
  }

  if (!supabase) {
    return { error: "Supabase client not configured" }
  }

  try {
    const { data: post } = await supabase
      .from("posts")
      .select("slug")
      .eq("id", id)
      .maybeSingle()

    if (!post) {
      return { error: "Post not found" }
    }

    const { error } = await supabase.from("posts").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath("/featured")
    revalidatePath(`/blog/${post.slug}`)

    return { success: true }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { error: "Failed to delete post" }
  }
}

export async function togglePublishStatus(id: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: "You must be logged in" }
  }

  if (!(await verifyAdmin(session.user))) {
    return { error: "You do not have permission to publish posts" }
  }

  if (!supabase) {
    return { error: "Supabase client not configured" }
  }

  try {
    const { data: post } = await supabase
      .from("posts")
      .select("id, slug, published")
      .eq("id", id)
      .maybeSingle()

    if (!post) {
      return { error: "Post not found" }
    }

    const { error } = await supabase
      .from("posts")
      .update({
        published: !post.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath("/featured")
    revalidatePath(`/blog/${post.slug}`)

    return { success: true, published: !post.published }
  } catch (error) {
    console.error("Error toggling publish status:", error)
    return { error: "Failed to update publish status" }
  }
}

export async function toggleFeaturedStatus(id: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: "You must be logged in" }
  }

  if (!(await verifyAdmin(session.user))) {
    return { error: "You do not have permission to manage featured posts" }
  }

  if (!supabase) {
    return { error: "Supabase client not configured" }
  }

  try {
    const { data: post } = await supabase
      .from("posts")
      .select("id, slug, featured")
      .eq("id", id)
      .maybeSingle()

    if (!post) {
      return { error: "Post not found" }
    }

    const currentFeatured = Boolean(post.featured)
    const nextFeatured = !currentFeatured

    const { error } = await supabase
      .from("posts")
      .update({
        featured: nextFeatured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath("/featured")
    revalidatePath(`/blog/${post.slug}`)

    return { success: true, featured: nextFeatured }
  } catch (error) {
    console.error("Error toggling featured status:", error)
    return { error: "Failed to update featured status" }
  }
}

export async function getAllPosts() {
  const session = await auth()

  if (!session?.user) {
    redirect("/signin")
  }

  if (!(await verifyAdmin(session.user))) {
    redirect("/")
  }

  if (!supabase) {
    return []
  }

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching all posts:", error)
      return []
    }

    return posts || []
  } catch (error) {
    console.error("Supabase connection error:", error)
    return []
  }
}

export async function getPublishedPosts() {
  if (!supabase) {
    return []
  }

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching posts:", error)
      return []
    }

    return posts || []
  } catch (error) {
    console.error("Supabase connection error:", error)
    return []
  }
}

type GetPostBySlugOptions = {
  allowAdminDraftPreview?: boolean
}

export async function getPostBySlug(
  slugParam: string,
  options: GetPostBySlugOptions = {},
) {
  if (!supabase) {
    return null
  }

  const slug = normalizeSlug(slugParam)

  try {
    let canPreviewDrafts = false

    if (options.allowAdminDraftPreview) {
      const session = await auth()
      canPreviewDrafts = !!session?.user && (await verifyAdmin(session.user))
    }

    let query = supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)

    if (!canPreviewDrafts) {
      query = query.eq("published", true)
    }

    const { data, error } = await query
      .maybeSingle()

    if (error) {
      if ("code" in error && error.code === "PGRST116") {
        return null
      }
      throw error
    }

    return data
      ? {
          ...data,
          content: sanitizePostContent(data.content || ""),
        }
      : null
  } catch (error) {
    console.error("Error fetching post:", error)
    return null
  }
}

export async function getPostById(id: string) {
  if (!supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      if ("code" in error && error.code === "PGRST116") {
        return null
      }
      throw error
    }

    return data ?? null
  } catch (error) {
    console.error("Error fetching post by id:", error)
    return null
  }
}

