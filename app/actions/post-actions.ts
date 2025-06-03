"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { auth } from "@/lib/auth"

// Create or update a post
export async function savePost(formData: FormData) {
  const session = await auth()

  // Check if user is admin
  if (!session?.user) {
    return { error: "You must be logged in" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    return { error: "You do not have permission to manage posts" }
  }

  const id = formData.get("id") as string
  const title = formData.get("title") as string
  const slug = formData.get("slug") as string
  const content = formData.get("content") as string
  const excerpt = formData.get("excerpt") as string
  const category = formData.get("category") as string
  const imageUrl = formData.get("imageUrl") as string
  const published = formData.get("published") === "true"

  if (!title || !slug || !content || !excerpt) {
    return { error: "Missing required fields" }
  }

  try {
    // Check if slug is unique (except for the current post)
    const { data: existingPost } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .neq("id", id || "")
      .maybeSingle()

    if (existingPost) {
      return { error: "A post with this slug already exists" }
    }

    let result

    if (id) {
      // Update existing post
      result = await supabase
        .from("posts")
        .update({
          title,
          slug,
          content,
          excerpt,
          category,
          image_url: imageUrl,
          published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
    } else {
      // Create new post
      result = await supabase
        .from("posts")
        .insert({
          title,
          slug,
          content,
          excerpt,
          category,
          image_url: imageUrl,
          published,
          author_id: session.user.id,
          upvotes: 0,
        })
        .select()
    }

    if (result.error) throw result.error

    // Revalidate paths
    revalidatePath("/admin")
    revalidatePath("/")
    if (id) revalidatePath(`/blog/${slug}`)

    return { success: true, post: result.data[0] }
  } catch (error) {
    console.error("Error saving post:", error)
    return { error: "Failed to save post" }
  }
}

// Delete a post
export async function deletePost(id: string) {
  const session = await auth()

  // Check if user is admin
  if (!session?.user) {
    return { error: "You must be logged in" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    return { error: "You do not have permission to delete posts" }
  }

  try {
    // Get the post slug for revalidation
    const { data: post } = await supabase.from("posts").select("slug").eq("id", id).single()

    if (!post) {
      return { error: "Post not found" }
    }

    // Delete the post
    const { error } = await supabase.from("posts").delete().eq("id", id)

    if (error) throw error

    // Revalidate paths
    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath(`/blog/${post.slug}`)

    return { success: true }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { error: "Failed to delete post" }
  }
}

// Toggle post published status
export async function togglePublishStatus(id: string) {
  const session = await auth()

  // Check if user is admin
  if (!session?.user) {
    return { error: "You must be logged in" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    return { error: "You do not have permission to publish posts" }
  }

  try {
    // Get the current post
    const { data: post } = await supabase.from("posts").select("published, slug").eq("id", id).single()

    if (!post) {
      return { error: "Post not found" }
    }

    // Toggle the published status
    const { error } = await supabase
      .from("posts")
      .update({
        published: !post.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    // Revalidate paths
    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath(`/blog/${post.slug}`)

    return { success: true, published: !post.published }
  } catch (error) {
    console.error("Error toggling publish status:", error)
    return { error: "Failed to update publish status" }
  }
}

// Get all posts (for admin)
export async function getAllPosts() {
  const session = await auth()

  // Check if user is admin
  if (!session?.user) {
    redirect("/admin/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    redirect("/admin/login")
  }

  try {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching posts:", error)
    return []
  }
}

// Get published posts (for public)
export async function getPublishedPosts() {
  try {
    // If Supabase credentials are not provided, fall back to local data
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_KEY) {
      const { allPosts } = await import("@/lib/blog-data")
      return allPosts
    }

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching published posts:", error)
    // Use local posts as a fallback if Supabase request fails
    const { allPosts } = await import("@/lib/blog-data")
    return allPosts
  }
}

// Get a single post by slug
export async function getPostBySlug(slug: string) {
  try {
    const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching post:", error)
    return null
  }
}

export async function getComments(postId: string) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        user:profiles(name, email),
        replies:comments(
          *,
          user:profiles(name, email)
        )
      `)
      .eq("post_id", postId)
      .is("parent_id", null)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { comments: data || [] }
  } catch (error) {
    console.error("Error fetching comments:", error)
    return { comments: [] }
  }
}
