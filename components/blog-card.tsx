import Link from "next/link"
import Image from "next/image"
import { FileText } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Post } from "@/lib/supabase"

interface BlogCardProps {
  post: Post
  featured?: boolean
  index?: number
}

export function BlogCard({ post, featured = false, index = 0 }: BlogCardProps) {
  return (
    <div
      className="h-full animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <Card
          className={cn(
            "h-full overflow-hidden shadow-none transition-all duration-200 hover:border-primary/50 active:scale-[0.98]",
            featured && "md:flex md:flex-row",
          )}
        >
          <div className={cn("relative aspect-video overflow-hidden", featured ? "md:w-1/2" : "w-full")}>
            {post.image_url ? (
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <FileText className="h-12 w-12 text-muted-foreground/40" />
              </div>
            )}
          </div>

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
              <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
            </CardContent>

            <CardFooter className="flex-none pt-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString()}</time>
                <span>•</span>
                <span>{Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200))} min read</span>
              </div>
            </CardFooter>
          </div>
        </Card>
      </Link>
    </div>
  )
}