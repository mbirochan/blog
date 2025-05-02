"use client"

import type React from "react"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BlogSidebar } from "@/components/blog-sidebar"
import { BlogHeader } from "@/components/blog-header"
import { SidebarInset } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function BlogLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // GSAP animation will be initialized here
  useEffect(() => {
    // This would be where we initialize GSAP animations
    // For example: gsap.from(".content", { opacity: 0, y: 20, duration: 0.5 })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <BlogSidebar />
      <SidebarInset>
        <BlogHeader />
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="content container py-6 md:py-10"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </SidebarInset>
    </div>
  )
}

