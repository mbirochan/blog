'use client';

import Link from 'next/link';
import { getAllPosts } from '@/lib/api'
import { BlogPostCard } from '@/components/blog-post-card'

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Blog Posts</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map(post => (
          <BlogPostCard
            key={post.id}
            title={post.title}
            excerpt={post.excerpt}
            date={post.date}
            category={post.category}
            slug={post.slug}
          />
        ))}
      </div>
    </div>
  )
}

function BlogPostCard({
  title,
  excerpt,
  date,
  category,
  slug,
}: {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug: string;
}) {
  return (
    <article className="group rounded-lg border hover:border-foreground/20 transition-colors">
      <Link href={`/blog/${slug}`}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium">{category}</span>
            <span className="text-sm text-muted-foreground">{date}</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground">{excerpt}</p>
        </div>
      </Link>
    </article>
  );
} 