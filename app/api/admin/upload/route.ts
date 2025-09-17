import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { isAdminEmail } from "@/lib/admin"

const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "blog-images"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Storage client not configured" }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const extension = file.name.split(".").pop()?.toLowerCase() || "bin"
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
  const filePath = `posts/${filename}`

  const { error: uploadError } = await supabaseAdmin.storage.from(bucketName).upload(filePath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  })

  if (uploadError) {
    console.error("Failed to upload image", uploadError)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }

  const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath)

  if (!data?.publicUrl) {
    return NextResponse.json({ error: "Could not retrieve public URL" }, { status: 500 })
  }

  return NextResponse.json({ url: data.publicUrl, path: filePath })
}
