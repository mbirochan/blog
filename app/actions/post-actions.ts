"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { auth } from "@/lib/auth"

// Mock data for development when Supabase is not configured
const mockPosts = [
  {
    id: "1",
    title: "Welcome to Our Blog",
    slug: "welcome-to-our-blog",
    content: "This is a sample blog post to demonstrate the functionality of our blog application.",
    excerpt: "A sample blog post demonstrating our blog functionality.",
    category: "General",
    image_url: "/placeholder.jpg",
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author_id: "sample-author",
    upvotes: 0
  },
  {
    id: "2",
    title: "Getting Started Guide",
    slug: "getting-started-guide",
    content: "Learn how to use this blog platform effectively with this comprehensive guide.",
    excerpt: "A comprehensive guide to using this blog platform.",
    category: "Tutorial",
    image_url: "/placeholder.jpg",
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author_id: "sample-author",
    upvotes: 5
  }
]

// Create or update a post
export async function savePost(formData: FormData) {
  const session = await auth()

  // Check if user is admin
  if (!session?.user) {
    return { error: "You must be logged in" }
  }

  if (!supabase) {
    // Allow admin actions in development mode
    console.log("Development mode: allowing admin actions")
  } else {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role !== "admin") {
      return { error: "You do not have permission to manage posts" }
    }
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

  if (!supabase) {
    return { error: "Database not available in development mode" }
  } else {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role !== "admin") {
      return { error: "You do not have permission to delete posts" }
    }
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

  if (!supabase) {
    return { error: "Database not available in development mode" }
  } else {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role !== "admin") {
      return { error: "You do not have permission to publish posts" }
    }
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

  // Mock admin check when Supabase is not available
  if (!supabase) {
    // Allow access for development
    const isAdmin = true // In development, assume user is admin
    if (!isAdmin) {
      redirect("/admin/login")
    }
  } else {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role !== "admin") {
      redirect("/admin/login")
    }
  }

  if (!supabase) {
    return mockPosts
  }

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching all posts:", error)
      return mockPosts
    }

    return posts || mockPosts
  } catch (error) {
    console.error("Supabase connection error:", error)
    return mockPosts
  }
}

// Get published posts (for public)
export async function getPublishedPosts() {
  if (!supabase) {
    return mockPosts
  }

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching posts:", error)
      return mockPosts
    }

    return posts || mockPosts
  } catch (error) {
    console.error("Supabase connection error:", error)
    return mockPosts
  }
}

// Get a single post by slug
export async function getPostBySlug(slug: string) {
  if (!supabase) {
    return mockPosts.find(post => post.slug === slug) || null
  }

  try {
    const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching post:", error)
    return mockPosts.find(post => post.slug === slug) || null
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