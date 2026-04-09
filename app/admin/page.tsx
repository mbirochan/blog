import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth } from "@/lib/auth"
import { PostsList } from "@/components/admin/posts-list"
import { PostEditor } from "@/components/admin/post-editor"
import { CommentsList } from "@/components/admin/comments-list"
import { getAllPosts } from "@/app/actions/post-actions"
import { verifyAdmin } from "@/lib/admin"
import { BlogLayout } from "@/components/blog-layout"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/signin")
  }

  const isAdmin = await verifyAdmin(session.user)

  if (!isAdmin) {
    redirect("/")
  }

  const posts = await getAllPosts()

  return (
    <BlogLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

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
    </BlogLayout>
  )
}
