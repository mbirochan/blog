"use client"

import { useState } from "react"
import { ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
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
import { useRouter } from "next/navigation"

interface UpvoteButtonProps {
  postId: string
  initialUpvotes?: number
  isLoggedIn?: boolean
  hasUpvoted?: boolean
}

export function UpvoteButton({
  postId,
  initialUpvotes = 0,
  isLoggedIn = false,
  hasUpvoted = false,
}: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [userHasUpvoted, setUserHasUpvoted] = useState(hasUpvoted)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleUpvote = async () => {
    if (!isLoggedIn) {
      // Will be handled by the AlertDialog
      return
    }

    setIsLoading(true)

    try {
      // This would be replaced with your actual API call
      // const response = await fetch(`/api/posts/${postId}/upvote`, {
      //   method: userHasUpvoted ? 'DELETE' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      // })

      // Mock response for demo
      const newUpvoteCount = userHasUpvoted ? upvotes - 1 : upvotes + 1

      setUpvotes(newUpvoteCount)
      setUserHasUpvoted(!userHasUpvoted)

      toast({
        title: userHasUpvoted ? "Upvote removed" : "Post upvoted",
        description: userHasUpvoted ? "Your upvote has been removed." : "Thanks for upvoting this post!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update upvote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoggedIn) {
    return (
      <Button
        variant={userHasUpvoted ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={handleUpvote}
        disabled={isLoading}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{upvotes}</span>
      </Button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ThumbsUp className="h-4 w-4" />
          <span>{upvotes}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Authentication Required</AlertDialogTitle>
          <AlertDialogDescription>
            You need to sign in to upvote blog posts. Would you like to sign in now?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => router.push("/api/auth/signin")}>Sign In</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

