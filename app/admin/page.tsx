import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth } from "@/lib/auth"
import { PostsList } from "@/components/admin/posts-list"
import { PostEditor } from "@/components/admin/post-editor"
import { CommentsList } from "@/components/admin/comments-list"
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
    redirect("/signin?callbackUrl=/admin")
  }

  const isAdmin = await checkIsAdmin(session.user)

  if (!isAdmin) {
    redirect("/signin?callbackUrl=/admin")
  }

  const posts = await getAllPosts()

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

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
