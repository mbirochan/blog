import { notFound, redirect } from "next/navigation"

import { PostEditor } from "@/components/admin/post-editor"
import { auth } from "@/lib/auth"
import { verifyAdmin } from "@/lib/admin"
import { getPostById } from "@/app/actions/post-actions"
import { BlogLayout } from "@/components/blog-layout"

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/signin")
  }

  const isAdmin = await verifyAdmin(session.user)

  if (!isAdmin) {
    redirect("/")
  }

  const post = await getPostById(id)

  if (!post) {
    notFound()
  }

  return (
    <BlogLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <PostEditor
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          category: post.category ?? "",
          image_url: post.image_url ?? "",
          published: post.published ?? false,
          featured: post.featured ?? false,
        }}
      />
      </div>
    </BlogLayout>
  )
}
