import type { Metadata } from "next"
import { BlogLayout } from "@/components/blog-layout"
import { BlogCard } from "@/components/blog-card"
import { supabase, type Post } from "@/lib/supabase"
import {
  getCanonicalUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/seo"

interface HomeProps {
  searchParams?: Promise<{
    category?: string
  }>
}

const RECENT_POST_LIMIT = 6
const FEATURED_POST_LIMIT = 2
const HOME_POST_FIELDS = `
  id,
  title,
  content,
  excerpt,
  author_id,
  category,
  image_url,
  created_at,
  updated_at,
  slug,
  published,
  featured,
  upvotes
`

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const category = resolvedSearchParams?.category?.trim()
  const title = category ? `${category} Posts` : SITE_NAME
  const description = category
    ? `Read ${category} posts by Birochan Mainali.`
    : SITE_DESCRIPTION

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl("/"),
    },
    openGraph: {
      type: "website",
      url: getCanonicalUrl("/"),
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

async function getHomePosts(category?: string) {
  if (!supabase) {
    return { featuredPosts: [], recentPosts: [] }
  }

  let featuredQuery = supabase
    .from("posts")
    .select(HOME_POST_FIELDS)
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(FEATURED_POST_LIMIT)

  let recentQuery = supabase
    .from("posts")
    .select(HOME_POST_FIELDS)
    .eq("published", true)
    .or("featured.is.null,featured.eq.false")
    .order("created_at", { ascending: false })
    .limit(RECENT_POST_LIMIT)

  if (category) {
    featuredQuery = featuredQuery.ilike("category", category)
    recentQuery = recentQuery.ilike("category", category)
  }

  const [featuredResult, recentResult] = await Promise.all([
    featuredQuery,
    recentQuery,
  ])

  if (featuredResult.error) {
    console.error("Error fetching featured posts:", featuredResult.error)
  }

  if (recentResult.error) {
    console.error("Error fetching recent posts:", recentResult.error)
  }

  return {
    featuredPosts: (featuredResult.data || []) as Post[],
    recentPosts: (recentResult.data || []) as Post[],
  }
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const category = resolvedSearchParams?.category?.trim() || undefined
  const { featuredPosts, recentPosts } = await getHomePosts(category)

  const featuredHeading = category ? `Featured ${category} Posts` : "Featured Posts"
  const recentHeading = category ? `More ${category} Posts` : "Recent Posts"

  return (
    <BlogLayout>
      <div className="space-y-10 paper-list-bg -mx-6 -my-8 px-6 py-8 min-h-full">
        {category ? (
          <div className="text-center animate-fade-in-up">
            <h1 className="mb-2 text-4xl font-bold tracking-tight">
              {category.charAt(0).toUpperCase() + category.slice(1)} Posts
            </h1>
            <p className="text-muted-foreground">Explore all posts in the {category} category</p>
          </div>
        ) : (
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tight">{SITE_DESCRIPTION}</h1>
            <p className="mt-3 text-sm text-muted-foreground/70">
              While the thoughts and opinions are mine, I do use AI to help with writing and proper grammar.
            </p>
          </div>
        )}

        <section>
          <h2 className="mb-6 text-3xl font-bold tracking-tight animate-fade-in-up">{featuredHeading}</h2>
          {featuredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {featuredPosts.map((post, i) => (
                <BlogCard key={post.id} post={post} featured index={i} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              {category ? `No featured posts found in ${category}.` : "No featured posts available yet."}
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-6 text-3xl font-bold tracking-tight animate-fade-in-up">{recentHeading}</h2>
          {recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} />
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
