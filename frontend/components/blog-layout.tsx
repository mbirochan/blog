"use client"

import type React from "react"
import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BlogSidebar } from "@/components/blog-sidebar"
import { BlogHeader } from "@/components/blog-header"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function BlogLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { open: isSidebarOpen, setOpen: setIsSidebarOpen } = useSidebar()

  // GSAP animation will be initialized here
  useEffect(() => {
    // This would be where we initialize GSAP animations
    // For example: gsap.from(".content", { opacity: 0, y: 20, duration: 0.5 })
  }, [])

  return (
    <div className="relative min-h-screen">
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={() => setIsSidebarOpen(false)} 
      />
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-background border-r transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <BlogSidebar />
      </aside>

      {/* Main Content */}
      <div className="flex min-h-screen flex-col">
        <BlogHeader />
        <main 
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out pt-14",
            "mx-auto max-w-4xl w-full px-4 md:px-8",
            isSidebarOpen && "md:mr-0 md:ml-64"
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: isSidebarOpen ? 0 : -64 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSidebarOpen ? -64 : 0 }}
              transition={{ duration: 0.3 }}
              className="py-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

