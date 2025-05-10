"use client"

import { useState } from "react"
import { ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { toggleUpvote } from "@/app/actions/upvote-actions"

interface UpvoteButtonProps {
  postId: string
  initialUpvotes: number
  initialHasUpvoted: boolean
}

export function UpvoteButton({ postId, initialUpvotes, initialHasUpvoted }: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleUpvote = async () => {
    setIsLoading(true)

    try {
      const result = await toggleUpvote(postId)

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.success) {
        setUpvotes(result.upvotes)
        setHasUpvoted(result.hasUpvoted)

        toast({
          title: result.hasUpvoted ? "Post upvoted" : "Upvote removed",
          description: result.hasUpvoted ? "Thanks for upvoting this post!" : "Your upvote has been removed.",
        })
      }
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

  return (
    <Button
      variant={hasUpvoted ? "default" : "outline"}
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
