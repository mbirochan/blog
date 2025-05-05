import Link from 'next/link'

interface BlogPostCardProps {
  title: string
  excerpt: string
  date: string
  category: string
  slug: string
}

export function BlogPostCard({ title, excerpt, date, category, slug }: BlogPostCardProps) {
  return (
    <Link href={`/blog/${slug}`}>
      <div className="group rounded-lg border p-6 hover:border-foreground/20 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium">{category}</span>
          <span className="text-sm text-muted-foreground">{date}</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{excerpt}</p>
      </div>
    </Link>
  )
} 