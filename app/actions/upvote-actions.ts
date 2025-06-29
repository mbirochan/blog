
"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"
import { auth } from "@/lib/auth"

// Function to handle anonymous upvotes
export async function toggleUpvote(postId: string) {
  const cookieStore = await cookies()
  const upvoteCookie = cookieStore.get(`upvote-${postId}`)
  const hasUpvoted = upvoteCookie?.value === "true"

  if (!supabase) {
    // In development mode without Supabase, just toggle the cookie
    if (hasUpvoted) {
      cookieStore.delete(`upvote-${postId}`)
    } else {
      cookieStore.set(`upvote-${postId}`, "true", {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      })
    }
    return { success: true, hasUpvoted: !hasUpvoted }
  }

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
      cookieStore.delete(`upvote-${postId}`)
    } else {
      cookieStore.set(`upvote-${postId}`, "true", {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      })
    }

    // Revalidate the post page
    revalidatePath(`/blog/${postId}`)

    return { success: true, hasUpvoted: !hasUpvoted, upvotes: newUpvoteCount }
  } catch (error) {
    console.error("Error toggling upvote:", error)
    return { error: "Failed to toggle upvote" }
  }
}

// Function to check if user has upvoted
export async function getUpvoteStatus(postId: string) {
  const cookieStore = await cookies()
  const upvoteCookie = cookieStore.get(`upvote-${postId}`)
  const hasUpvoted = upvoteCookie?.value === "true"

  return { hasUpvoted }
}
