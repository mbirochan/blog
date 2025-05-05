export interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  date: string
  category: string
  slug: string
}

export interface Category {
  id: number
  name: string
  slug: string
  count: number
} 