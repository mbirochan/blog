"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { addComment, deleteComment } from "@/app/actions/comment-actions"

interface Comment {
  id: string
  content: string
  created_at: string
  user: {
    name: string
    email: string
  }
  post: {
    id: string
    title: string
    slug: string
  }
}

export function CommentsList() {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isReplySubmitting, setIsReplySubmitting] = useState(false)
  const { toast } = useToast()

  const fetchComments = useCallback(
    async (showInitialLoader = false) => {
      if (showInitialLoader) {
        setIsLoading(true)
      }

      try {
        const { data, error } = await supabase
          .from("comments")
          .select(`
            *,
            user:profiles(name, email),
            post:posts(id, title, slug)
          `)
          .order("created_at", { ascending: false })

        if (error) throw error

        setComments(data || [])
      } catch (error) {
        console.error("Error fetching comments:", error)
        toast({
          title: "Error",
          description: "Failed to load comments. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        if (showInitialLoader) {
          setIsLoading(false)
        }
      }
    },
    [toast]
  )

  useEffect(() => {
    fetchComments(true)
  }, [fetchComments])

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

      await fetchComments()

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

      await fetchComments()
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
    return <div className="text-center py-8">Loading comments...</div>
  }

  if (comments.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No comments found.</div>
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{comment.user.name}</CardTitle>
              <span className="text-sm text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            <CardDescription>
              On:{" "}
              <a href={`/blog/${comment.post.slug}`} className="hover:underline">
                {comment.post.title}
              </a>
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
                  if (replyingId === comment.id) {
                    setReplyingId(null)
                    setReplyContent("")
                  } else {
                    setReplyingId(comment.id)
                    setReplyContent("")
                  }
                }}
                disabled={deletingId === comment.id || (isReplySubmitting && replyingId === comment.id)}
              >
                {replyingId === comment.id ? "Close reply" : "Reply"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDelete(comment.id)}
                disabled={deletingId === comment.id || (isReplySubmitting && replyingId === comment.id)}
              >
                {deletingId === comment.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
            {replyingId === comment.id && (
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
      ))}
    </div>
  )
}
