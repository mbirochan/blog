import { BlogLayout } from "@/components/blog-layout"
import { BlogCard } from "@/components/blog-card"
import { getPublishedPosts } from "@/app/actions/post-actions"

interface HomeProps {
  searchParams?: Promise<{
    category?: string
  }>
}

const RECENT_POST_LIMIT = 6

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const category = resolvedSearchParams?.category
  const allPosts = await getPublishedPosts()

  const posts = category
    ? allPosts.filter((post) => post.category?.toLowerCase() === category.toLowerCase())
    : allPosts

  const featuredPosts = posts.filter((post) => post.featured).slice(0, 2)
  const recentPosts = posts.filter((post) => !post.featured).slice(0, RECENT_POST_LIMIT)

  const featuredHeading = category ? `Featured ${category} Posts` : "Featured Posts"
  const recentHeading = category ? `More ${category} Posts` : "Recent Posts"

  return (
    <BlogLayout>
      <div className="space-y-10">
        {category && (
          <div className="text-center">
            <h1 className="mb-2 text-4xl font-bold tracking-tight">
              {category.charAt(0).toUpperCase() + category.slice(1)} Posts
            </h1>
            <p className="text-muted-foreground">Explore all posts in the {category} category</p>
          </div>
        )}

        <section>
          <h2 className="mb-6 text-3xl font-bold tracking-tight">{featuredHeading}</h2>
          {featuredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {featuredPosts.map((post) => (
                <BlogCard key={post.id} post={post} featured />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              {category ? `No featured posts found in ${category}.` : "No featured posts available yet."}
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-6 text-3xl font-bold tracking-tight">{recentHeading}</h2>
          {recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              {category ? `No additional posts found in ${category}.` : "No recent posts available."}
            </p>
          )}
        </section>
      </div>
    </BlogLayout>
  )
}
