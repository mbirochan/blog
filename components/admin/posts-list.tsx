"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { deletePost, togglePublishStatus, toggleFeaturedStatus } from "@/app/actions/post-actions"
import { useToast } from "@/hooks/use-toast"

interface Post {
  id: string
  title: string
  slug: string
  published: boolean
  featured?: boolean | null
  created_at: string
}

type LoadingAction = "delete" | "publish" | "feature"

export function PostsList({ posts }: { posts: Post[] }) {
  const [loadingState, setLoadingState] = useState<{ id: string; action: LoadingAction } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const resetLoading = () => setLoadingState(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }

    setLoadingState({ id, action: "delete" })

    try {
      const result = await deletePost(id)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Post deleted",
        description: "The post has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
    } finally {
      resetLoading()
    }
  }

  const handleTogglePublish = async (id: string) => {
    setLoadingState({ id, action: "publish" })

    try {
      const result = await togglePublishStatus(id)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: result.published ? "Post published" : "Post unpublished",
        description: result.published
          ? "The post is now visible to the public."
          : "The post is now hidden from the public.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update publish status. Please try again.",
        variant: "destructive",
      })
    } finally {
      resetLoading()
    }
  }

  const handleToggleFeatured = async (id: string) => {
    setLoadingState({ id, action: "feature" })

    try {
      const result = await toggleFeaturedStatus(id)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: result.featured ? "Post featured" : "Post unfeatured",
        description: result.featured
          ? "The post will now appear in featured sections."
          : "The post has been removed from featured sections.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update featured status. Please try again.",
        variant: "destructive",
      })
    } finally {
      resetLoading()
    }
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground">No posts found. Create your first post!</p>
      ) : (
        posts.map((post) => {
          const isLoading = loadingState?.id === post.id
          const loadingAction = isLoading ? loadingState.action : null

          return (
            <Card key={post.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{post.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {post.featured ? (
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        Featured
                      </span>
                    ) : null}
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs ${
                        post.published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => router.push(`/admin/edit/${post.id}`)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(post.id)}
                  disabled={isLoading}
                >
                  {isLoading && loadingAction === "delete" ? "Deleting..." : "Delete"}
                </Button>
                {post.published ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePublish(post.id)}
                    disabled={isLoading}
                  >
                    {isLoading && loadingAction === "publish" ? "Updating..." : "Unpublish"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleTogglePublish(post.id)}
                    disabled={isLoading}
                  >
                    {isLoading && loadingAction === "publish" ? "Updating..." : "Publish"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className={post.featured ? "border-blue-500 text-blue-600 hover:text-blue-700" : ""}
                  onClick={() => handleToggleFeatured(post.id)}
                  disabled={isLoading}
                >
                  {isLoading && loadingAction === "feature"
                    ? "Updating..."
                    : post.featured
                      ? "Unfeature"
                      : "Feature"}
                </Button>
              </CardFooter>
            </Card>
          )
        })
      )}
    </div>
  )
}
