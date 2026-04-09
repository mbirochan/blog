
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
    return { success: true, hasUpvoted: !hasUpvoted, upvotes: 0 }
  }

  try {
    // Atomic increment/decrement to avoid race conditions
    const delta = hasUpvoted ? -1 : 1
    const { data: updated, error } = await supabase.rpc("adjust_post_upvotes", {
      post_id: postId,
      delta,
    })

    if (error) throw error

    const newUpvoteCount = updated ?? 0

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

  let upvotes = 0
  if (supabase) {
    const { data: post } = await supabase.from("posts").select("upvotes").eq("id", postId).single()
    upvotes = post?.upvotes ?? 0
  }

  return { hasUpvoted, upvotes }
}
