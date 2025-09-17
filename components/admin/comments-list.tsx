"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { addComment, deleteComment, getAllComments } from "@/app/actions/comment-actions"

interface CommentAuthor {
  name: string | null
  email: string | null
}

interface CommentPost {
  id: string | null
  title: string | null
  slug: string | null
}

interface Comment {
  id: string
  content: string
  created_at: string
  user?: CommentAuthor | null
  post?: CommentPost | null
}

export function CommentsList() {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isReplySubmitting, setIsReplySubmitting] = useState(false)
  const { toast } = useToast()

  const loadComments = useCallback(
    async (showLoader = false) => {
      if (showLoader) {
        setIsLoading(true)
      }

      try {
        const result = await getAllComments()
        const normalized: Comment[] = Array.isArray(result)
          ? (result as Comment[]).map((comment) => ({
              ...comment,
              user: comment.user ?? null,
              post: comment.post ?? null,
            }))
          : []

        setComments(normalized)
      } catch (error) {
        console.error("Error fetching comments:", error)
        toast({
          title: "Error",
          description: "Failed to load comments. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        if (showLoader) {
          setIsLoading(false)
        }
      }
    },
    [toast]
  )

  useEffect(() => {
    loadComments(true)
  }, [loadComments])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return
    }

    setDeletingId(id)

    try {
      const result = await deleteComment(id)

      if (result.error) {
        throw new Error(result.error)
      }

      await loadComments()

      toast({
        title: "Comment deleted",
        description: "The comment has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleReplySubmit = async (comment: Comment) => {
    if (!replyContent.trim()) {
      return
    }

    if (!comment.post?.id) {
      toast({
        title: "Cannot reply",
        description: "The original post for this comment is no longer available.",
        variant: "destructive",
      })
      setReplyingId(null)
      setReplyContent("")
      return
    }

    setIsReplySubmitting(true)

    try {
      const formData = new FormData()
      formData.append("content", replyContent)
      formData.append("postId", comment.post.id)
      formData.append("parentId", comment.id)

      const result = await addComment(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Reply posted",
        description: "Your response has been shared on the blog.",
      })

      setReplyContent("")
      setReplyingId(null)

      await loadComments()
    } catch (error) {
      console.error("Error replying to comment:", error)
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsReplySubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="py-8 text-center">Loading comments...</div>
  }

  if (comments.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No comments found.</div>
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const authorName = comment.user?.name?.trim() || "Unknown user"
        const createdAtDate = comment.created_at ? new Date(comment.created_at) : null
        const formattedDate =
          createdAtDate && !Number.isNaN(createdAtDate.getTime())
            ? createdAtDate.toLocaleDateString()
            : "—"
        const postId = comment.post?.id ?? null
        const postSlug = comment.post?.slug ?? null
        const hasPostLink = Boolean(postSlug)
        const postTitle =
          hasPostLink && comment.post?.title?.trim()
            ? comment.post.title.trim()
            : hasPostLink
              ? "Untitled post"
              : null
        const canReply = Boolean(postId)
        const isReplyOpen = replyingId === comment.id

        return (
          <Card key={comment.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{authorName}</CardTitle>
                <span className="text-sm text-muted-foreground">{formattedDate}</span>
              </div>
              <CardDescription>
                {hasPostLink ? (
                  <>
                    On{" "}
                    <a href={`/blog/${postSlug}`} className="hover:underline">
                      {postTitle}
                    </a>
                  </>
                ) : (
                  <span className="italic text-muted-foreground">Original post unavailable</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{comment.content}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-0">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (isReplyOpen) {
                      setReplyingId(null)
                      setReplyContent("")
                    } else if (canReply) {
                      setReplyingId(comment.id)
                      setReplyContent("")
                    }
                  }}
                  disabled={deletingId === comment.id || isReplySubmitting || !canReply}
                  title={!canReply ? "Replies are disabled because the original post was removed." : undefined}
                >
                  {isReplyOpen ? "Close reply" : "Reply"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                >
                  {deletingId === comment.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
              {isReplyOpen && canReply && (
                <div className="w-full space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={(event) => setReplyContent(event.target.value)}
                    placeholder="Write your reply"
                    className="min-h-[120px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyingId(null)
                        setReplyContent("")
                      }}
                      disabled={isReplySubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleReplySubmit(comment)}
                      disabled={isReplySubmitting || !replyContent.trim()}
                    >
                      {isReplySubmitting ? "Sending..." : "Post Reply"}
                    </Button>
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
