import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth } from "@/lib/auth"
import { PostsList } from "@/components/admin/posts-list"
import { PostEditor } from "@/components/admin/post-editor"
import { CommentsList } from "@/components/admin/comments-list"
import { Button } from "@/components/ui/button"
import { getAllPosts } from "@/app/actions/post-actions"
import { isAdminEmail } from "@/lib/admin"
import { supabase } from "@/lib/supabase"

type AdminCandidate = {
  id: string
  email?: string | null
}

async function checkIsAdmin(user: AdminCandidate) {
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
    .single()

  return profile?.role === "admin"
}

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/signin")
  }

  const isAdmin = await checkIsAdmin(session.user)

  if (!isAdmin) {
    redirect("/")
  }

  const posts = await getAllPosts()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="posts">
        <TabsList className="mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="new">New Post</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          <h2 className="text-2xl font-bold">Manage Posts</h2>
          <PostsList posts={posts} />
        </TabsContent>

        <TabsContent value="new">
          <h2 className="mb-6 text-2xl font-bold">Create New Post</h2>
          <PostEditor />
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <h2 className="text-2xl font-bold">Manage Comments</h2>
          <CommentsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
