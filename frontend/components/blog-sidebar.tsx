"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Bookmark, Calendar, Hash, Home, Search, Settings, Sparkles, User, X } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { getPosts, getCategories, Post, Category } from "@/lib/supabase"

export function BlogSidebar() {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const { open: isOpen, setOpen } = useSidebar()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Set sidebar to closed on initial load
    setOpen(false)
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const [fetchedPosts, fetchedCategories] = await Promise.all([
          getPosts(),
          getCategories()
        ])
        setPosts(fetchedPosts)
        setCategories(fetchedCategories)
      } catch (err) {
        setError('Failed to fetch data')
        console.error('Error fetching data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredPosts = searchQuery
    ? posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <Sidebar className="h-full">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3 relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5 text-sm">
            <h3 className="font-medium">My Blog</h3>
            <p className="text-xs text-muted-foreground">Personal thoughts & ideas</p>
          </div>
          <button
            className="absolute right-2 top-1 p-1 rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring md:block"
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search posts..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 max-h-[200px] overflow-auto rounded-md border bg-popover p-2 text-sm"
            >
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="block rounded-md px-2 py-1.5 hover:bg-accent"
                    onClick={() => setSearchQuery("")}
                  >
                    {post.title}
                  </Link>
                ))
              ) : (
                <p className="px-2 py-1.5 text-muted-foreground">No posts found</p>
              )}
            </motion.div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/blog">
                    <Sparkles className="h-4 w-4" />
                    <span>Blog</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Bookmark className="h-4 w-4" />
                  <span>Bookmarks</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Calendar className="h-4 w-4" />
                  <span>Archive</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading categories...</div>
            ) : error ? (
              <div className="px-2 py-1.5 text-sm text-destructive">Failed to load categories</div>
            ) : categories.length > 0 ? (
              <SidebarMenu>
                {categories.map((category) => (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton asChild>
                      <Link href={`/blog/category/${category.slug}`}>
                        <Hash className="h-4 w-4" />
                        <span>{category.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No categories available</div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Recent Posts</SidebarGroupLabel>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading posts...</div>
            ) : error ? (
              <div className="px-2 py-1.5 text-sm text-destructive">Failed to load posts</div>
            ) : posts.length > 0 ? (
              <SidebarMenu>
                {posts.slice(0, 5).map((post) => (
                  <SidebarMenuItem key={post.id}>
                    <SidebarMenuButton asChild isActive={pathname === `/blog/${post.slug}`}>
                      <Link href={`/blog/${post.slug}`}>
                        <span>{post.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No posts available</div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User className="h-4 w-4" />
              <span>Admin Login</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

