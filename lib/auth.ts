import NextAuth, { type NextAuthOptions, getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

import { ADMIN_SUPABASE_USER_ID, isAdminEmail, syncUserRole } from "./admin"
import { supabaseAdmin } from "./supabase-admin"

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
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

        if (!isAdminEmail(email)) {
          throw new Error("Email not authorized")
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
        await syncUserRole(ADMIN_SUPABASE_USER_ID, email, ADMIN_NAME)

        return {
          id: ADMIN_SUPABASE_USER_ID,
          email,
          name: ADMIN_NAME,
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

      if (!email || !isAdminEmail(email)) {
        return false
      }

      if (account?.provider === "google") {
        user.id = ADMIN_SUPABASE_USER_ID
        user.email = email
        user.name = user.name || ADMIN_NAME
        await syncUserRole(ADMIN_SUPABASE_USER_ID, email, user.name ?? ADMIN_NAME)
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = ADMIN_SUPABASE_USER_ID
        token.email = user.email?.trim().toLowerCase() ?? token.email
        token.name = user.name || ADMIN_NAME
        token.role = isAdminEmail(token.email as string | undefined) ? "admin" : "user"
      }

      if (!token.role && typeof token.email === "string") {
        token.role = isAdminEmail(token.email) ? "admin" : "user"
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || ADMIN_SUPABASE_USER_ID
        session.user.email = (token.email as string) || session.user.email
        session.user.name = (token.name as string) || session.user.name || ADMIN_NAME
        session.user.role = (token.role as "admin" | "user") || session.user.role || "user"
      }

      return session
    },
  },
  pages: {
    signIn: "/signin",
    signOut: "/api/auth/signout",
    error: "/api/auth/error",
    verifyRequest: "/api/auth/verify-request",
  },
}

export async function auth() {
  return getServerSession(authConfig)
}

const handler = NextAuth(authConfig)

export const handlers = { GET: handler, POST: handler }

export { signIn, signOut } from "next-auth/react"
