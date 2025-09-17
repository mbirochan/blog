import NextAuth, { type NextAuthOptions, getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { randomUUID } from "crypto"
import { networkInterfaces } from "os"

import { ADMIN_SUPABASE_USER_ID, isAdminEmail, syncUserRole } from "./admin"
import { supabaseAdmin } from "./supabase-admin"

function normalizeUrl(candidate?: string | null) {
  if (!candidate) {
    return undefined
  }

  return candidate.startsWith("http://") || candidate.startsWith("https://")
    ? candidate
    : `https://${candidate}`
}

function isLoopbackHost(url: string) {
  try {
    const { hostname } = new URL(url)
    return hostname === "localhost" || hostname === "127.0.0.1"
  } catch {
    return false
  }
}

function isPrivateIPv4(address: string) {
  return /^10\./.test(address) || /^192\.168\./.test(address) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
}

function discoverLocalNetworkUrl() {
  try {
    const interfaces = networkInterfaces()
    for (const net of Object.values(interfaces)) {
      if (!net) continue
      for (const address of net) {
        const family = typeof address.family === "string" ? address.family : `${address.family}`
        if ((family === "IPv4" || family === "4") && !address.internal && isPrivateIPv4(address.address)) {
          const port = process.env.PORT || "3000"
          return `http://${address.address}:${port}`
        }
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to detect local network interface for auth URLs:", error)
    }
  }

  return undefined
}

const priorityUrls = [
  normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL),
  normalizeUrl(process.env.NEXTAUTH_URL),
  normalizeUrl(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""),
].filter(Boolean) as string[]

const fallbackUrl = priorityUrls.length > 0 ? priorityUrls[0] : undefined

const resolvedSiteUrl =
  priorityUrls.find((url) => url && !isLoopbackHost(url)) ??
  discoverLocalNetworkUrl() ??
  fallbackUrl ??
  "http://localhost:3000"

const siteUrl = new URL(resolvedSiteUrl)
const isSecureSite = siteUrl.protocol === "https:"
const isPrivateSite = isPrivateIPv4(siteUrl.hostname)
const sanitizedHost = siteUrl.hostname.replace(/[^a-zA-Z0-9]/g, '-') || 'localhost'
const googlePrivateDeviceParams = isPrivateSite
  ? {
      device_id: `web-${sanitizedHost}`,
      device_name: `BirochanBlog-${sanitizedHost}`,
    }
  : null


if (isSecureSite) {
  process.env.AUTH_TRUST_HOST ||= "true"
} else if (process.env.AUTH_TRUST_HOST) {
  process.env.AUTH_TRUST_HOST = ""
}

if (!process.env.NEXTAUTH_URL || isLoopbackHost(process.env.NEXTAUTH_URL)) {
  process.env.NEXTAUTH_URL = siteUrl.origin
}

if (!process.env.NEXTAUTH_URL_INTERNAL) {
  process.env.NEXTAUTH_URL_INTERNAL = process.env.NEXTAUTH_URL
}

// Extend the built-in session and JWT types
// eslint-disable-next-line @typescript-eslint/no-namespace
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: "admin" | "user"
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    name?: string | null
    email?: string | null
    role?: "admin" | "user"
  }
}

const ADMIN_NAME = process.env.ADMIN_NAME || "Birochan Mainali"

export const authConfig: NextAuthOptions = {
  debug: true,
  trustHost: true,
  useSecureCookies: isSecureSite,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      ...(googlePrivateDeviceParams ? { authorization: { params: googlePrivateDeviceParams } } : {}),
    }),
    CredentialsProvider({
      id: "otp",
      name: "One-Time Password",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase()
        const otp = credentials?.otp?.trim()

        if (!email || !otp) {
          throw new Error("Missing email or OTP")
        }

        if (!supabaseAdmin) {
          throw new Error("Supabase admin client unavailable")
        }

        const { data, error } = await supabaseAdmin
          .from("auth_email_otps")
          .select("code, expires_at")
          .eq("email", email)
          .single()

        if (error || !data) {
          throw new Error("Invalid OTP")
        }

        const isExpired = new Date(data.expires_at).getTime() < Date.now()
        if (data.code !== otp || isExpired) {
          throw new Error("Invalid OTP")
        }

        await supabaseAdmin.from("auth_email_otps").delete().eq("email", email)

        // Reuse existing profile id if available; otherwise generate a new UUID
        const { data: existingProfile } = await supabaseAdmin
          .from("profiles")
          .select("id, name")
          .eq("email", email)
          .maybeSingle()

        const userId = existingProfile?.id || randomUUID()
        const displayName = existingProfile?.name || email.split("@")[0]

        await syncUserRole(userId, email, displayName)

        return {
          id: isAdminEmail(email) ? ADMIN_SUPABASE_USER_ID : userId,
          email,
          name: isAdminEmail(email) ? ADMIN_NAME : displayName,
        }
      },
    }),
  ],
  logger: {
    error(code, metadata) {
      console.error("NextAuth logger error", code, metadata)
    },
    warn(code) {
      console.warn("NextAuth logger warn", code)
    },
    debug(code, metadata) {
      console.debug("NextAuth logger debug", code, metadata)
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      const email = user?.email?.trim().toLowerCase()

      if (!email) {
        return false
      }

      // Allow all valid emails to sign in
      if (account?.provider === "google") {
        // For admin users, use the predefined admin ID
        // For non-admin users, check if profile exists, otherwise generate new UUID
        let userId: string
        
        if (isAdminEmail(email)) {
          userId = ADMIN_SUPABASE_USER_ID
        } else {
          // Check if user already exists in profiles table
          const { data: existingProfile } = await supabaseAdmin
            ?.from("profiles")
            .select("id")
            .eq("email", email)
            .maybeSingle() || { data: null }
          
          userId = existingProfile?.id || randomUUID()
        }
        
        user.id = userId
        user.email = email
        user.name = user.name || (isAdminEmail(email) ? ADMIN_NAME : email.split('@')[0])
        
        try {
          await syncUserRole(userId, email, user.name ?? (isAdminEmail(email) ? ADMIN_NAME : email.split('@')[0]))
        } catch (error) {
          console.error("Failed to sync user role during sign-in:", error)
          // Don't block sign-in if profile sync fails, but log the error
        }
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || token.id
        token.email = user.email?.trim().toLowerCase() ?? token.email
        token.name = user.name || token.name
        token.role = isAdminEmail(token.email as string | undefined) ? "admin" : "user"
      }

      if (!token.role && typeof token.email === "string") {
        token.role = isAdminEmail(token.email) ? "admin" : "user"
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || session.user.id
        session.user.email = (token.email as string) || session.user.email
        session.user.name = (token.name as string) || session.user.name
        session.user.role = (token.role as "admin" | "user") || "user"
      }

      return session
    },
  },
  pages: {
    signIn: "/signin",
    signOut: "/api/auth/signout",
    error: "/api/auth/error",
    verifyRequest: "/api/auth/verify-request",
  }
}

export async function auth() {
  return getServerSession(authConfig)
}

const handler = NextAuth(authConfig)

export const handlers = { GET: handler, POST: handler }

export { signIn, signOut } from "next-auth/react"
