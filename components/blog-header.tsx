"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export function BlogHeader() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="mr-2" />

          <Link href="/" className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <span>
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </span>
            </Button>
          </Link>

          {pathname !== "/" && (
            <Button variant="ghost" size="sm" className="hidden md:flex" onClick={() => window.history.back()}>
              Back
            </Button>
          )}
        </div>

        <div className="flex-1 flex justify-center">
          <AnimatedSearchBar open={searchOpen} setOpen={setSearchOpen} />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)} className="md:hidden">
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  )
}

function AnimatedSearchBar({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) {
  return (
    <div className="relative w-full max-w-md">
      <motion.div
        initial={false}
        animate={{
          width: open ? "100%" : "240px",
        }}
        className={cn("relative md:block", open ? "block" : "hidden md:block")}
      >
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search posts..."
          className="w-full pl-8 md:w-[240px] lg:w-[320px]"
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        />
      </motion.div>
    </div>
  )
}