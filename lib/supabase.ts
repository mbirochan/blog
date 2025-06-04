
import { createClient } from "@supabase/supabase-js"

// Support both public and server-side environment variable names
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ""

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ""

// Only create the client if credentials are provided
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Database schema types
export type Post = {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  created_at: string
  updated_at: string
  slug: string
  published: boolean
  tags: string[]
  upvotes: number
}

export type Comment = {
  id: string
  post_id: string
  author: string
  content: string
  created_at: string
}

export type Profile = {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: 'user' | 'admin'
  created_at: string
}
