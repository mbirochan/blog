
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

// Only create the client if we have real credentials
export const supabase = supabaseUrl !== "https://placeholder.supabase.co" && supabaseKey !== "placeholder-key" 
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
