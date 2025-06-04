import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Post } from "@/lib/supabase"

interface BlogCardProps {
  post: Post
  featured?: boolean
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <div className="h-full transition-transform hover:-translate-y-1 duration-200">
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <Card
          className={cn(
            "h-full overflow-hidden transition-colors hover:border-primary/50",
            featured && "md:flex md:flex-row",
          )}
        >
          {post.image_url && (
            <div className={cn("aspect-video overflow-hidden", featured ? "md:w-1/2" : "w-full")}>
              <img
                src={post.image_url || "/placeholder.svg"}
                alt={post.title}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
          )}

          <div className={cn("flex flex-col", featured && "md:w-1/2")}>
            <CardHeader className="flex-none">
              <div className="space-y-1">
                {post.category && (
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                )}
                <h3 className="text-xl font-bold leading-tight">{post.title}</h3>
              </div>
            </CardHeader>

            <CardContent className="flex-grow">
              <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
            </CardContent>

            <CardFooter className="flex-none pt-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString()}</time>
                <span>•</span>
                <span>{Math.ceil(post.content.length / 1000)} min read</span>
              </div>
            </CardFooter>
          </div>
        </Card>
      </Link>
    </div>
  )
}