"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import { auth } from "@/lib/auth"

export async function addComment(formData: FormData) {
  const session = await auth()

  if (!session?.user) {
    return { error: "You must be logged in to comment" }
  }

  const content = formData.get("content") as string
  const postId = formData.get("postId") as string
  const parentId = (formData.get("parentId") as string) || null

  if (!content?.trim()) {
    return { error: "Comment cannot be empty" }
  }

  try {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        content,
        post_id: postId,
        user_id: session.user.id,
        parent_id: parentId,
      })
      .select("*, user:profiles(name, email)")
      .single()

    if (error) throw error

    // Revalidate the post page to show the new comment
    revalidatePath(`/blog/${postId}`)

    return { success: true, comment: data }
  } catch (error) {
    console.error("Error adding comment:", error)
    return { error: "Failed to add comment" }
  }
}

export async function deleteComment(commentId: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: "You must be logged in to delete a comment" }
  }

  try {
    // First check if the user is the comment author or an admin
    const { data: comment } = await supabase.from("comments").select("*").eq("id", commentId).single()

    if (!comment) {
      return { error: "Comment not found" }
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    const isAdmin = profile?.role === "admin"

    // Only allow deletion if user is the author or an admin
    if (comment.user_id !== session.user.id && !isAdmin) {
      return { error: "You do not have permission to delete this comment" }
    }

    // Delete the comment
    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (error) throw error

    // Revalidate the post page
    revalidatePath(`/blog/${comment.post_id}`)

    return { success: true }
  } catch (error) {
    console.error("Error deleting comment:", error)
    return { error: "Failed to delete comment" }
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
