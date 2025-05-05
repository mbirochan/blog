import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { BlogLayout } from "@/components/blog-layout"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Birochan Blog",
  description: "A personal blog built with Next.js and Express",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <SidebarProvider>
            <BlogLayout>{children}</BlogLayout>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'