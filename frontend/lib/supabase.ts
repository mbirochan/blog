import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Post = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category_id: string
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
}

export async function getPosts() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }
  
  return posts as Post[]
}

export async function getCategories() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  return categories as Category[]
}

export async function getPostsByCategory(categoryId: string) {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching posts by category:', error)
    return []
  }
  
  return posts as Post[]
} 