import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

type CategoryRow = {
  category: string | null
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ categories: [] }, { status: 200 })
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("category")
      .eq("published", true)
      .not("category", "is", null)
      .order("category", { ascending: true })

    if (error) throw error

    const categoriesByKey = new Map<string, { id: string; name: string }>()

    for (const post of (data || []) as CategoryRow[]) {
      const name = post.category?.trim()

      if (!name) {
        continue
      }

      const key = name.toLowerCase()

      if (!categoriesByKey.has(key)) {
        categoriesByKey.set(key, { id: key, name })
      }
    }

    const categories = Array.from(categoriesByKey.values()).sort((a, b) => {
      return (
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }) ||
        a.name.localeCompare(b.name)
      )
    })

    return NextResponse.json({ categories }, { status: 200 })
  } catch (err) {
    console.error("Error fetching categories API:", err)
    return NextResponse.json({ categories: [] }, { status: 200 })
  }
}


