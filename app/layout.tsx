import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import {
  getCanonicalUrl,
  getJsonLd,
  getSiteUrl,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/seo"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_AUTHOR}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: SITE_AUTHOR, url: getCanonicalUrl("/") }],
  creator: SITE_AUTHOR,
  publisher: SITE_AUTHOR,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${getCanonicalUrl("/")}#person`,
        name: SITE_AUTHOR,
        url: getCanonicalUrl("/"),
      },
      {
        "@type": "WebSite",
        "@id": `${getCanonicalUrl("/")}#website`,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: getCanonicalUrl("/"),
        publisher: {
          "@id": `${getCanonicalUrl("/")}#person`,
        },
      },
      {
        "@type": "Blog",
        "@id": `${getCanonicalUrl("/")}#blog`,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: getCanonicalUrl("/"),
        author: {
          "@id": `${getCanonicalUrl("/")}#person`,
        },
        publisher: {
          "@id": `${getCanonicalUrl("/")}#person`,
        },
      },
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: getJsonLd(siteJsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider>
            {children}
            <Toaster />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
