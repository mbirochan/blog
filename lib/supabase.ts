
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
  slug: string
  content: string
  excerpt: string
  author_id: string
  category: string
  published: boolean
  featured: boolean
  image_url?: string
  tags: string[]
  upvotes: number
  created_at: string
  updated_at: string
  author?: {
    name: string
    email: string
  }
}

export type Comment = {
  id: string
  content: string
  post_id: string
  user_id: string
  parent_id?: string
  created_at: string
  user?: {
    name: string
    email: string
  }
  replies?: Comment[]
}

export type Profile = {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  created_at: string
}
