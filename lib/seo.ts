import type { Metadata } from "next"

export const SITE_NAME = "Birochan Mainali Blog"
export const SITE_AUTHOR = "Birochan Mainali"
export const SITE_DESCRIPTION =
  "Software engineering notes, product thinking, and personal essays from Birochan Mainali."
export const PRODUCTION_SITE_URL = "https://blog-delta-ashy-90.vercel.app"

function withProtocol(value: string) {
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`
}

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXTAUTH_URL ||
    ""
  const isLocalConfiguredUrl =
    configuredUrl.includes("localhost") ||
    configuredUrl.includes("127.0.0.1") ||
    configuredUrl.includes("::1")
  const raw =
    configuredUrl && !isLocalConfiguredUrl
      ? configuredUrl
      : PRODUCTION_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")

  return withProtocol(raw).replace(/\/+$/, "")
}

export function getCanonicalUrl(path = "/") {
  return new URL(path, `${getSiteUrl()}/`).toString()
}

export function getAbsoluteUrl(value?: string | null) {
  if (!value) {
    return null
  }

  try {
    return new URL(value, `${getSiteUrl()}/`).toString()
  } catch {
    return null
  }
}

export function stripHtml(value?: string | null) {
  return (value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

export function getPostDescription(excerpt?: string | null, content?: string | null) {
  const description = stripHtml(excerpt) || stripHtml(content)

  if (description.length <= 155) {
    return description
  }

  return `${description.slice(0, 152).trim()}...`
}

export function getJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}

export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}
