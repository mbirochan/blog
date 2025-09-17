import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { PostEditor } from "@/components/admin/post-editor"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin"
import { supabase } from "@/lib/supabase"
import { getPostById } from "@/app/actions/post-actions"

type AdminCandidate = {
  id: string
  email?: string | null
}

async function verifyAdmin(user?: AdminCandidate) {
  if (!user?.email) {
    return false
  }

  if (isAdminEmail(user.email)) {
    return true
  }

  if (!supabase) {
    return false
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  return profile?.role === "admin"
}

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/signin?callbackUrl=/admin")
  }

  const isAdmin = await verifyAdmin(session.user)

  if (!isAdmin) {
    redirect("/signin?callbackUrl=/admin")
  }

  const post = await getPostById(params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <Button variant="ghost" asChild>
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
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
  )
}
