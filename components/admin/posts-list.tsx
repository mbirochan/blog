"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { deletePost, togglePublishStatus } from "@/app/actions/post-actions"
import { useToast } from "@/hooks/use-toast"

interface Post {
  id: string
  title: string
  slug: string
  published: boolean
  created_at: string
}

export function PostsList({ posts }: { posts: Post[] }) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }

    setIsLoading(id)

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
      setIsLoading(null)
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setIsLoading(id)

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
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground">No posts found. Create your first post!</p>
      ) : (
        posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{post.title}</CardTitle>
                <div className="flex items-center gap-2">
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
            <CardFooter className="pt-2">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => router.push(`/admin/edit/${post.id}`)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(post.id)}
                  disabled={isLoading === post.id}
                >
                  {isLoading === post.id ? "Deleting..." : "Delete"}
                </Button>
                {post.published ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePublish(post.id, post.published)}
                    disabled={isLoading === post.id}
                  >
                    {isLoading === post.id ? "Updating..." : "Unpublish"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleTogglePublish(post.id, post.published)}
                    disabled={isLoading === post.id}
                  >
                    {isLoading === post.id ? "Updating..." : "Publish"}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  )
}
