"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { randomUUID } from "crypto"

import { supabase } from "@/lib/supabase"
import { isAdminEmail } from "@/lib/admin"
import { auth } from "@/lib/auth"

type AdminCandidate = {
  id: string
  email?: string | null
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
    return base
  }

  return base
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.trim().replace(/\n/g, "<br />")}</p>`)
    .join("")
}

async function ensureAdminAccess(user?: AdminCandidate) {
  if (!user?.email) {
    return false
  }

  if (isAdminEmail(user.email)) {
    return true
  }

  if (!supabase) {
    return false
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  return profile?.role === "admin"
}

export async function savePost(formData: FormData) {
  const session = await auth()

  if (!session?.user) {
    return { error: "You must be logged in" }
  }

  if (!(await ensureAdminAccess(session.user))) {
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

  if (!(await ensureAdminAccess(session.user))) {
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

  if (!(await ensureAdminAccess(session.user))) {
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
    revalidatePath(`/blog/${post.slug}`)

    return { success: true, published: !post.published }
  } catch (error) {
    console.error("Error toggling publish status:", error)
    return { error: "Failed to update publish status" }
  }
}

export async function getAllPosts() {
  const session = await auth()

  if (!session?.user) {
    redirect("/signin?callbackUrl=/admin")
  }

  if (!(await ensureAdminAccess(session.user))) {
    redirect("/signin?callbackUrl=/admin")
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

export async function getPostBySlug(slugParam: string) {
  if (!supabase) {
    return null
  }

  const slug = normalizeSlug(slugParam)

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()

    if (error) {
      if ("code" in error && error.code === "PGRST116") {
        return null
      }
      throw error
    }

    return data ?? null
  } catch (error) {
    console.error("Error fetching post:", error)
    return null
  }
}

export async function getCategories() {
  if (!supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("category")
      .neq("category", null)

    if (error) throw error

    const unique = Array.from(new Set((data || []).map((p) => (p.category as string) ?? "")))
      .filter(Boolean)
      .map((name) => ({ id: name, name }))

    return unique
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}
