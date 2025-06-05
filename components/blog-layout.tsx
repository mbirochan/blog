"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { BlogSidebar } from "@/components/blog-sidebar"
import { BlogHeader } from "@/components/blog-header"
import { SidebarInset } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function BlogLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()


  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      <div className="flex min-h-screen pt-16">
        <BlogSidebar />
        <main className="flex-1 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}