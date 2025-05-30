import { createClient } from "@supabase/supabase-js"

// These would be environment variables in a real application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_KEY || ""

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseKey)

// Database schema types
export type Post = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  image_url: string
  published: boolean
  created_at: string
  updated_at: string
  author_id: string
  upvotes: number
}

export type Comment = {
  id: string
  content: string
  post_id: string
  user_id: string
  parent_id: string | null
  created_at: string
}

export type Profile = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  created_at: string
}
