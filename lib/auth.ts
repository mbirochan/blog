
import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { SupabaseAdapter } from "@next-auth/supabase-adapter"

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "",
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || "",
          pass: process.env.EMAIL_SERVER_PASSWORD || "",
        },
      },
      from: process.env.EMAIL_FROM || "",
    }),
  ],
  adapter: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
    ? SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
      })
    : undefined,
  callbacks: {
    async session({ session, user }) {
      if (session?.user && user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: "/api/auth/signin",
    signOut: "/api/auth/signout",
    error: "/api/auth/error",
    verifyRequest: "/api/auth/verify-request",
  },
}

const nextAuth = NextAuth(authConfig)

export const { handlers, auth, signIn, signOut } = nextAuth
export { nextAuth as default }
