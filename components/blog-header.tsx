"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export function BlogHeader() {
  const pathname = usePathname()

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

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}