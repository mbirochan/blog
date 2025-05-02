"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "@/lib/utils"

interface Comment {
  id: string
  content: string
  author: {
    name: string
    avatar?: string
  }
  createdAt: string
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  comments?: Comment[]
  isLoggedIn?: boolean
}

export function CommentSection({ postId, comments: initialComments = [], isLoggedIn = false }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmitComment = async () => {
    if (!isLoggedIn) {
      // Redirect to login or show login dialog
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      // This would be replaced with your actual API call
      // const response = await fetch('/api/comments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ postId, content: newComment }),
      // })

      // Mock response for demo
      const mockResponse = {
        id: `temp-${Date.now()}`,
        content: newComment,
        author: {
          name: "Current User",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        createdAt: new Date().toISOString(),
      }

      setComments([mockResponse, ...comments])
      setNewComment("")
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-2xl font-bold">Comments</h2>

      {isLoggedIn ? (
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your avatar" />
            <AvatarFallback>YA</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] w-full"
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitComment} disabled={isSubmitting || !newComment.trim()}>
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-4 text-center">
          <p className="mb-4">Sign in to leave a comment</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Sign In</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                <AlertDialogDescription>
                  You need to sign in to comment on blog posts. Would you like to sign in now?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => router.push("/api/auth/signin")}>Sign In</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="py-4 text-center text-muted-foreground">No comments yet. Be the first to comment!</div>
      )}
    </div>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.author.avatar || "/placeholder.svg?height=40&width=40"} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{comment.author.name}</h4>
            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt))}</span>
          </div>
          <p className="mt-1">{comment.content}</p>
          <div className="mt-2 flex gap-4">
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
              Reply
            </Button>
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
              Like
            </Button>
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-14 mt-4 space-y-4 border-l-2 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}

      <Separator className="mt-4" />
    </div>
  )
}

