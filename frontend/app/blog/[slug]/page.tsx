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
import { use } from "react"
import { getPostBySlug } from '@/lib/api'

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

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
        <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to blog
        </Link>

        <article className="prose dark:prose-invert mx-auto">
          <h1>{post.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{post.category}</span>
            <span>•</span>
            <time>{post.date}</time>
          </div>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        <Separator className="my-10" />

        <CommentSection
          postId={post.id}
          isLoggedIn={Math.random() > 0.5}
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

