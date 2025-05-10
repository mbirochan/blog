"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { savePost } from "@/app/actions/post-actions"

interface PostEditorProps {
  post?: {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string
    category: string
    image_url: string
    published: boolean
  }
}

export function PostEditor({ post }: PostEditorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent, published: boolean) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)

    // Add the published status
    formData.append("published", published.toString())

    // Add the post ID if editing
    if (post?.id) {
      formData.append("id", post.id)
    }

    try {
      const result = await savePost(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: post?.id ? "Post updated" : "Post created",
        description: published ? "Your post has been published." : "Your post has been saved as a draft.",
      })

      router.push("/admin")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Post title" defaultValue={post?.title || ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" placeholder="post-url-slug" defaultValue={post?.slug || ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Input
          id="excerpt"
          name="excerpt"
          placeholder="Brief description of the post"
          defaultValue={post?.excerpt || ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          placeholder="e.g. Technology, Design"
          defaultValue={post?.category || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <div className="min-h-[300px] rounded-md border">
          <Textarea
            id="content"
            name="content"
            className="h-full min-h-[300px] w-full resize-none rounded-md border-0 p-3 focus:outline-none"
            placeholder="Write your post content here..."
            defaultValue={post?.content || ""}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Featured Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          placeholder="https://example.com/image.jpg"
          defaultValue={post?.image_url || ""}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" variant="outline" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save as Draft"}
        </Button>
        <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={isLoading}>
          {isLoading ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </form>
  )
}
