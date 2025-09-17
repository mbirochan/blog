import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

const supabaseKey = process.env.SUPABASE_ANON_KEY || ""

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
  author?: string | null
  author_id?: string | null
  category?: string | null
  image_url?: string | null
  created_at: string
  updated_at?: string | null
  slug: string
  published: boolean
  featured?: boolean | null
  tags?: string[] | null
  upvotes?: number | null
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
  role: "user" | "admin"
  created_at: string
}
