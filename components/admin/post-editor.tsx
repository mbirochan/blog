"use client"

import type React from "react"

import { useRef, useState } from "react"
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
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(post?.image_url ?? "")
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const submitPost = async (publish: boolean) => {
    if (!formRef.current) {
      return
    }

    if (isUploading) {
      toast({
        title: "Image upload in progress",
        description: "Please wait until the image upload completes before saving.",
      })
      return
    }

    setIsLoading(true)

    const formData = new FormData(formRef.current)

    formData.set("published", publish.toString())
    formData.set("imageUrl", imageUrl)

    if (post?.id) {
      formData.set("id", post.id)
    }

    try {
      const result = await savePost(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: post?.id ? "Post updated" : "Post created",
        description: publish ? "Your post has been published." : "Your post has been saved as a draft.",
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

  const handleDraftSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await submitPost(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file || isLoading) {
      return
    }

    setIsUploading(true)

    try {
      const payload = new FormData()
      payload.append("file", file)

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: payload,
      })

      const result = await response.json()

      if (!response.ok || !result?.url) {
        throw new Error(result?.error || "Failed to upload image")
      }

      setImageUrl(result.url)

      toast({
        title: "Image uploaded",
        description: "The featured image is ready to use.",
      })
    } catch (error) {
      console.error("Error uploading image", error)
      toast({
        title: "Upload failed",
        description: "Could not upload the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (event.target instanceof HTMLInputElement) {
        event.target.value = ""
      }
    }
  }

  return (
    <form ref={formRef} onSubmit={handleDraftSubmit} className="space-y-6">
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
        <Label htmlFor="imageUrl">Featured Image</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Paste an image URL or upload a file to populate it automatically.
        </p>
        <Input
          id="imageUpload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading || isLoading}
        />
        {isUploading && <p className="text-sm text-muted-foreground">Uploading image...</p>}
        {imageUrl && (
          <div className="space-y-2 rounded-md border p-2">
            <img src={imageUrl} alt="Featured preview" className="h-40 w-full rounded-md object-cover" />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setImageUrl("")}
                disabled={isUploading || isLoading}
              >
                Remove image
              </Button>
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline"
              >
                View full size
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" variant="outline" disabled={isLoading || isUploading}>
          {isLoading ? "Saving..." : "Save as Draft"}
        </Button>
        <Button type="button" onClick={() => submitPost(true)} disabled={isLoading || isUploading}>
          {isLoading ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </form>
  )
}
