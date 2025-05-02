export interface Post {
  id: string
  title: string
  slug: string
  date: string
  excerpt: string
  content?: string
  image?: string
  category?: string
  readingTime: number
}

export interface Category {
  id: string
  name: string
}

export const categories: Category[] = [
  { id: "1", name: "Technology" },
  { id: "2", name: "Design" },
  { id: "3", name: "Development" },
  { id: "4", name: "Productivity" },
  { id: "5", name: "Career" },
  { id: "6", name: "Life" },
]

export const allPosts: Post[] = [
  {
    id: "1",
    title: "Getting Started with Next.js 14",
    slug: "getting-started-with-nextjs-14",
    date: "2024-03-10",
    excerpt: "Learn how to build modern web applications with Next.js 14 and its new features.",
    content:
      "<p>Next.js 14 introduces several new features that make building web applications even easier. In this post, we'll explore the new App Router, Server Components, and more.</p><h2>App Router</h2><p>The App Router is a new routing system that allows you to define routes using the file system. It's more intuitive and powerful than the Pages Router.</p><h2>Server Components</h2><p>Server Components allow you to render components on the server, reducing the amount of JavaScript sent to the client. This can lead to faster page loads and better performance.</p>",
    image: "/placeholder.svg?height=600&width=800",
    category: "Development",
    readingTime: 5,
  },
  {
    id: "2",
    title: "Designing with shadcn/ui",
    slug: "designing-with-shadcn-ui",
    date: "2024-03-05",
    excerpt: "Explore the benefits of using shadcn/ui for building beautiful and accessible user interfaces.",
    content:
      "<p>shadcn/ui is a collection of reusable components that you can copy and paste into your apps. It's not a component library, but a set of components that you can use as a starting point for your own design system.</p><p>In this post, we'll explore how to use shadcn/ui to build beautiful and accessible user interfaces.</p>",
    image: "/placeholder.svg?height=600&width=800",
    category: "Design",
    readingTime: 4,
  },
  {
    id: "3",
    title: "Animation Techniques with GSAP and Framer Motion",
    slug: "animation-techniques-with-gsap-and-framer-motion",
    date: "2024-02-28",
    excerpt: "Learn how to create smooth animations using GSAP and Framer Motion in your React applications.",
    image: "/placeholder.svg?height=600&width=800",
    category: "Development",
    readingTime: 7,
  },
  {
    id: "4",
    title: "Building a Blog with Next.js",
    slug: "building-a-blog-with-nextjs",
    date: "2024-02-20",
    excerpt: "A step-by-step guide to creating your own blog using Next.js, MDX, and Tailwind CSS.",
    image: "/placeholder.svg?height=600&width=800",
    category: "Development",
    readingTime: 8,
  },
  {
    id: "5",
    title: "Productivity Tips for Developers",
    slug: "productivity-tips-for-developers",
    date: "2024-02-15",
    excerpt: "Boost your productivity with these practical tips and tools for software developers.",
    category: "Productivity",
    readingTime: 6,
  },
  {
    id: "6",
    title: "The Future of Web Development",
    slug: "the-future-of-web-development",
    date: "2024-02-10",
    excerpt: "Exploring emerging trends and technologies that will shape the future of web development.",
    image: "/placeholder.svg?height=600&width=800",
    category: "Technology",
    readingTime: 5,
  },
  {
    id: "7",
    title: "Mastering TypeScript",
    slug: "mastering-typescript",
    date: "2024-02-05",
    excerpt: "Advanced TypeScript techniques to improve your code quality and developer experience.",
    category: "Development",
    readingTime: 9,
  },
  {
    id: "8",
    title: "Responsive Design Best Practices",
    slug: "responsive-design-best-practices",
    date: "2024-01-30",
    excerpt: "Learn how to create websites that look great on any device with these responsive design principles.",
    image: "/placeholder.svg?height=600&width=800",
    category: "Design",
    readingTime: 6,
  },
]

export const featuredPosts = allPosts.slice(0, 2)
export const recentPosts = allPosts.slice(2, 8)

