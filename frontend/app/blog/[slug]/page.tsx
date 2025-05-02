"use client"

import { useState, useEffect } from "react"
import { BlogLayout } from "@/components/blog-layout"
import { allPosts } from "@/lib/blog-data"
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CommentSection } from "@/components/comment-section"
import { UpvoteButton } from "@/components/upvote-button"
import { ImageGallery } from "@/components/image-gallery"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = allPosts.find((post) => post.slug === params.slug)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // This would be replaced with your actual auth check
  useEffect(() => {
    // Check if user is logged in
    // For demo purposes, we'll just set a random value
    setIsLoggedIn(Math.random() > 0.5)
  }, [])

  if (!post) {
    notFound()
  }

  // For demo purposes, let's create an array of images
  const postImages = post.image
    ? [
        post.image,
        "/placeholder.svg?height=600&width=800&text=Additional+Image",
        "/placeholder.svg?height=600&width=800&text=Another+Image",
      ]
    : []

  return (
    <BlogLayout>
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        <article className="prose prose-stone dark:prose-invert max-w-none">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {post.category && (
              <Badge variant="outline" className="text-xs">
                <Tag className="mr-1 h-3 w-3" />
                {post.category}
              </Badge>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              <time dateTime={post.date}>{post.date}</time>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>

          <h1>{post.title}</h1>

          <div className="flex items-center gap-4 my-6">
            <UpvoteButton
              postId={post.id}
              initialUpvotes={Math.floor(Math.random() * 100)}
              isLoggedIn={isLoggedIn}
              hasUpvoted={false}
            />
          </div>

          {postImages.length > 0 && (
            <div className="my-6">
              <ImageGallery images={postImages} alt={post.title} />
            </div>
          )}

          <div
            dangerouslySetInnerHTML={{
              __html: post.content || "<p>" + post.excerpt + "</p><p>Content coming soon...</p>",
            }}
          />
        </article>

        <Separator className="my-10" />

        <CommentSection
          postId={post.id}
          isLoggedIn={isLoggedIn}
          comments={[
            {
              id: "1",
              content: "This is a great article! I learned a lot from it.",
              author: {
                name: "Jane Smith",
                avatar: "/placeholder.svg?height=40&width=40&text=JS",
              },
              createdAt: "2024-03-10T12:00:00Z",
            },
            {
              id: "2",
              content: "I have a question about the implementation. Would this work with older versions of Next.js?",
              author: {
                name: "John Doe",
                avatar: "/placeholder.svg?height=40&width=40&text=JD",
              },
              createdAt: "2024-03-09T15:30:00Z",
              replies: [
                {
                  id: "3",
                  content:
                    "Yes, it should work with Next.js 13 and above. For older versions, you might need to adapt the routing.",
                  author: {
                    name: "Author",
                    avatar: "/placeholder.svg?height=40&width=40&text=A",
                  },
                  createdAt: "2024-03-09T16:45:00Z",
                },
              ],
            },
          ]}
        />
      </div>
    </BlogLayout>
  )
}

