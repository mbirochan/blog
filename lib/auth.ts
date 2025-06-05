
import NextAuth, { type NextAuthOptions, getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { SupabaseAdapter } from "@next-auth/supabase-adapter"

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: "smtp.sendgrid.net",
        port: 587,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY!,
        },
      },
      from: `${process.env.SENDGRID_FROM_NAME!} <${process.env.SENDGRID_FROM_EMAIL!}>`,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id
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



