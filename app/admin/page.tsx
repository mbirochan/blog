import { redirect } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth } from "@/lib/auth"
import { PostsList } from "@/components/admin/posts-list"
import { PostEditor } from "@/components/admin/post-editor"
import { CommentsList } from "@/components/admin/comments-list"
import { getAllPosts } from "@/app/actions/post-actions"

export default async function AdminPage() {
  const session = await auth()

  // If not logged in, redirect to login
  if (!session?.user) {
    redirect("/admin/login")
  }

  // Check if user is admin
  const isAdmin = await checkIsAdmin(session.user.id)

  if (!isAdmin) {
    redirect("/admin/login")
  }

  // Get all posts for admin
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
          <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
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

// Helper function to check if user is admin
async function checkIsAdmin(userId: string) {
  const { supabase } = await import("@/lib/supabase")

  const { data } = await supabase.from("profiles").select("role").eq("id", userId).single()

  return data?.role === "admin"
}
