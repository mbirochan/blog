import { BlogLayout } from "@/components/blog-layout"
import { BlogCard } from "@/components/blog-card"
import { getPublishedPosts } from "@/app/actions/post-actions"
import { categories } from "@/lib/blog-data"

interface HomeProps {
  searchParams: { category?: string }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string | undefined; }>; }) {
  const resolvedSearchParams = await searchParams
  const category = resolvedSearchParams?.category
  const allPosts = await getPublishedPosts()

  // Filter posts by category if specified
  const posts = category 
    ? allPosts.filter(post => 
        post.category?.toLowerCase() === category?.toLowerCase()
      )
    : allPosts

  // Split posts into featured and recent
  const featuredPosts = posts.slice(0, 2)
  const recentPosts = posts.slice(2)

  return (
    <BlogLayout>
      <div className="space-y-10">
        {category && (
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              {category.charAt(0).toUpperCase() + category.slice(1)} Posts
            </h1>
            <p className="text-muted-foreground">
              Explore all posts in the {category} category
            </p>
          </div>
        )}

        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            {category ? `Featured ${category} Posts` : "Featured Posts"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.map((post) => (
              <BlogCard key={post.id} post={post} featured />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            {category ? `More ${category} Posts` : "Recent Posts"}
          </h2>
          {recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {category 
                ? `No posts found in the ${category} category.`
                : "No recent posts available."
              }
            </p>
          )}
        </section>
      </div>
    </BlogLayout>
  )
}