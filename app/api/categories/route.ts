import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ categories: [] }, { status: 200 })
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("category")
      .neq("category", null)

    if (error) throw error

    const unique = Array.from(new Set((data || []).map((p: any) => (p.category as string) ?? "")))
      .filter(Boolean)
      .map((name) => ({ id: name, name }))

    return NextResponse.json({ categories: unique }, { status: 200 })
  } catch (err) {
    console.error("Error fetching categories API:", err)
    return NextResponse.json({ categories: [] }, { status: 200 })
  }
}


