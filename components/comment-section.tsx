"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { addComment, deleteComment } from "@/app/actions/comment-actions"

interface CommentAuthor {
  name: string
  email: string
}

interface Comment {
  id: string
  content: string
  user: CommentAuthor
  created_at: string
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  isLoggedIn: boolean
  currentUser: CommentAuthor | null
}

export function CommentSection({ postId, comments: initialComments, isLoggedIn, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn || !currentUser || !newComment.trim()) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("content", newComment)
      formData.append("postId", postId)

      const result = await addComment(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.success && result.comment) {
        setComments([result.comment, ...comments])
        setNewComment("")
        toast({
          title: "Comment added",
          description: "Your comment has been added successfully.",
        })
      }
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

  const handleSubmitReply = async (commentId: string) => {
    if (!isLoggedIn || !currentUser || !replyContent.trim()) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("content", replyContent)
      formData.append("postId", postId)
      formData.append("parentId", commentId)

      const result = await addComment(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.success && result.comment) {
        // Update the comments state with the new reply
        const updatedComments = comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), result.comment],
            }
          }
          return comment
        })

        setComments(updatedComments)
        setReplyTo(null)
        setReplyContent("")
        toast({
          title: "Reply added",
          description: "Your reply has been added successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const result = await deleteComment(commentId)

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.success) {
        // Remove the comment from the state
        setComments(comments.filter((comment) => comment.id !== commentId))
        toast({
          title: "Comment deleted",
          description: "Your comment has been deleted successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-2xl font-bold">Comments</h2>

      {isLoggedIn && currentUser ? (
        <form onSubmit={handleSubmitComment} className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] w-full"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border p-4 text-center">
          <p className="mb-4">Sign in with Google or Email to leave a comment</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Sign In</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign in to comment</AlertDialogTitle>
                <AlertDialogDescription>
                  You need to sign in to comment on blog posts. Choose your sign-in method:
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col space-y-2 sm:space-y-0">
                <AlertDialogAction
                  onClick={() =>
                    router.push("/api/auth/signin?callbackUrl=" + encodeURIComponent(window.location.href))
                  }
                >
                  Sign in with Google or Email
                </AlertDialogAction>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isLoggedIn={isLoggedIn}
              currentUser={currentUser}
              onReply={() => setReplyTo(comment.id)}
              isReplying={replyTo === comment.id}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={() => handleSubmitReply(comment.id)}
              onDeleteComment={() => handleDeleteComment(comment.id)}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      ) : (
        <div className="py-4 text-center text-muted-foreground">No comments yet. Be the first to comment!</div>
      )}
    </div>
  )
}

function CommentItem({
  comment,
  isLoggedIn,
  currentUser,
  onReply,
  isReplying,
  replyContent,
  setReplyContent,
  onSubmitReply,
  onDeleteComment,
  isSubmitting,
}: {
  comment: Comment
  isLoggedIn: boolean
  currentUser: CommentAuthor | null
  onReply: () => void
  isReplying: boolean
  replyContent: string
  setReplyContent: (content: string) => void
  onSubmitReply: () => void
  onDeleteComment: () => void
  isSubmitting: boolean
}) {
  const router = useRouter()
  const isAuthor = currentUser?.email === comment.user.email

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{comment.user.name}</h4>
            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at))}</span>
          </div>
          <p className="mt-1">{comment.content}</p>
          <div className="mt-2 flex gap-4">
            {isLoggedIn ? (
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground" onClick={onReply}>
                Reply
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
                    Reply
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign in to reply</AlertDialogTitle>
                    <AlertDialogDescription>
                      You need to sign in to reply to comments. Choose your sign-in method:
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col space-y-2 sm:space-y-0">
                    <AlertDialogAction
                      onClick={() =>
                        router.push("/api/auth/signin?callbackUrl=" + encodeURIComponent(window.location.href))
                      }
                    >
                      Sign in with Google or Email
                    </AlertDialogAction>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-red-500 hover:text-red-700"
                onClick={onDeleteComment}
              >
                Delete
              </Button>
            )}
          </div>

          {isReplying && (
            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] w-full"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setReplyContent("")}>
                  Cancel
                </Button>
                <Button size="sm" onClick={onSubmitReply} disabled={isSubmitting || !replyContent.trim()}>
                  {isSubmitting ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 mt-4 space-y-4 border-l-2 pl-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{reply.user.name}</h4>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(reply.created_at))}</span>
              </div>
              <p>{reply.content}</p>
              {currentUser?.email === reply.user.email && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-red-500 hover:text-red-700"
                  onClick={onDeleteComment}
                >
                  Delete
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Separator className="mt-4" />
    </div>
  )
}
