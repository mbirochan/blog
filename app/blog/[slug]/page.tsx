import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react"
import { BlogLayout } from "@/components/blog-layout"
import { CommentSection } from "@/components/comment-section"
import { UpvoteButton } from "@/components/upvote-button"
import { ImageGallery } from "@/components/image-gallery"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getPostBySlug, getComments } from "@/app/actions/post-actions"
import { getUpvoteStatus } from "@/app/actions/upvote-actions"
import { auth } from "@/lib/auth"

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  // Get upvote status
  const { upvotes, hasUpvoted } = await getUpvoteStatus(post.id)

  // Get comments
  const { comments } = await getComments(post.id)

  // Get current user
  const session = await auth()
  const isLoggedIn = !!session?.user
  const currentUser = session?.user
    ? {
        name: session.user.name || "Anonymous",
        email: session.user.email || "",
      }
    : null

  // For demo purposes, let's create an array of images
  const postImages = post.image_url
    ? [
        post.image_url,
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
              <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString()}</time>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              <span>{Math.ceil(post.content.length / 1000)} min read</span>
            </div>
          </div>

          <h1>{post.title}</h1>

          <div className="flex items-center gap-4 my-6">
            <UpvoteButton postId={post.id} initialUpvotes={upvotes} initialHasUpvoted={hasUpvoted} />
          </div>

          {postImages.length > 0 && (
            <div className="my-6">
              <ImageGallery images={postImages} alt={post.title} />
            </div>
          )}

          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        <Separator className="my-10" />

        <Suspense fallback={<div>Loading comments...</div>}>
          <CommentSection postId={post.id} comments={comments} isLoggedIn={isLoggedIn} currentUser={currentUser} />
        </Suspense>
      </div>
    </BlogLayout>
  )
}
