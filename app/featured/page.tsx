import type { Metadata } from "next"
import { BlogLayout } from "@/components/blog-layout"
import { BlogCard } from "@/components/blog-card"
import { getPublishedPosts } from "@/app/actions/post-actions"
import { getCanonicalUrl, SITE_AUTHOR } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Featured Posts",
  description: `Highlighted posts by ${SITE_AUTHOR}.`,
  alternates: {
    canonical: getCanonicalUrl("/featured"),
  },
  openGraph: {
    type: "website",
    url: getCanonicalUrl("/featured"),
    title: "Featured Posts",
    description: `Highlighted posts by ${SITE_AUTHOR}.`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Featured Posts",
    description: `Highlighted posts by ${SITE_AUTHOR}.`,
  },
}

export default async function FeaturedPage() {
  const allPosts = await getPublishedPosts()
  const featuredPosts = allPosts.filter((post) => post.featured)

  return (
    <BlogLayout>
      <div className="space-y-10 paper-list-bg -mx-6 -my-8 px-6 py-8 min-h-full">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight">Featured Posts</h1>
          <p className="text-muted-foreground">
            Every post that has been highlighted by the editorial team.
          </p>
        </div>

        {featuredPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
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
