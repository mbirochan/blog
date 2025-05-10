"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { deleteComment } from "@/app/actions/comment-actions"

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
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchComments() {
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
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [toast])

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

      // Remove the comment from the state
      setComments(comments.filter((comment) => comment.id !== id))

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
          <CardFooter className="pt-0">
            <div className="flex gap-2">
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
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
