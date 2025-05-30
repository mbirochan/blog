"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"

// Function to handle anonymous upvotes
export async function toggleUpvote(postId: string) {
  const cookieStore = cookies()
  const upvoteCookie = cookieStore.get(`upvote-${postId}`)
  const hasUpvoted = upvoteCookie?.value === "true"

  try {
    // Get the current upvote count
    const { data: post } = await supabase.from("posts").select("upvotes").eq("id", postId).single()

    if (!post) {
      return { error: "Post not found" }
    }

    // Calculate the new upvote count
    const newUpvoteCount = hasUpvoted ? Math.max(0, post.upvotes - 1) : post.upvotes + 1

    // Update the post with the new upvote count
    const { error } = await supabase.from("posts").update({ upvotes: newUpvoteCount }).eq("id", postId)

    if (error) throw error

    // Set or remove the cookie to track the user's upvote
    if (hasUpvoted) {
      cookies().delete(`upvote-${postId}`)
    } else {
      cookies().set(`upvote-${postId}`, "true", {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      })
    }

    // Revalidate the post page
    revalidatePath(`/blog/${postId}`)

    return {
      success: true,
      upvotes: newUpvoteCount,
      hasUpvoted: !hasUpvoted,
    }
  } catch (error) {
    console.error("Error toggling upvote:", error)
    return { error: "Failed to update upvote" }
  }
}

// Function to check if a user has upvoted a post
export async function getUpvoteStatus(postId: string) {
  const cookieStore = cookies()
  const upvoteCookie = cookieStore.get(`upvote-${postId}`)
  const hasUpvoted = upvoteCookie?.value === "true"

  try {
    // Get the current upvote count
    const { data: post } = await supabase.from("posts").select("upvotes").eq("id", postId).single()

    if (!post) {
      return { upvotes: 0, hasUpvoted: false }
    }

    return {
      upvotes: post.upvotes,
      hasUpvoted,
    }
  } catch (error) {
    console.error("Error getting upvote status:", error)
    return { upvotes: 0, hasUpvoted: false }
  }
}
