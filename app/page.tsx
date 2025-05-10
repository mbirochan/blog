import { BlogLayout } from "@/components/blog-layout"
import { BlogCard } from "@/components/blog-card"
import { getPublishedPosts } from "@/app/actions/post-actions"

export default async function Home() {
  const posts = await getPublishedPosts()

  // Split posts into featured and recent
  const featuredPosts = posts.slice(0, 2)
  const recentPosts = posts.slice(2)

  return (
    <BlogLayout>
      <div className="space-y-10">
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-6">Featured Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.map((post) => (
              <BlogCard key={post.id} post={post} featured />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-6">Recent Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </div>
    </BlogLayout>
  )
}
