import type { Metadata } from "next"
import { cache, Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react"
import { BlogLayout } from "@/components/blog-layout"
import { CommentSection } from "@/components/comment-section"
import { UpvoteButton } from "@/components/upvote-button"
import { ImageGallery } from "@/components/image-gallery"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getPostBySlug } from "@/app/actions/post-actions"
import { getComments } from "@/app/actions/comment-actions"
import { getUpvoteStatus } from "@/app/actions/upvote-actions"
import { auth } from "@/lib/auth"

const getCachedPost = cache((slug: string) => getPostBySlug(slug))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getCachedPost(slug)
  if (!post) return { title: "Post Not Found" }
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getCachedPost(slug)

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

  const postImages = post.image_url
    ? [post.image_url]
    : []

  return (
    <BlogLayout>
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors duration-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        <article className="prose prose-stone dark:prose-invert prose-lg max-w-none prose-headings:leading-tight prose-p:leading-relaxed">
          <div className="flex flex-wrap items-center gap-3 mb-6 not-prose">
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
              <span>{Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200))} min read</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>

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
