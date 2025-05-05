"use client"

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { BlogPostCard } from '@/components/blog-post-card';
import { CategoryCard } from '@/components/category-card';
import { getFeaturedPosts, getCategories } from '@/lib/api';

export default async function Home() {
  const [featuredPosts, categories] = await Promise.all([
    getFeaturedPosts(),
    getCategories()
  ]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 mb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Welcome to Birochan Blog</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Sharing thoughts, ideas, and experiences
          </p>
          <Link
            href="/blog"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "font-semibold"
            )}
          >
            Read Blog Posts
          </Link>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="w-full py-16">
        <h2 className="text-3xl font-bold mb-8">Featured Posts</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {featuredPosts.map(post => (
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
      </section>

      {/* Categories Section */}
      <section className="w-full py-16">
        <h2 className="text-3xl font-bold mb-8">Categories</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              title={category.name}
              count={category.count}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ title, count }: { title: string; count: number }) {
  return (
    <div className="group rounded-lg border p-6 hover:border-foreground/20 transition-colors">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{count} posts</p>
    </div>
  );
}

