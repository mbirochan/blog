import { BlogLayout } from "@/components/blog-layout"
import { BlogCard } from "@/components/blog-card"
import { getPublishedPosts } from "@/app/actions/post-actions"

export default async function FeaturedPage() {
  const allPosts = await getPublishedPosts()
  const featuredPosts = allPosts.filter((post) => post.featured)

  return (
    <BlogLayout>
      <div className="space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Featured Posts</h1>
          <p className="text-muted-foreground">
            Every post that has been highlighted by the editorial team.
          </p>
        </div>

        {featuredPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-muted-foreground">
            No featured posts yet. Check back soon.
          </p>
        )}
      </div>
    </BlogLayout>
  )
}
